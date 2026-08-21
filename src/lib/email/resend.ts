/**
 * Resend client for transactional + newsletter sends.
 *
 * Required env (from Vercel Marketplace Resend integration / `vercel env pull`):
 * - RESEND_API_KEY
 * - RESEND_FROM_EMAIL (verified sender, e.g. Blogen <onboarding@resend.dev>)
 * - RESEND_WEBHOOK_SECRET (Svix signing secret for bounce/complaint webhooks)
 *
 * Do not mock successful sends when keys are missing.
 */

export type ResendSendInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  headers?: Record<string, string>;
};

export type ResendSendResult = {
  id: string;
};

export function getResendEnv(): {
  apiKey: string;
  fromEmail: string;
  webhookSecret: string | undefined;
} {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured. Provision Resend via Vercel Marketplace and run `vercel env pull`."
    );
  }
  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured. Set a verified Resend from address."
    );
  }

  return { apiKey, fromEmail, webhookSecret };
}

export function isResendConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim()
  );
}

export async function sendResendEmail(
  input: ResendSendInput
): Promise<ResendSendResult> {
  const { apiKey, fromEmail } = getResendEnv();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
      tags: input.tags,
      headers: input.headers,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };

  if (!response.ok || !body.id) {
    throw new Error(
      body.message ||
        body.name ||
        `Resend send failed with status ${response.status}`
    );
  }

  return { id: body.id };
}

/**
 * Verify Resend/Svix webhook signature when RESEND_WEBHOOK_SECRET is set.
 * Returns false when secret is configured but signature is invalid.
 * Throws when secret is missing (do not process unverified webhooks in prod).
 */
export function assertResendWebhookConfigured(): string {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "RESEND_WEBHOOK_SECRET is not configured. Add it after Resend webhook setup."
    );
  }
  return secret;
}
