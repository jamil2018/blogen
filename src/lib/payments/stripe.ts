/**
 * Stripe client for memberships, Connect, and webhooks.
 *
 * Required env (from Vercel Marketplace Stripe integration / `vercel env pull`):
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET (set after creating the webhook endpoint — not auto-provisioned)
 * - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Marketplace also sets STRIPE_PUBLISHABLE_KEY; we accept either)
 *
 * Marketplace extras (unused by app): STRIPE_MCP_KEY
 *
 * Optional:
 * - STRIPE_CONNECT_CLIENT_ID (Express OAuth / Connect)
 *
 * Do not mock successful payments when keys are missing.
 */

import { createHmac, timingSafeEqual } from "crypto";

export type StripeEnv = {
  secretKey: string;
  webhookSecret: string;
  publishableKey: string;
  connectClientId: string | undefined;
};

function resolveStripePublishableKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
    process.env.STRIPE_PUBLISHABLE_KEY?.trim()
  );
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      resolveStripePublishableKey()
  );
}

export function getStripeEnv(): StripeEnv {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const publishableKey = resolveStripePublishableKey();
  const connectClientId = process.env.STRIPE_CONNECT_CLIENT_ID?.trim();

  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Provision Stripe via Vercel Marketplace and run `vercel env pull`."
    );
  }
  if (!webhookSecret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Add the webhook signing secret after Stripe setup."
    );
  }
  if (!publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured."
    );
  }

  return { secretKey, webhookSecret, publishableKey, connectClientId };
}

export function assertStripeConfigured(): StripeEnv {
  return getStripeEnv();
}

export function assertStripeWebhookConfigured(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not configured. Add it after Stripe webhook setup."
    );
  }
  return secret;
}

type StripeJson = Record<string, unknown>;

async function stripeRequest(
  path: string,
  init: {
    method?: string;
    form?: Record<string, string | number | boolean | undefined | null>;
  } = {}
): Promise<StripeJson> {
  const { secretKey } = getStripeEnv();
  const method = init.method ?? "GET";
  const body =
    init.form && method !== "GET"
      ? new URLSearchParams(
          Object.entries(init.form)
            .filter(([, v]) => v !== undefined && v !== null)
            .map(([k, v]) => [k, String(v)])
        )
      : undefined;

  const response = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(body
        ? { "Content-Type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body,
  });

  const json = (await response.json()) as StripeJson & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      json.error?.message || `Stripe request failed (${response.status})`
    );
  }

  return json;
}

export async function stripeCreateCheckoutSession(input: {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  connectedAccountId?: string;
  applicationFeePercent?: number;
}): Promise<{ id: string; url: string | null }> {
  assertStripeConfigured();

  const form: Record<string, string | number | boolean | undefined | null> = {
    mode: "subscription",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    "line_items[0][price]": input.priceId,
    "line_items[0][quantity]": 1,
    client_reference_id: input.clientReferenceId,
  };

  if (input.customerId) form.customer = input.customerId;
  else if (input.customerEmail) form.customer_email = input.customerEmail;

  if (input.metadata) {
    for (const [k, v] of Object.entries(input.metadata)) {
      form[`metadata[${k}]`] = v;
    }
  }

  if (input.connectedAccountId) {
    form["subscription_data[transfer_data][destination]"] =
      input.connectedAccountId;
    if (input.applicationFeePercent != null) {
      form["subscription_data[application_fee_percent]"] =
        input.applicationFeePercent;
    }
  }

  const session = await stripeRequest("/checkout/sessions", {
    method: "POST",
    form,
  });

  return {
    id: String(session.id),
    url: typeof session.url === "string" ? session.url : null,
  };
}

export async function stripeCreateBillingPortalSession(input: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  assertStripeConfigured();
  const session = await stripeRequest("/billing_portal/sessions", {
    method: "POST",
    form: {
      customer: input.customerId,
      return_url: input.returnUrl,
    },
  });
  const url = typeof session.url === "string" ? session.url : null;
  if (!url) throw new Error("Stripe portal session missing url");
  return { url };
}

export async function stripeCreateConnectAccountLink(input: {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  assertStripeConfigured();
  const link = await stripeRequest("/account_links", {
    method: "POST",
    form: {
      account: input.accountId,
      refresh_url: input.refreshUrl,
      return_url: input.returnUrl,
      type: "account_onboarding",
    },
  });
  const url = typeof link.url === "string" ? link.url : null;
  if (!url) throw new Error("Stripe account link missing url");
  return { url };
}

export async function stripeCreateExpressAccount(input: {
  email?: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string }> {
  assertStripeConfigured();
  const form: Record<string, string | number | boolean | undefined | null> = {
    type: "express",
    "capabilities[card_payments][requested]": true,
    "capabilities[transfers][requested]": true,
  };
  if (input.email) form.email = input.email;
  if (input.metadata) {
    for (const [k, v] of Object.entries(input.metadata)) {
      form[`metadata[${k}]`] = v;
    }
  }
  const account = await stripeRequest("/accounts", { method: "POST", form });
  return { id: String(account.id) };
}

export async function stripeCreatePrice(input: {
  productName: string;
  amountCents: number;
  currency: string;
  interval: "month" | "year";
  metadata?: Record<string, string>;
}): Promise<{ productId: string; priceId: string }> {
  assertStripeConfigured();
  const product = await stripeRequest("/products", {
    method: "POST",
    form: {
      name: input.productName,
      ...(input.metadata
        ? Object.fromEntries(
            Object.entries(input.metadata).map(([k, v]) => [`metadata[${k}]`, v])
          )
        : {}),
    },
  });
  const productId = String(product.id);
  const price = await stripeRequest("/prices", {
    method: "POST",
    form: {
      product: productId,
      unit_amount: input.amountCents,
      currency: input.currency,
      "recurring[interval]": input.interval,
    },
  });
  return { productId, priceId: String(price.id) };
}

/**
 * Verify Stripe-Signature header (t=timestamp,v1=hmac).
 * Throws when secret missing; returns false when signature invalid.
 */
export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300
): boolean {
  if (!signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k.trim(), rest.join("=")];
    })
  ) as { t?: string; v1?: string };

  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const signed = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  const provided = parts.v1;
  if (!provided) return false;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
