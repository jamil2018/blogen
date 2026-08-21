# Phase 1 ops progress — production exit

**Updated:** 2026-08-22 (Resend + Stripe deferred to deploy)  
**Operator posture:** Skip configuring Resend and Stripe until **all features are in place and the product is finally ready to deploy**. Code stays Resend/Stripe-aware and **refuses without env** (no fake success).

## Deferred posture (product decision)

| Capability | Now | At final deploy readiness |
| --- | --- | --- |
| Resend Marketplace + DNS/webhooks | **Deferred** — do not `vercel integration add` | Provision, pull env, wire `/api/webhooks/resend` |
| Stripe Marketplace + webhook/Connect | **Deferred** for live paid journeys (any prior sandbox install is optional; not a Phase 1 code gate) | Confirm keys, webhook secret, Connect; wire `/api/webhooks/stripe` |
| Live email / paid journeys | Out of scope | Re-run Checkpoints E & F live checklists |

**Phase 1 code on `main`** can be treated as complete for continuing product work. Live email and paid journeys wait for deploy prep (`docs/qa/checkpoint-e.md`, `docs/qa/checkpoint-f.md`).

## Production 404s (reproduced 2026-08-21)

Live alias `https://blogen-eight.vercel.app` may lag behind `main`. After shipping Phase 1 routes, re-probe:

| URL | Expected after deploy of Phase 1 code |
| --- | --- |
| `/` `/about` `/login` `/register` `/authors` `/categories` `/search/*` | **200** |
| `/library` `/following` | Auth redirect → `/login` when signed out |
| `/privacy` `/terms` `/content-policy` `/copyright` | **200** |
| `/p/*` `/pubs/*` | Page or `notFound`/redirect by data |
| `/api/webhooks/stripe` `/api/webhooks/resend` | Handlers present; **503/401 without env** until deploy provision |
| `/user/*` `/admin/*` | Auth gate → login |

## Confirmed (infra, not email/payments)

| Item | Status | Evidence |
| --- | --- | --- |
| `npx vercel whoami` | **OK** | `jamil2018` |
| Project link | **OK** | `blogen` / team `jamil2018s-projects` |
| Production domain | Linked | `blogen-eight.vercel.app` |
| Marketplace terms | Accepted historically | Not a reason to provision now |
| Resend / Stripe live config | **Deferred to deploy** | See checklists below |
| Code refuse-without-env | **OK** | Newsletter send, checkout, webhooks |

## Env expectations (when deploy-ready)

App names (map from Marketplace prefixes if needed):

| App expects | When to set |
| --- | --- |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_WEBHOOK_SECRET` | Final deploy prep |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Final deploy prep |
| `STRIPE_CONNECT_CLIENT_ID` | Optional; Connect Express at deploy |
| `CRON_SECRET` / `NEXT_PUBLIC_SITE_URL` | Deploy prep (manual) |

`isStripeConfigured()` / Resend guards must keep refusing checkout and sends until secrets exist.

## Deploy readiness — Resend (do later)

Requires an **owned domain** (not `*.vercel.app`) plus a region.

```bash
npx vercel --non-interactive integration add resend/resend-email --no-claim --plan free \
  -m domain=YOUR_OWNED_DOMAIN \
  -m region=us-east-1
npx vercel env pull .env.local --yes
```

Then DNS in Resend; webhook → `https://blogen-eight.vercel.app/api/webhooks/resend`. Full checklist: `docs/qa/checkpoint-e.md`.

## Deploy readiness — Stripe (do later)

```bash
npx vercel --non-interactive integration add stripe --no-claim
npx vercel env pull .env.local --yes
```

Add `STRIPE_WEBHOOK_SECRET` for `https://blogen-eight.vercel.app/api/webhooks/stripe`. Full checklist: `docs/qa/checkpoint-f.md`.

## Still for deploy / ops (not Phase 1 code blockers)

1. **Resend + Stripe** — provision only at final deploy readiness (above).
2. **`CRON_SECRET`** + **`NEXT_PUBLIC_SITE_URL`** on Vercel.
3. **Migrations A→D** on the target Supabase project when promoting that environment:
   1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
   2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
   3. `supabase/migrations/20260821020000_phase1_stage_c.sql`
   4. `supabase/migrations/20260821030000_phase1_stage_d.sql`  
   Prefer `supabase db push` or Dashboard SQL after backup (`docs/qa/launch-readiness.md`).

## Scoreboard

| Capability | Now | Deploy readiness |
| --- | --- | --- |
| Resend live | Deferred | Provision + env + webhook |
| Stripe live | Deferred | Provision + webhook (+ Connect) |
| Refuse-without-env code | In place | Unchanged |
| Migrations A–D on target | When promoting env | Required for live data |
| Cron secret / site URL | Manual at deploy | Required for schedule + absolute URLs |
