import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import {
  canAccessFullContent,
  membershipGrantsAccess,
  previewBody,
  type MembershipStatus,
  type PostAccessLevel,
} from "../posts/stage-d-contracts";
import type { Post } from "../../types/post";
import { getCurrentUser } from "./auth";

export type MembershipTier = {
  id: string;
  ownerType: "author" | "publication";
  ownerId: string;
  name: string;
  description: string;
  isFree: boolean;
  interval?: "month" | "year";
  amountCents?: number;
  currency: string;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive: boolean;
  sortOrder: number;
};

export type Membership = {
  id: string;
  userId: string;
  tierId: string;
  status: MembershipStatus;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  lastInvoiceStatus?: string;
};

function mapTier(row: Record<string, unknown>): MembershipTier {
  return {
    id: row.id as string,
    ownerType: row.owner_type as "author" | "publication",
    ownerId: row.owner_id as string,
    name: row.name as string,
    description: (row.description as string) ?? "",
    isFree: Boolean(row.is_free),
    interval: (row.interval as "month" | "year" | null) ?? undefined,
    amountCents:
      row.amount_cents == null ? undefined : (row.amount_cents as number),
    currency: (row.currency as string) ?? "usd",
    stripeProductId: (row.stripe_product_id as string | null) ?? undefined,
    stripePriceId: (row.stripe_price_id as string | null) ?? undefined,
    isActive: Boolean(row.is_active),
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function mapMembership(row: Record<string, unknown>): Membership {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    tierId: row.tier_id as string,
    status: row.status as MembershipStatus,
    stripeSubscriptionId:
      (row.stripe_subscription_id as string | null) ?? undefined,
    currentPeriodEnd:
      (row.current_period_end as string | null) ?? undefined,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    lastInvoiceStatus: (row.last_invoice_status as string | null) ?? undefined,
  };
}

export async function listTiersForOwner(
  ownerType: "author" | "publication",
  ownerId: string
): Promise<MembershipTier[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_tiers")
    .select("*")
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => mapTier(r as Record<string, unknown>));
}

export async function createTier(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  name: string;
  description?: string;
  isFree: boolean;
  interval?: "month" | "year";
  amountCents?: number;
  currency?: string;
  stripeProductId?: string;
  stripePriceId?: string;
}): Promise<MembershipTier> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_tiers")
    .insert({
      owner_type: input.ownerType,
      owner_id: input.ownerId,
      name: input.name,
      description: input.description ?? "",
      is_free: input.isFree,
      interval: input.isFree ? null : input.interval ?? null,
      amount_cents: input.isFree ? null : input.amountCents ?? null,
      currency: input.currency ?? "usd",
      stripe_product_id: input.stripeProductId ?? null,
      stripe_price_id: input.stripePriceId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTier(data as Record<string, unknown>);
}

export async function updateTierStripeIds(
  tierId: string,
  stripe: { productId: string; priceId: string }
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("membership_tiers")
    .update({
      stripe_product_id: stripe.productId,
      stripe_price_id: stripe.priceId,
    })
    .eq("id", tierId);
  if (error) throw error;
}

export async function userHasEntitlement(input: {
  userId: string;
  ownerType: "author" | "publication";
  ownerId: string;
  requiredTierId?: string | null;
}): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("id, status, tier_id, membership_tiers!inner(owner_type, owner_id, is_free)")
    .eq("user_id", input.userId)
    .in("status", ["trialing", "active", "past_due"]);

  if (error) throw error;

  return (data ?? []).some((row) => {
    const tier = row.membership_tiers as unknown as {
      owner_type: string;
      owner_id: string;
      is_free: boolean;
    };
    if (tier.owner_type !== input.ownerType || tier.owner_id !== input.ownerId) {
      return false;
    }
    if (!membershipGrantsAccess(row.status as MembershipStatus)) return false;
    if (!input.requiredTierId) return true;
    return row.tier_id === input.requiredTierId || tier.is_free;
  });
}

export async function listMyMemberships(userId: string): Promise<Membership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapMembership(r as Record<string, unknown>));
}

export async function getStripeCustomerId(
  userId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.stripe_customer_id ?? null;
}

export async function upsertStripeCustomer(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("stripe_customers").upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
  });
  if (error) throw error;
}

/**
 * Apply paywall to a mapped Post: strip body when not entitled.
 */
export async function applyPaywallToPost(
  post: Post,
  options?: { previewPercent?: number }
): Promise<Post & { accessGranted: boolean; accessLevel: PostAccessLevel }> {
  const accessLevel = (post.accessLevel ?? "public") as PostAccessLevel;
  const user = await getCurrentUser().catch(() => null);
  const authorId =
    typeof post.author === "string" ? post.author : post.author?.id;

  const isAuthor = Boolean(user && authorId && user.id === authorId);
  const isAdmin = Boolean(user?.isAdmin);
  let isPublicationMember = false;

  if (user && post.publicationId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("publication_members")
      .select("role")
      .eq("publication_id", post.publicationId)
      .eq("user_id", user.id)
      .maybeSingle();
    isPublicationMember = Boolean(data);
  }

  let hasEntitlement = false;
  if (user && accessLevel !== "public") {
    if (post.publicationId) {
      hasEntitlement = await userHasEntitlement({
        userId: user.id,
        ownerType: "publication",
        ownerId: post.publicationId,
        requiredTierId:
          accessLevel === "paid" ? post.requiredTierId ?? null : null,
      });
    } else if (authorId) {
      hasEntitlement = await userHasEntitlement({
        userId: user.id,
        ownerType: "author",
        ownerId: authorId,
        requiredTierId:
          accessLevel === "paid" ? post.requiredTierId ?? null : null,
      });
    }
  }

  const accessGranted = canAccessFullContent({
    accessLevel,
    isAuthor: isAuthor || isAdmin,
    isPublicationMember,
    hasEntitlement,
  });

  if (accessGranted) {
    return { ...post, accessGranted: true, accessLevel };
  }

  const pct = options?.previewPercent ?? post.previewPercent ?? 20;
  return {
    ...post,
    description: previewBody(post.description ?? "", pct),
    accessGranted: false,
    accessLevel,
  };
}
