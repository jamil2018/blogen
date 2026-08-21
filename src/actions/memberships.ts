"use server";

import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "../lib/db/auth";
import {
  applyPaywallToPost,
  createTier,
  listMyMemberships,
  listTiersForOwner,
  updateTierStripeIds,
  userHasEntitlement,
} from "../lib/db/memberships";
import { getMyPublicationRole } from "../lib/db/publications";
import { canPerformEditorialAction } from "../lib/posts/stage-c-contracts";
import {
  isValidTierPrice,
  stripeCheckoutBlockedReason,
} from "../lib/posts/stage-d-contracts";
import {
  isStripeConfigured,
  stripeCreateBillingPortalSession,
  stripeCreateCheckoutSession,
  stripeCreatePrice,
} from "../lib/payments/stripe";
import { getStripeCustomerId } from "../lib/db/memberships";
import { trackAnalyticsEvent } from "../lib/db/analytics";
import { logAppEvent } from "../lib/observability";
import type { Post } from "../types/post";
import { createClient } from "../lib/supabase/server";

export async function getMembershipTiers(
  ownerType: "author" | "publication",
  ownerId: string
) {
  return listTiersForOwner(ownerType, ownerId);
}

export async function createMembershipTier(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  name: string;
  description?: string;
  isFree: boolean;
  interval?: "month" | "year";
  amountCents?: number;
  currency?: string;
}) {
  const { user } = await requireUser();

  if (input.ownerType === "author" && input.ownerId !== user.id) {
    throw new Error("Not allowed");
  }
  if (input.ownerType === "publication") {
    const role = await getMyPublicationRole(input.ownerId, user.id);
    if (!canPerformEditorialAction(role, "manage_branding") || role !== "owner") {
      throw new Error("Only publication owners can manage paid tiers");
    }
  }

  if (
    !isValidTierPrice({
      isFree: input.isFree,
      amountCents: input.amountCents,
      interval: input.interval,
    })
  ) {
    throw new Error("Invalid tier pricing");
  }

  const tier = await createTier(input);

  // Sync Stripe Price only when configured; free tiers skip Stripe
  if (!input.isFree && isStripeConfigured()) {
    try {
      const { productId, priceId } = await stripeCreatePrice({
        productName: `${input.name} (${input.ownerType})`,
        amountCents: input.amountCents!,
        currency: input.currency ?? "usd",
        interval: input.interval!,
        metadata: {
          tier_id: tier.id,
          owner_type: input.ownerType,
          owner_id: input.ownerId,
        },
      });
      await updateTierStripeIds(tier.id, { productId, priceId });
      return { ...tier, stripeProductId: productId, stripePriceId: priceId };
    } catch (error) {
      logAppEvent("error", "membership.stripe_price_failed", {
        message: error instanceof Error ? error.message : "unknown",
      });
      throw error;
    }
  }

  if (!input.isFree && !isStripeConfigured()) {
    logAppEvent("warn", "membership.tier_created_without_stripe", {
      tierId: tier.id,
    });
  }

  revalidatePath("/user/memberships");
  return tier;
}

export async function startMembershipCheckout(input: {
  tierId: string;
  successPath?: string;
  cancelPath?: string;
}) {
  if (!isStripeConfigured()) {
    throw new Error(stripeCheckoutBlockedReason(false)!);
  }

  const { user } = await requireUser();
  const supabase = await createClient();
  const { data: tier, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("id", input.tierId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !tier) throw new Error("Tier not found");
  if (tier.is_free) throw new Error("Free tiers do not use checkout");
  if (!tier.stripe_price_id) {
    throw new Error(
      "This tier has no Stripe Price yet. Re-save the tier after Stripe is provisioned."
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const successUrl = `${origin}${input.successPath ?? "/user/memberships?checkout=success"}`;
  const cancelUrl = `${origin}${input.cancelPath ?? "/user/memberships?checkout=cancel"}`;

  const customerId = await getStripeCustomerId(user.id);

  await trackAnalyticsEvent({
    eventName: "checkout_start",
    authorId: tier.owner_type === "author" ? tier.owner_id : null,
    publicationId: tier.owner_type === "publication" ? tier.owner_id : null,
  });

  const session = await stripeCreateCheckoutSession({
    customerId: customerId ?? undefined,
    customerEmail: customerId ? undefined : user.email,
    priceId: tier.stripe_price_id as string,
    successUrl,
    cancelUrl,
    clientReferenceId: user.id,
    metadata: {
      tier_id: tier.id as string,
      user_id: user.id,
      owner_type: tier.owner_type as string,
      owner_id: tier.owner_id as string,
    },
  });

  if (!session.url) throw new Error("Checkout session missing URL");
  return { url: session.url, sessionId: session.id };
}

export async function openBillingPortal(returnPath = "/user/memberships") {
  if (!isStripeConfigured()) {
    throw new Error(stripeCheckoutBlockedReason(false)!);
  }
  const { user } = await requireUser();
  const customerId = await getStripeCustomerId(user.id);
  if (!customerId) {
    throw new Error("No Stripe customer on file. Complete a checkout first.");
  }
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return stripeCreateBillingPortalSession({
    customerId,
    returnUrl: `${origin}${returnPath}`,
  });
}

export async function getMyReaderMemberships() {
  const { user } = await requireUser();
  return listMyMemberships(user.id);
}

export async function checkEntitlement(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  requiredTierId?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user) return false;
  return userHasEntitlement({
    userId: user.id,
    ...input,
  });
}

export async function getPaywalledPost(post: Post) {
  return applyPaywallToPost(post);
}

export async function getStripeStatus() {
  return {
    configured: isStripeConfigured(),
    message: stripeCheckoutBlockedReason(isStripeConfigured()),
  };
}
