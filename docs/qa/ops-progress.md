# Phase 1 ops progress — production exit

**Updated:** 2026-08-21 (404 investigation)  
**Operator:** Vercel Marketplace provisioning (Resend + Stripe)

## Production 404s (reproduced 2026-08-21)

Live alias `https://blogen-eight.vercel.app` serves production deploy from **~2d ago** (`dpl_Bf8sCj3pkwb2iHunSX8w3cBqU5gw`). Phase 1 Stages A–E routes exist **only in the local working tree** (mostly untracked) and are **not on `origin/main`**, so they are not deployed.

| URL | Live status | Expected after deploy |
| --- | --- | --- |
| `/` `/about` `/login` `/register` `/authors` `/categories` `/search/*` | **200** | Same |
| `/library` `/following` | **404** | Auth redirect → `/login` |
| `/privacy` `/terms` `/content-policy` `/copyright` | **404** | **200** |
| `/p/*` `/pubs/*` | **404** (route missing) | Page or `notFound`/redirect by data |
| `/api/webhooks/stripe` `/api/webhooks/resend` | **404** | Route handlers (POST) |
| `/user/*` `/admin/*` | **307** → login | Same (pages still need deploy) |

**Fix:** commit Phase 1, push `main` (or `vercel --prod`), then re-probe the table above. Do not treat nav/docs URLs as broken until after that deploy.

## Confirmed

| Item | Status | Evidence |
| --- | --- | --- |
| `npx vercel whoami` | **OK** | `jamil2018` |
| Project link | **OK** | `blogen` (`prj_xnbq026SAbpj2KpCiqkPp6u6n4Iv`) / team `jamil2018s-projects` |
| Production domain | Linked | `blogen-eight.vercel.app` |
| Marketplace terms | **Accepted by user** | Prior session blocker cleared |
| **Stripe install** | **SUCCESS** | Resource `stripe-emerald-pillar` (sandbox) connected to `blogen` |
| **`vercel env pull`** | **SUCCESS** | `.env.local` updated (secrets not committed) |
| `.env.example` | Updated | Documents Marketplace names + manual gaps |
| Publishable key alias | Code | `src/lib/payments/stripe.ts` accepts `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` **or** `STRIPE_PUBLISHABLE_KEY` |

### Stripe resource

| Field | Value |
| --- | --- |
| Name | `stripe-emerald-pillar` |
| Ownership | **sandbox** (claim later: `npx vercel integration resource claim stripe-emerald-pillar`) |
| Dashboard | https://vercel.com/d/dashboard/integrations/stripe/icfg_dTTSHFnQfwWnHT3LrxeCrM21/resources/ir_EoPZFMw5RrTwv9ia |
| SSO | `npx vercel integration open stripe stripe-emerald-pillar` |

## Env var mapping (pulled vs app)

| App expects | Landed from Marketplace? | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | **Yes** | In `.env.local` + Vercel Production/Preview/Development |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Yes** | Also got alias `STRIPE_PUBLISHABLE_KEY` (same publishable value family) |
| `STRIPE_WEBHOOK_SECRET` | **No** | Create endpoint in Stripe, then add to Vercel env + re-pull |
| `STRIPE_CONNECT_CLIENT_ID` | **No** | Optional; after claim / Connect setup |
| `STRIPE_MCP_KEY` | Extra | Marketplace MCP helper — unused by Blogen |
| `RESEND_API_KEY` | **No** | Resend not installed yet |
| `RESEND_FROM_EMAIL` | **No** | Resend not installed yet |
| `RESEND_WEBHOOK_SECRET` | **No** | After Resend webhook setup |
| `CRON_SECRET` | **No** | Manual |
| `NEXT_PUBLIC_SITE_URL` | **No** | Manual — use `https://blogen-eight.vercel.app` until custom domain |

`isStripeConfigured()` still requires `STRIPE_WEBHOOK_SECRET`, so checkout/portal remain blocked until the webhook secret is set (intentional refuse-without-env).

## Blocked — Resend needs owned domain metadata

CLI install fails without metadata:

```text
Missing required metadata: domain, region.
```

Resend Marketplace requires a **domain you own** (not `*.vercel.app`) plus a region.

### Exact next command (after you choose a domain)

```bash
npx vercel --non-interactive integration add resend/resend-email --no-claim --plan free \
  -m domain=YOUR_OWNED_DOMAIN \
  -m region=us-east-1
```

Regions: `us-east-1` | `eu-west-1` | `sa-east-1` | `ap-northeast-1`

Then:

```bash
npx vercel env pull .env.local --yes
```

Map/confirm `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_WEBHOOK_SECRET` (webhook secret may still be manual after Resend dashboard webhook create).

If interactive dashboard is preferred: `npx vercel integration open resend` (after a partial install) or Marketplace UI under the team.

## Still manual (not done this session)

1. **Resend** — provide owned `domain` + re-run install above; verify DNS in Resend; set webhook → `https://blogen-eight.vercel.app/api/webhooks/resend`
2. **Stripe webhook** — endpoint `https://blogen-eight.vercel.app/api/webhooks/stripe` for events in `docs/qa/checkpoint-f.md`; paste signing secret as `STRIPE_WEBHOOK_SECRET` on Vercel (all envs) → `env pull`
3. **`CRON_SECRET`** + **`NEXT_PUBLIC_SITE_URL`** on Vercel project env
4. **Optional:** claim Stripe sandbox → live; enable Connect Express; set `STRIPE_CONNECT_CLIENT_ID` if needed
5. **Migrations A→D** — not applied (no confirmation / no local `supabase` on PATH). Order:
   1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
   2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
   3. `supabase/migrations/20260821020000_phase1_stage_c.sql`
   4. `supabase/migrations/20260821030000_phase1_stage_d.sql`  
   Prefer `supabase db push` or Dashboard SQL after backup (`docs/qa/launch-readiness.md`).

## Provisioning scoreboard

| Capability | Provisioned? | Env pulled? |
| --- | --- | --- |
| Resend | **No** — needs `-m domain=… -m region=…` | No |
| Stripe | **Yes** (sandbox `stripe-emerald-pillar`) | **Yes** (secret + publishable; webhook secret still missing) |
| Migrations A–D | Not applied | — |
| Webhooks live | Stripe/Resend endpoints not wired | — |
| Cron secret / site URL | Still manual | — |
