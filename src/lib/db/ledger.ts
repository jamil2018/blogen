import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import {
  computeLedgerNet,
  type LedgerEntryKind,
} from "../posts/stage-d-contracts";

export type ConnectAccount = {
  ownerType: "author" | "publication";
  ownerId: string;
  stripeAccountId?: string;
  onboardingStatus: "not_started" | "pending" | "restricted" | "complete";
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

export type LedgerEntry = {
  id: string;
  ownerType: "author" | "publication";
  ownerId: string;
  kind: LedgerEntryKind;
  amountCents: number;
  currency: string;
  stripeObjectId?: string;
  description: string;
  occurredAt: string;
};

export type PaymentSupportCase = {
  id: string;
  membershipId?: string;
  stripeDisputeId?: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  status: string;
  notes: string;
  ownerType?: "author" | "publication";
  ownerId?: string;
  createdAt: string;
};

export async function getConnectAccount(
  ownerType: "author" | "publication",
  ownerId: string
): Promise<ConnectAccount | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connect_accounts")
    .select("*")
    .eq("owner_type", ownerType)
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ownerType: data.owner_type as "author" | "publication",
    ownerId: data.owner_id as string,
    stripeAccountId: (data.stripe_account_id as string | null) ?? undefined,
    onboardingStatus: data.onboarding_status as ConnectAccount["onboardingStatus"],
    chargesEnabled: Boolean(data.charges_enabled),
    payoutsEnabled: Boolean(data.payouts_enabled),
    detailsSubmitted: Boolean(data.details_submitted),
  };
}

export async function upsertConnectAccount(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  stripeAccountId?: string;
  onboardingStatus?: ConnectAccount["onboardingStatus"];
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("connect_accounts").upsert({
    owner_type: input.ownerType,
    owner_id: input.ownerId,
    stripe_account_id: input.stripeAccountId ?? null,
    onboarding_status: input.onboardingStatus ?? "not_started",
    charges_enabled: input.chargesEnabled ?? false,
    payouts_enabled: input.payoutsEnabled ?? false,
    details_submitted: input.detailsSubmitted ?? false,
  });
  if (error) throw error;
}

export async function listLedgerEntries(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  limit?: number;
}): Promise<LedgerEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("owner_type", input.ownerType)
    .eq("owner_id", input.ownerId)
    .order("occurred_at", { ascending: false })
    .limit(input.limit ?? 100);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    ownerType: row.owner_type as "author" | "publication",
    ownerId: row.owner_id as string,
    kind: row.kind as LedgerEntryKind,
    amountCents: row.amount_cents as number,
    currency: row.currency as string,
    stripeObjectId: (row.stripe_object_id as string | null) ?? undefined,
    description: (row.description as string) ?? "",
    occurredAt: row.occurred_at as string,
  }));
}

export async function getEarningsSummary(input: {
  ownerType: "author" | "publication";
  ownerId: string;
}) {
  const entries = await listLedgerEntries({ ...input, limit: 500 });
  return {
    ...computeLedgerNet(
      entries.map((e) => ({ kind: e.kind, amountCents: e.amountCents }))
    ),
    currency: entries[0]?.currency ?? "usd",
    entryCount: entries.length,
  };
}

/** Idempotent ledger insert keyed by stripe_object_id + kind */
export async function insertLedgerEntryIdempotent(input: {
  ownerType: "author" | "publication";
  ownerId: string;
  kind: LedgerEntryKind;
  amountCents: number;
  currency?: string;
  stripeObjectId?: string;
  stripeEventId?: string;
  membershipId?: string;
  description?: string;
  occurredAt?: string;
}): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("ledger_entries").insert({
    owner_type: input.ownerType,
    owner_id: input.ownerId,
    kind: input.kind,
    amount_cents: input.amountCents,
    currency: input.currency ?? "usd",
    stripe_object_id: input.stripeObjectId ?? null,
    stripe_event_id: input.stripeEventId ?? null,
    membership_id: input.membershipId ?? null,
    description: input.description ?? "",
    occurred_at: input.occurredAt ?? new Date().toISOString(),
  });
  if (error) {
    if (error.code === "23505") return false; // duplicate
    throw error;
  }
  return true;
}

export async function listPaymentSupportCases(limit = 50): Promise<PaymentSupportCase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_support_cases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    membershipId: (row.membership_id as string | null) ?? undefined,
    stripeDisputeId: (row.stripe_dispute_id as string | null) ?? undefined,
    stripeChargeId: (row.stripe_charge_id as string | null) ?? undefined,
    stripeRefundId: (row.stripe_refund_id as string | null) ?? undefined,
    status: row.status as string,
    notes: (row.notes as string) ?? "",
    ownerType: (row.owner_type as "author" | "publication" | null) ?? undefined,
    ownerId: (row.owner_id as string | null) ?? undefined,
    createdAt: row.created_at as string,
  }));
}

export async function createPaymentSupportCase(input: {
  membershipId?: string;
  stripeDisputeId?: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  reporterUserId?: string;
  ownerType?: "author" | "publication";
  ownerId?: string;
  status?: string;
  notes?: string;
}): Promise<PaymentSupportCase> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("payment_support_cases")
    .insert({
      membership_id: input.membershipId ?? null,
      stripe_dispute_id: input.stripeDisputeId ?? null,
      stripe_charge_id: input.stripeChargeId ?? null,
      stripe_refund_id: input.stripeRefundId ?? null,
      reporter_user_id: input.reporterUserId ?? null,
      owner_type: input.ownerType ?? null,
      owner_id: input.ownerId ?? null,
      status: input.status ?? "open",
      notes: input.notes ?? "",
    })
    .select("*")
    .single();
  if (error) throw error;
  return {
    id: data.id as string,
    membershipId: (data.membership_id as string | null) ?? undefined,
    stripeDisputeId: (data.stripe_dispute_id as string | null) ?? undefined,
    stripeChargeId: (data.stripe_charge_id as string | null) ?? undefined,
    stripeRefundId: (data.stripe_refund_id as string | null) ?? undefined,
    status: data.status as string,
    notes: (data.notes as string) ?? "",
    ownerType: (data.owner_type as "author" | "publication" | null) ?? undefined,
    ownerId: (data.owner_id as string | null) ?? undefined,
    createdAt: data.created_at as string,
  };
}
