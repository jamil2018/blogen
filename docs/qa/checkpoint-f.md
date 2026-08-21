# Checkpoint F — Stage D exit

Stage D (Tasks 21–24) business and trust checklist before Stage E.

## Apply order

1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
3. `supabase/migrations/20260821020000_phase1_stage_c.sql`
4. `supabase/migrations/20260821030000_phase1_stage_d.sql`

## Checklist

- [ ] `/user/analytics` shows rollups (empty-ok until traffic); definitions match `docs/analytics/metrics.md`
- [ ] View beacon fires on `/p/[slug]`; follow/subscribe insert analytics events
- [ ] Membership tiers CRUD under `/user/memberships`; post Access = public | members | paid
- [ ] Paywall strips body when not entitled on slug route; members CTA shown
- [ ] Checkout / portal / Connect **refuse** without Stripe env (no fake success)
- [ ] `/api/webhooks/stripe` returns 503 without secret, 401 with bad signature
- [ ] `/user/earnings` ledger KPIs + Connect onboarding entry
- [ ] `/admin/payments` dispute/support cases
- [ ] Launch docs under `docs/qa/` reviewed (migration, moderation, backup, abuse)

## Stripe provisioning (blocked on Marketplace terms)

`vercel whoami` + project link + discover are **done**. Install stopped on terms acceptance. Do **not** mock payments. See `docs/qa/ops-progress.md`.

### Exact user steps (remaining)

1. Accept terms in browser:  
   https://vercel.com/jamil2018s-projects/~/integrations/accept-terms/stripe?source=cli
2. Install Stripe for this project (preferred Marketplace payments provider):
   ```bash
   npx vercel --non-interactive integration add stripe --no-claim
   ```
3. Pull env into `.env.local`:
   ```bash
   npx vercel env pull .env.local --yes
   ```
4. Confirm these app names exist (map from integration-prefixed names if needed):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_CONNECT_CLIENT_ID` (optional; Express)
5. Point Stripe webhook endpoint to `https://blogen-eight.vercel.app/api/webhooks/stripe` for at least:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
   - `account.updated`
6. Enable Connect Express in the Stripe dashboard for creator payouts.
7. Re-create paid tiers from `/user/memberships` so Stripe Prices sync; run a **test-mode** checkout.

Until step 4 succeeds, studio shows warnings; `startMembershipCheckout`, portal, and Connect throw instead of reporting fake success.

## Also still blocked from Stage C

- Resend Marketplace (see `docs/qa/checkpoint-e.md`)

## Stage E readiness

Stage E can exercise reader / writer / publication journeys now. Paid-creator and migrating-creator journeys need Stripe (+ Resend for email) provisioned for full pass evidence.
