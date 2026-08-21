import { describe, expect, it } from "vitest";
import {
  allowsEmailDistribution,
  allowsWebDistribution,
  canPerformEditorialAction,
  canTransitionSubmission,
  consentAttestationRequired,
  hasMinRole,
  isFollowableInStageC,
  isSendableSubscriptionStatus,
  isValidPublicationSlug,
  parseSubscriberCsv,
  slugifyPublicationName,
} from "../../src/lib/posts/stage-c-contracts";
import { isFollowableInStageB } from "../../src/lib/posts/stage-b-contracts";
import { isResendConfigured } from "../../src/lib/email/resend";

describe("Stage C follow contracts", () => {
  it("allows author, category, and publication", () => {
    expect(isFollowableInStageC("author")).toBe(true);
    expect(isFollowableInStageC("category")).toBe(true);
    expect(isFollowableInStageC("publication")).toBe(true);
    expect(isFollowableInStageB("publication")).toBe(true);
  });
});

describe("Stage C editorial permission matrix", () => {
  it("ranks roles and gates actions", () => {
    expect(hasMinRole("owner", "editor")).toBe(true);
    expect(hasMinRole("contributor", "editor")).toBe(false);
    expect(canPerformEditorialAction("contributor", "submit")).toBe(true);
    expect(canPerformEditorialAction("contributor", "accept")).toBe(false);
    expect(canPerformEditorialAction("editor", "publish")).toBe(true);
    expect(canPerformEditorialAction("editor", "manage_audience")).toBe(true);
    expect(canPerformEditorialAction(null, "submit")).toBe(false);
  });

  it("enforces submission transitions", () => {
    expect(canTransitionSubmission(null, "submitted")).toBe(true);
    expect(canTransitionSubmission("submitted", "accepted")).toBe(true);
    expect(canTransitionSubmission("submitted", "published")).toBe(false);
    expect(canTransitionSubmission("accepted", "published")).toBe(true);
    expect(canTransitionSubmission("published", "accepted")).toBe(false);
    expect(canTransitionSubmission("rejected", "submitted")).toBe(true);
  });
});

describe("Stage C distribution modes", () => {
  it("prevents email_only from web archives", () => {
    expect(allowsWebDistribution("web_only")).toBe(true);
    expect(allowsWebDistribution("web_and_email")).toBe(true);
    expect(allowsWebDistribution("email_only")).toBe(false);
    expect(allowsEmailDistribution("email_only")).toBe(true);
    expect(allowsEmailDistribution("web_only")).toBe(false);
  });
});

describe("Stage C audience CSV", () => {
  it("parses emails and requires import consent", () => {
    const { rows, errors } = parseSubscriberCsv(
      "email,status\na@example.com,active\nbad\nc@example.com"
    );
    expect(rows.map((r) => r.email)).toEqual([
      "a@example.com",
      "c@example.com",
    ]);
    expect(errors.length).toBe(1);
    expect(consentAttestationRequired("import")).toBe(true);
    expect(consentAttestationRequired("web")).toBe(false);
    expect(isSendableSubscriptionStatus("active")).toBe(true);
    expect(isSendableSubscriptionStatus("suppressed")).toBe(false);
  });

  it("slugifies publication names", () => {
    expect(slugifyPublicationName("Hello World!")).toBe("hello-world");
    expect(isValidPublicationSlug("hello-world")).toBe(true);
    expect(isValidPublicationSlug("Hello")).toBe(false);
  });
});

describe("Stage C Resend env contract", () => {
  it("does not report configured without env", () => {
    const prevKey = process.env.RESEND_API_KEY;
    const prevFrom = process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    expect(isResendConfigured()).toBe(false);
    if (prevKey !== undefined) process.env.RESEND_API_KEY = prevKey;
    if (prevFrom !== undefined) process.env.RESEND_FROM_EMAIL = prevFrom;
  });
});
