# Checkpoint F — Stage D / Deploy readiness (Stripe)

Stage D (Tasks 21–24) business and trust. **Code for Stage D is complete** with refuse-without-env. Live Stripe is **not** a Stage D gate — configure only at **final deploy readiness**.

## Apply order (when promoting an environment)

1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
3. `supabase/migrations/20260821020000_phase1_stage_c.sql`
4. `supabase/migrations/20260821030000_phase1_stage_d.sql`

## Stage D code checklist

- [x] `/user/analytics` shows rollups (empty-ok until traffic); definitions match `docs/analytics/metrics.md`
- [x] View beacon fires on `/p/[slug]`; follow/subscribe insert analytics events
- [x] Membership tiers CRUD under `/user/memberships`; post Access = public | members | paid
- [x] Paywall strips body when not entitled on slug route; members CTA shown
- [x] Checkout / portal / Connect **refuse** without Stripe env (no fake success)
- [x] `/api/webhooks/stripe` returns 503 without secret, 401 with bad signature
- [x] `/user/earnings` ledger KPIs + Connect onboarding entry
- [x] `/admin/payments` dispute/support cases
- [x] Launch docs under `docs/qa/` reviewed (migration, moderation, backup, abuse)

## Deploy readiness checklist — Stripe

**Do not provision now.** Skip Stripe live configuration until all features are in place and the product is finally ready to deploy. Do **not** mock payments. See `docs/qa/ops-progress.md`.

### Exact steps (at final deploy readiness only)

1. Accept Marketplace terms if prompted for Stripe.
2. Install Stripe for this project (or confirm an existing Marketplace resource):
   ```bash
   npx vercel --non-interactive integration add stripe --no-claim
   ```
3. Pull env into `.env.local` / Vercel:
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

Until step 4 succeeds at deploy, studio shows warnings; `startMembershipCheckout`, portal, and Connect throw instead of reporting fake success.

## Also deferred from Stage C

- Resend Marketplace (see `docs/qa/checkpoint-e.md`) — same deploy-readiness window

## Stage E / product continuation

Phase 1 **code** on `main` is complete for continuing product work. Reader / writer / publication journeys are exercisable in code. Paid-creator and email-dependent legs get full live pass evidence only after Stripe (+ Resend) at final deploy readiness.
