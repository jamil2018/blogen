import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import {
  assertStripeWebhookConfigured,
  isStripeConfigured,
  verifyStripeWebhookSignature,
} from "../../../../lib/payments/stripe";
import {
  mapStripeSubscriptionStatus,
} from "../../../../lib/posts/stage-d-contracts";
import { insertLedgerEntryIdempotent } from "../../../../lib/db/ledger";
import { createPaymentSupportCase } from "../../../../lib/db/ledger";
import { trackAnalyticsEvent } from "../../../../lib/db/analytics";
import { logAppEvent } from "../../../../lib/observability";
import type { Json } from "../../../../lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook — idempotent via stripe_events.event_id unique.
 * Refuses processing when STRIPE_WEBHOOK_SECRET is missing (no mock success).
 */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Provision via Vercel Marketplace before enabling webhooks.",
      },
      { status: 503 }
    );
  }

  let secret: string;
  try {
    secret = assertStripeWebhookConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Not configured" },
      { status: 503 }
    );
  }

  const raw = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!verifyStripeWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    id: string;
    type: string;
    api_version?: string;
    data: { object: Record<string, unknown> };
  };

  const admin = createAdminClient();

  // Idempotent claim
  const { data: inserted, error: insertErr } = await admin
    .from("stripe_events")
    .upsert(
      {
        event_id: event.id,
        event_type: event.type,
        api_version: event.api_version ?? null,
        payload: event as unknown as Json,
        processed_at: null,
      },
      { onConflict: "event_id", ignoreDuplicates: true }
    )
    .select("id, processed_at")
    .maybeSingle();

  if (insertErr) {
    logAppEvent("error", "stripe.webhook_store_failed", {
      message: insertErr.message,
    });
  }

  // If already processed, ack without re-applying
  const { data: existing } = await admin
    .from("stripe_events")
    .select("processed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing?.processed_at) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    await processStripeEvent(event);
    await admin
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString(), processing_error: null })
      .eq("event_id", event.id);
    return NextResponse.json({ ok: true, claimed: Boolean(inserted) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    await admin
      .from("stripe_events")
      .update({ processing_error: message })
      .eq("event_id", event.id);
    logAppEvent("error", "stripe.webhook_process_failed", {
      eventType: event.type,
      message,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function processStripeEvent(event: {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}) {
  const admin = createAdminClient();
  const obj = event.data.object;

  switch (event.type) {
    case "checkout.session.completed": {
      const meta = (obj.metadata ?? {}) as Record<string, string>;
      const customerId = obj.customer as string | undefined;
      const userId = meta.user_id;
      const tierId = meta.tier_id;
      const subscriptionId = obj.subscription as string | undefined;

      if (userId && customerId) {
        await admin.from("stripe_customers").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
        });
      }

      if (userId && tierId && subscriptionId) {
        const { data: existing } = await admin
          .from("memberships")
          .select("id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();
        if (existing) {
          await admin
            .from("memberships")
            .update({ status: "active", tier_id: tierId, user_id: userId })
            .eq("id", existing.id);
        } else {
          await admin.from("memberships").insert({
            user_id: userId,
            tier_id: tierId,
            status: "active",
            stripe_subscription_id: subscriptionId,
          });
        }
      }

      await trackAnalyticsEvent({
        eventName: "checkout_complete",
        authorId: meta.owner_type === "author" ? meta.owner_id : null,
        publicationId:
          meta.owner_type === "publication" ? meta.owner_id : null,
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscriptionId = obj.id as string;
      const status = mapStripeSubscriptionStatus(String(obj.status ?? ""));
      if (!status) break;

      const periodEnd = obj.current_period_end
        ? new Date(Number(obj.current_period_end) * 1000).toISOString()
        : null;

      await admin
        .from("memberships")
        .update({
          status,
          cancel_at_period_end: Boolean(obj.cancel_at_period_end),
          current_period_end: periodEnd,
          canceled_at:
            status === "canceled" ? new Date().toISOString() : null,
          ended_at:
            event.type === "customer.subscription.deleted"
              ? new Date().toISOString()
              : null,
        })
        .eq("stripe_subscription_id", subscriptionId);

      if (status === "canceled") {
        await trackAnalyticsEvent({ eventName: "membership_cancel" });
      }
      break;
    }

    case "invoice.payment_failed": {
      const subscriptionId = obj.subscription as string | undefined;
      if (subscriptionId) {
        await admin
          .from("memberships")
          .update({
            status: "past_due",
            last_invoice_status: "failed",
          })
          .eq("stripe_subscription_id", subscriptionId);
      }
      break;
    }

    case "invoice.paid": {
      const subscriptionId = obj.subscription as string | undefined;
      const amountPaid = Number(obj.amount_paid ?? 0);
      const currency = String(obj.currency ?? "usd");
      const chargeId = (obj.charge as string | undefined) ?? (obj.id as string);
      const meta = (obj.metadata ?? {}) as Record<string, string>;

      if (subscriptionId) {
        await admin
          .from("memberships")
          .update({
            status: "active",
            last_invoice_status: "paid",
          })
          .eq("stripe_subscription_id", subscriptionId);

        const { data: membership } = await admin
          .from("memberships")
          .select("id, tier_id, membership_tiers(owner_type, owner_id)")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        const tier = membership?.membership_tiers as unknown as {
          owner_type: "author" | "publication";
          owner_id: string;
        } | null;

        if (tier && amountPaid > 0) {
          const fee = Math.round(amountPaid * 0.1);
          await insertLedgerEntryIdempotent({
            ownerType: tier.owner_type,
            ownerId: tier.owner_id,
            kind: "gross",
            amountCents: amountPaid,
            currency,
            stripeObjectId: `${chargeId}:gross`,
            stripeEventId: event.id,
            membershipId: membership?.id,
            description: "Subscription invoice paid",
          });
          await insertLedgerEntryIdempotent({
            ownerType: tier.owner_type,
            ownerId: tier.owner_id,
            kind: "platform_fee",
            amountCents: -fee,
            currency,
            stripeObjectId: `${chargeId}:platform_fee`,
            stripeEventId: event.id,
            membershipId: membership?.id,
            description: "Platform fee",
          });
        }
      }

      void meta;
      break;
    }

    case "charge.refunded": {
      const amountRefunded = Number(obj.amount_refunded ?? 0);
      const currency = String(obj.currency ?? "usd");
      const chargeId = obj.id as string;
      // Owner attribution relies on metadata from original checkout when present
      const meta = (obj.metadata ?? {}) as Record<string, string>;
      if (meta.owner_type && meta.owner_id && amountRefunded > 0) {
        await insertLedgerEntryIdempotent({
          ownerType: meta.owner_type as "author" | "publication",
          ownerId: meta.owner_id,
          kind: "refund",
          amountCents: -amountRefunded,
          currency,
          stripeObjectId: `${chargeId}:refund`,
          stripeEventId: event.id,
          description: "Charge refunded",
        });
        await trackAnalyticsEvent({ eventName: "membership_refund" });
      }
      break;
    }

    case "charge.dispute.created": {
      const disputeId = obj.id as string;
      const chargeId = obj.charge as string | undefined;
      await createPaymentSupportCase({
        stripeDisputeId: disputeId,
        stripeChargeId: chargeId,
        status: "needs_evidence",
        notes: "Stripe dispute opened — admin review required",
      });
      break;
    }

    case "account.updated": {
      const accountId = obj.id as string;
      await admin
        .from("connect_accounts")
        .update({
          charges_enabled: Boolean(obj.charges_enabled),
          payouts_enabled: Boolean(obj.payouts_enabled),
          details_submitted: Boolean(obj.details_submitted),
          onboarding_status: obj.details_submitted
            ? obj.charges_enabled
              ? "complete"
              : "restricted"
            : "pending",
        })
        .eq("stripe_account_id", accountId);
      break;
    }

    default:
      break;
  }
}
