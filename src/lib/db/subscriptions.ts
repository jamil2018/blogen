import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import {
  mapSubscription,
  type SubscriptionRow,
} from "./publication-mappers";
import type {
  Subscription,
  SubscriptionSource,
  SubscriptionStatus,
  SubscriptionTargetType,
} from "../../types/publication";
import {
  isSendableSubscriptionStatus,
  parseSubscriberCsv,
} from "../posts/stage-c-contracts";
import {
  isResendConfigured,
  sendResendEmail,
} from "../email/resend";

export async function listSubscriptions(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  status?: SubscriptionStatus;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: Subscription[];
  count: number;
  page: number;
  totalPages: number;
}> {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 50));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();
  let query = supabase
    .from("subscriptions")
    .select("*", { count: "exact" })
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .order("created_at", { ascending: false });

  if (input.status) query = query.eq("status", input.status);
  if (input.q?.trim()) {
    query = query.ilike("email", `%${input.q.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map((row) => mapSubscription(row as SubscriptionRow)),
    count: total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("email_suppressions")
      .select("email")
      .eq("email", normalized)
      .maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function subscribeEmail(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  email: string;
  userId?: string | null;
  source?: SubscriptionSource;
  consentAttestation?: string;
}): Promise<Subscription> {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email");
  }

  if (await isEmailSuppressed(email)) {
    throw new Error("This email address cannot be subscribed");
  }

  const source = input.source ?? "web";
  if (source === "import" && !input.consentAttestation?.trim()) {
    throw new Error("Consent attestation is required for imports");
  }

  const now = new Date().toISOString();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    const row = existing as SubscriptionRow;
    if (row.status === "suppressed") {
      throw new Error("This email is suppressed and cannot be re-subscribed");
    }
    if (row.status === "active") {
      return mapSubscription(row);
    }
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        consent_at: now,
        confirmed_at: now,
        unsubscribed_at: null,
        user_id: input.userId ?? row.user_id,
        source,
        consent_attestation:
          input.consentAttestation ?? row.consent_attestation,
      })
      .eq("id", row.id)
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Subscribe failed");
    return mapSubscription(data as SubscriptionRow);
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      target_type: input.targetType,
      target_id: input.targetId,
      email,
      user_id: input.userId ?? null,
      status: "active",
      source,
      consent_at: now,
      confirmed_at: now,
      consent_attestation: input.consentAttestation ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Subscribe failed");
  return mapSubscription(data as SubscriptionRow);
}

export async function unsubscribeEmail(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  email: string;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  const supabase = await createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .ilike("email", email);
  if (error) throw new Error(error.message);
}

export async function importSubscribersCsv(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  csvText: string;
  consentAttestation: string;
}): Promise<{
  imported: number;
  skipped: number;
  suppressed: number;
  errors: string[];
}> {
  if (!input.consentAttestation.trim()) {
    throw new Error("Consent attestation is required");
  }
  const { rows, errors } = parseSubscriberCsv(input.csvText);
  let imported = 0;
  let skipped = 0;
  let suppressed = 0;

  for (const row of rows) {
    if (await isEmailSuppressed(row.email)) {
      suppressed += 1;
      continue;
    }
    try {
      const existing = await listSubscriptions({
        targetType: input.targetType,
        targetId: input.targetId,
        q: row.email,
        limit: 5,
      });
      const match = existing.data.find(
        (s) => s.email.toLowerCase() === row.email.toLowerCase()
      );
      if (match?.status === "active") {
        skipped += 1;
        continue;
      }
      await subscribeEmail({
        targetType: input.targetType,
        targetId: input.targetId,
        email: row.email,
        source: "import",
        consentAttestation: input.consentAttestation,
      });
      imported += 1;
    } catch (err) {
      errors.push(
        `${row.email}: ${err instanceof Error ? err.message : "failed"}`
      );
    }
  }

  return { imported, skipped, suppressed, errors };
}

export function exportSubscribersCsv(subs: Subscription[]): string {
  const header = "email,status,source,consent_at,created_at";
  const lines = subs.map((s) =>
    [
      s.email,
      s.status,
      s.source,
      s.consentAt ?? "",
      s.createdAt ?? "",
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export async function listActiveSendableEmails(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
}): Promise<Subscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("target_type", input.targetType)
    .eq("target_id", input.targetId)
    .eq("status", "active");
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => mapSubscription(row as SubscriptionRow))
    .filter((s) => isSendableSubscriptionStatus(s.status));
}

/**
 * Send welcome email if publication has welcome enabled and Resend is configured.
 * Throws (does not fake success) when Resend env is missing and welcome is enabled.
 */
export async function maybeSendWelcomeEmail(input: {
  subscription: Subscription;
  subject: string;
  htmlBody: string;
}): Promise<{ sent: boolean; messageId?: string }> {
  if (input.subscription.welcomeSentAt) {
    return { sent: false };
  }

  if (!isResendConfigured()) {
    throw new Error(
      "Welcome email is enabled but RESEND_API_KEY / RESEND_FROM_EMAIL are not configured"
    );
  }

  const result = await sendResendEmail({
    to: input.subscription.email,
    subject: input.subject,
    html: input.htmlBody,
    tags: [
      { name: "kind", value: "welcome" },
      { name: "subscription_id", value: input.subscription.id },
    ],
  });

  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq("id", input.subscription.id);

  return { sent: true, messageId: result.id };
}

export async function suppressEmail(input: {
  email: string;
  reason: string;
  eventId?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const admin = createAdminClient();
  await admin.from("email_suppressions").upsert({
    email,
    reason: input.reason,
    source: "resend_webhook",
    resend_event_id: input.eventId ?? null,
    updated_at: new Date().toISOString(),
  });
  await admin
    .from("subscriptions")
    .update({ status: "suppressed" })
    .ilike("email", email)
    .neq("status", "suppressed");
}
