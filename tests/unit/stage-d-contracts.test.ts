import { describe, expect, it } from "vitest";
import {
  buildPrivacyPayload,
  canAccessFullContent,
  channelFromReferrer,
  computeLedgerNet,
  isAnonymousAllowedEvent,
  isValidTierPrice,
  mapStripeSubscriptionStatus,
  membershipGrantsAccess,
  minimizeReferrer,
  previewBody,
  readerMembershipLabel,
  stripeCheckoutBlockedReason,
} from "../../src/lib/posts/stage-d-contracts";
import {
  isStripeConfigured,
  verifyStripeWebhookSignature,
} from "../../src/lib/payments/stripe";
import { createHmac } from "crypto";

describe("Stage D analytics privacy", () => {
  it("minimizes referrers and buckets channels", () => {
    expect(minimizeReferrer("https://news.google.com/search?q=secret")).toBe(
      "news.google.com/search"
    );
    expect(channelFromReferrer(null)).toBe("direct");
    expect(channelFromReferrer("www.google.com")).toBe("search");
    expect(channelFromReferrer("twitter.com/x")).toBe("social");
    expect(isAnonymousAllowedEvent("view")).toBe(true);
    expect(isAnonymousAllowedEvent("checkout_start")).toBe(false);
  });

  it("builds coarse payloads without query strings", () => {
    const payload = buildPrivacyPayload({
      referrer: "https://example.com/path?email=a@b.com",
      path: "/p/hello",
      userAgent: "Mozilla/5.0 (iPhone)",
    });
    expect(payload.referrer_host).toBe("example.com/path");
    expect(payload.device).toBe("mobile");
    expect(JSON.stringify(payload)).not.toContain("a@b.com");
  });
});

describe("Stage D entitlements", () => {
  it("gates full content by access level", () => {
    expect(
      canAccessFullContent({
        accessLevel: "public",
        isAuthor: false,
        isPublicationMember: false,
        hasEntitlement: false,
      })
    ).toBe(true);
    expect(
      canAccessFullContent({
        accessLevel: "paid",
        isAuthor: false,
        isPublicationMember: false,
        hasEntitlement: false,
      })
    ).toBe(false);
    expect(
      canAccessFullContent({
        accessLevel: "members",
        isAuthor: true,
        isPublicationMember: false,
        hasEntitlement: false,
      })
    ).toBe(true);
  });

  it("previews truncated bodies and maps membership states", () => {
    expect(previewBody("a".repeat(400), 10).endsWith("…")).toBe(true);
    expect(membershipGrantsAccess("active")).toBe(true);
    expect(membershipGrantsAccess("past_due")).toBe(true);
    expect(membershipGrantsAccess("canceled")).toBe(false);
    expect(readerMembershipLabel("past_due")).toMatch(/past due/i);
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("nope")).toBeNull();
  });

  it("validates tier pricing", () => {
    expect(isValidTierPrice({ isFree: true })).toBe(true);
    expect(
      isValidTierPrice({ isFree: false, amountCents: 500, interval: "month" })
    ).toBe(true);
    expect(
      isValidTierPrice({ isFree: false, amountCents: 500, interval: null })
    ).toBe(false);
  });
});

describe("Stage D ledger", () => {
  it("computes net from gross fees refunds", () => {
    const summary = computeLedgerNet([
      { kind: "gross", amountCents: 1000 },
      { kind: "platform_fee", amountCents: -100 },
      { kind: "stripe_fee", amountCents: -30 },
      { kind: "refund", amountCents: -200 },
      { kind: "payout", amountCents: -500 },
    ]);
    expect(summary.gross).toBe(1000);
    expect(summary.fees).toBe(130);
    expect(summary.refunds).toBe(200);
    expect(summary.net).toBe(670);
    expect(summary.payouts).toBe(500);
  });
});

describe("Stage D Stripe env contract", () => {
  it("does not report configured without env", () => {
    const keys = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ] as const;
    const prev = keys.map((k) => process.env[k]);
    for (const k of keys) delete process.env[k];
    expect(isStripeConfigured()).toBe(false);
    expect(stripeCheckoutBlockedReason(false)).toMatch(/not configured/i);
    keys.forEach((k, i) => {
      if (prev[i] !== undefined) process.env[k] = prev[i]!;
    });
  });

  it("verifies webhook signatures", () => {
    const secret = "whsec_test";
    const payload = '{"id":"evt_1"}';
    const t = Math.floor(Date.now() / 1000);
    const v1 = createHmac("sha256", secret)
      .update(`${t}.${payload}`)
      .digest("hex");
    expect(
      verifyStripeWebhookSignature(payload, `t=${t},v1=${v1}`, secret)
    ).toBe(true);
    expect(
      verifyStripeWebhookSignature(payload, `t=${t},v1=deadbeef`, secret)
    ).toBe(false);
  });
});
