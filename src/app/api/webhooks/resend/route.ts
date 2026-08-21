import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { assertResendWebhookConfigured } from "../../../../lib/email/resend";
import { suppressEmail } from "../../../../lib/db/subscriptions";
import { logAppEvent } from "../../../../lib/observability";
import { createHmac, timingSafeEqual } from "crypto";
import type { Json } from "../../../../lib/supabase/database.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resend webhook (Svix-compatible). Env: RESEND_WEBHOOK_SECRET
 * Handles bounce / complaint / suppressed events without mocking.
 */
function verifySvixSignature(
  payload: string,
  headers: Headers,
  secret: string
): boolean {
  const msgId = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!msgId || !timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 60 * 5) return false;

  const toSign = `${msgId}.${timestamp}.${payload}`;
  const secretBytes = secret.startsWith("whsec_")
    ? Buffer.from(secret.slice(6), "base64")
    : Buffer.from(secret, "utf8");
  const expected = createHmac("sha256", secretBytes)
    .update(toSign)
    .digest("base64");

  const provided = signature
    .split(" ")
    .map((part) => part.replace(/^v1,/, ""))
    .filter(Boolean);

  return provided.some((sig) => {
    try {
      const a = Buffer.from(expected);
      const b = Buffer.from(sig);
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}

export async function POST(request: NextRequest) {
  let secret: string;
  try {
    secret = assertResendWebhookConfigured();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Not configured" },
      { status: 503 }
    );
  }

  const raw = await request.text();
  if (!verifySvixSignature(raw, request.headers, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    type?: string;
    data?: {
      email_id?: string;
      to?: string[] | string;
      bounce?: { message?: string };
    };
    created_at?: string;
  };

  const eventType = event.type ?? "unknown";
  const eventId =
    request.headers.get("svix-id") ?? `${eventType}-${Date.now()}`;

  const admin = createAdminClient();
  const { error: insertErr } = await admin.from("resend_webhook_events").upsert(
    {
      event_id: eventId,
      event_type: eventType,
      payload: event as unknown as Json,
      processed_at: null,
    },
    { onConflict: "event_id", ignoreDuplicates: true }
  );
  if (insertErr) {
    logAppEvent("error", "resend.webhook_store_failed", {
      message: insertErr.message,
    });
  }

  const toRaw = event.data?.to;
  const emails = Array.isArray(toRaw)
    ? toRaw
    : typeof toRaw === "string"
      ? [toRaw]
      : [];

  try {
    if (
      eventType === "email.bounced" ||
      eventType === "email.complained" ||
      eventType === "email.suppressed"
    ) {
      for (const email of emails) {
        await suppressEmail({
          email,
          reason: eventType,
          eventId,
        });
      }
    }

    await admin
      .from("resend_webhook_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", eventId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    logAppEvent("error", "resend.webhook_process_failed", {
      eventType,
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}
