/**
 * Pure helpers for Stage D: analytics privacy, entitlements, Stripe readiness.
 */

export type AnalyticsEventName =
  | "view"
  | "read_complete"
  | "follow"
  | "unfollow"
  | "subscribe"
  | "unsubscribe"
  | "checkout_start"
  | "checkout_complete"
  | "membership_cancel"
  | "membership_refund"
  | "email_open"
  | "email_click";

export type PostAccessLevel = "public" | "members" | "paid";

export type MembershipStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type MembershipInterval = "month" | "year";

export type LedgerEntryKind =
  | "gross"
  | "platform_fee"
  | "stripe_fee"
  | "refund"
  | "dispute"
  | "dispute_reversal"
  | "payout"
  | "payout_failure"
  | "adjustment";

/** Events allowed from anonymous clients (privacy-minimized view funnel only). */
export function isAnonymousAllowedEvent(name: AnalyticsEventName): boolean {
  return name === "view" || name === "read_complete";
}

/**
 * Strip query strings and keep host + optional path prefix for referrers.
 * Never store raw IP, email, or full URL with PII query params.
 */
export function minimizeReferrer(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw);
    const path = url.pathname.slice(0, 64);
    return `${url.host}${path === "/" ? "" : path}`;
  } catch {
    return null;
  }
}

/** Keep only coarse channel buckets — no free-text UTM dumps. */
export function channelFromReferrer(
  minimized: string | null
): "direct" | "internal" | "search" | "social" | "email" | "other" {
  if (!minimized) return "direct";
  const host = minimized.split("/")[0]?.toLowerCase() ?? "";
  if (host.includes("blogen") || host === "localhost" || host.startsWith("127.")) {
    return "internal";
  }
  if (
    /(google|bing|duckduckgo|yahoo|baidu)\./.test(host) ||
    host.startsWith("www.google.")
  ) {
    return "search";
  }
  if (
    /(twitter|x\.com|facebook|linkedin|reddit|instagram|threads\.net)/.test(host)
  ) {
    return "social";
  }
  if (/mail\.|newsletter|substack/.test(host)) return "email";
  return "other";
}

export type AnalyticsPayload = {
  channel?: string;
  referrer_host?: string | null;
  path?: string;
  /** Coarse UA class only */
  device?: "mobile" | "desktop" | "tablet" | "unknown";
};

export function buildPrivacyPayload(input: {
  referrer?: string | null;
  path?: string | null;
  userAgent?: string | null;
}): AnalyticsPayload {
  const referrerHost = minimizeReferrer(input.referrer);
  const ua = (input.userAgent ?? "").toLowerCase();
  let device: AnalyticsPayload["device"] = "unknown";
  if (/ipad|tablet/.test(ua)) device = "tablet";
  else if (/mobi|iphone|android/.test(ua)) device = "mobile";
  else if (ua) device = "desktop";

  return {
    channel: channelFromReferrer(referrerHost),
    referrer_host: referrerHost,
    path: input.path ? input.path.slice(0, 128) : undefined,
    device,
  };
}

/** Statuses that grant content access (past_due keeps access during dunning). */
export function membershipGrantsAccess(status: MembershipStatus): boolean {
  return status === "trialing" || status === "active" || status === "past_due";
}

export function readerMembershipLabel(status: MembershipStatus): string {
  switch (status) {
    case "active":
    case "trialing":
      return "Active";
    case "past_due":
      return "Payment past due — update billing to keep access";
    case "canceled":
      return "Canceled";
    case "unpaid":
      return "Unpaid — access paused";
    case "incomplete":
    case "incomplete_expired":
      return "Checkout incomplete";
    case "paused":
      return "Paused";
    default:
      return status;
  }
}

/**
 * Server-side paywall: whether full HTML may be returned.
 * Preview/summary always allowed for published public listing metadata.
 */
export function canAccessFullContent(input: {
  accessLevel: PostAccessLevel;
  isAuthor: boolean;
  isPublicationMember: boolean;
  hasEntitlement: boolean;
}): boolean {
  if (input.accessLevel === "public") return true;
  if (input.isAuthor || input.isPublicationMember) return true;
  return input.hasEntitlement;
}

/** Truncate HTML/text preview for paywalled posts (character budget from percent). */
export function previewBody(
  full: string,
  previewPercent: number
): string {
  if (!full) return "";
  const pct = Math.min(100, Math.max(0, previewPercent));
  if (pct >= 100) return full;
  const budget = Math.max(120, Math.floor((full.length * pct) / 100));
  if (full.length <= budget) return full;
  return `${full.slice(0, budget).trimEnd()}…`;
}

export function isValidTierPrice(input: {
  isFree: boolean;
  amountCents?: number | null;
  interval?: MembershipInterval | null;
}): boolean {
  if (input.isFree) {
    return input.amountCents == null && input.interval == null;
  }
  return (
    typeof input.amountCents === "number" &&
    input.amountCents >= 0 &&
    (input.interval === "month" || input.interval === "year")
  );
}

/** Ledger net: gross − fees − refunds − disputes + reversals − payouts */
export function computeLedgerNet(entries: { kind: LedgerEntryKind; amountCents: number }[]): {
  gross: number;
  fees: number;
  refunds: number;
  disputes: number;
  net: number;
  payouts: number;
} {
  let gross = 0;
  let fees = 0;
  let refunds = 0;
  let disputes = 0;
  let payouts = 0;

  for (const e of entries) {
    switch (e.kind) {
      case "gross":
        gross += e.amountCents;
        break;
      case "platform_fee":
      case "stripe_fee":
        fees += Math.abs(e.amountCents);
        break;
      case "refund":
        refunds += Math.abs(e.amountCents);
        break;
      case "dispute":
        disputes += Math.abs(e.amountCents);
        break;
      case "dispute_reversal":
        disputes -= Math.abs(e.amountCents);
        break;
      case "payout":
        payouts += Math.abs(e.amountCents);
        break;
      default:
        break;
    }
  }

  const net = gross - fees - refunds - Math.max(0, disputes);
  return { gross, fees, refunds, disputes: Math.max(0, disputes), net, payouts };
}

/** Map Stripe subscription.status → our membership_status */
export function mapStripeSubscriptionStatus(
  status: string
): MembershipStatus | null {
  const allowed: MembershipStatus[] = [
    "trialing",
    "active",
    "past_due",
    "canceled",
    "unpaid",
    "incomplete",
    "incomplete_expired",
    "paused",
  ];
  return allowed.includes(status as MembershipStatus)
    ? (status as MembershipStatus)
    : null;
}

export function stripeCheckoutBlockedReason(envPresent: boolean): string | null {
  if (envPresent) return null;
  return "Stripe is not configured. Provision via Vercel Marketplace and run `vercel env pull` before checkout.";
}
