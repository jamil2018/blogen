# Phase 1 ops progress — production exit

**Updated:** 2026-08-22 (Phase 1 foundation closed; Resend + Stripe still deferred)  
**Operator posture:** Skip configuring Resend and Stripe until **all features are in place and the product is finally ready to deploy**. Code stays Resend/Stripe-aware and **refuses without env** (no fake success).

## Verdict

**Phase 1 foundation is complete for code + production deploy** (Stages A–E on `main`, migrations A–D on Supabase project `tvotabzayhcuwzrsrokm`, production alias live).  
**Live email / paid journeys remain deferred** to final deploy readiness.

## Deferred posture (product decision)

| Capability | Now | At final deploy readiness |
| --- | --- | --- |
| Resend Marketplace + DNS/webhooks | **Deferred** — do not `vercel integration add` | Provision, pull env, wire `/api/webhooks/resend` |
| Stripe Marketplace + webhook/Connect | **Deferred** for live paid journeys (any prior sandbox install is optional; not a Phase 1 code gate) | Confirm keys, webhook secret, Connect; wire `/api/webhooks/stripe` |
| Live email / paid journeys | Out of scope | Re-run Checkpoints E & F live checklists |

## Production smoke (2026-08-22)

Production alias: `https://blogen-eight.vercel.app`  
Deployment: `dpl_Cxajj61SuYvqzWo4EdGxqqyeBGYy` (and follow-up redeploy after env).

| URL | Observed |
| --- | --- |
| `/` `/about` `/login` `/authors` `/categories` `/privacy` `/terms` `/content-policy` `/copyright` | **200** |
| `/library` `/following` | Auth redirect → `/login?next=…` (not 404) |
| `/pubs/does-not-exist` | **404** (expected soft-not-found) |
| `/api/webhooks/stripe` `/api/webhooks/resend` | Handlers present; refuse without env |

Hobby plan note: `vercel.json` cron for `/api/cron/publish-scheduled` is **`0 0 * * *`** (once daily). Sub-daily schedules require Pro.

## Confirmed (infra, not email/payments)

| Item | Status | Evidence |
| --- | --- | --- |
| `npx vercel whoami` | **OK** | `jamil2018` |
| Project link | **OK** | `blogen` / team `jamil2018s-projects` |
| Production domain | **OK** | `blogen-eight.vercel.app` |
| Stage A–D migrations on Supabase | **OK** | Applied 2026-08-22 (`phase1_stage_a` … `phase1_stage_d_*`); 8 published posts |
| `NEXT_PUBLIC_SITE_URL` | **OK** | Set on Production / Preview / Development → `https://blogen-eight.vercel.app` |
| `CRON_SECRET` | **OK** | Set on Production / Preview / Development |
| Marketplace terms | Accepted historically | Not a reason to provision Resend/Stripe now |
| Resend / Stripe live config | **Deferred to deploy** | See checklists below |
| Code refuse-without-env | **OK** | Newsletter send, checkout, webhooks |

## Env expectations (when deploy-ready)

| App expects | When to set |
| --- | --- |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_WEBHOOK_SECRET` | Final deploy prep |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Final deploy prep (keys may already exist from sandbox; webhook secret still at prep) |
| `STRIPE_CONNECT_CLIENT_ID` | Optional; Connect Express at deploy |
| `CRON_SECRET` / `NEXT_PUBLIC_SITE_URL` | **Done** for foundation closeout |

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

## Remaining ops (final deploy readiness only)

1. **Resend + Stripe** — provision only at final deploy readiness (above).
2. ~~**`CRON_SECRET` + `NEXT_PUBLIC_SITE_URL`**~~ — done.
3. ~~**Migrations A→D**~~ — applied on linked Supabase project `tvotabzayhcuwzrsrokm`.
4. Re-run Checkpoints E & F live; backup/restore and abuse/load drills (`docs/qa/launch-readiness.md`).

## Scoreboard

| Capability | Now | Deploy readiness |
| --- | --- | --- |
| Resend live | Deferred | Provision + env + webhook |
| Stripe live | Deferred | Provision + webhook (+ Connect) |
| Refuse-without-env code | In place | Unchanged |
| Migrations A–D on target | **Applied** | Rehearse on promote if new env |
| Cron secret / site URL | **Set** | Unchanged until domain cutover |
| Production Phase 1 routes | **Live** | Not 404 |
