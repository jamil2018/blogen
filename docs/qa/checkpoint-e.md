# Checkpoint E — Stage C exit

Stage C (Tasks 17–20) publications and distribution checklist before Stage D.

## Apply order

1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
3. `supabase/migrations/20260821020000_phase1_stage_c.sql`

## Checklist

- [ ] Create/configure publication under `/user/publications`; public `/pubs/[slug]` archive + sections
- [ ] Follow publication targets appear in Following feed; email-only posts excluded from public/web feeds
- [ ] Editorial roles owner | editor | contributor; submission transitions + audit + notifications
- [ ] Subscribe on pub page; audience dashboard search/filter; CSV import requires consent attestation; CSV export
- [ ] Newsletter draft/preview/schedule/send + delivery log (requires Resend)
- [ ] Resend webhook `/api/webhooks/resend` handles bounce/complaint/suppression
- [ ] Welcome email config on publication (sends only when Resend env present)

## Resend provisioning (blocked on Marketplace terms)

`vercel whoami` + project link + discover are **done**. Install stopped on terms acceptance. Do **not** mock sends. See `docs/qa/ops-progress.md`.

### Exact user steps (remaining)

1. Accept terms in browser:  
   https://vercel.com/jamil2018s-projects/~/integrations/accept-terms/resend?source=cli
2. Install Resend for this project:
   ```bash
   npx vercel --non-interactive integration add resend/resend-email --no-claim
   ```
3. Pull env into `.env.local`:
   ```bash
   npx vercel env pull .env.local --yes
   ```
4. Confirm these names exist (names may be prefixed by the integration; map to app names if needed):
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (verified sender)
   - `RESEND_WEBHOOK_SECRET` (Svix secret for `/api/webhooks/resend`)
5. In Resend dashboard, point the webhook URL to `https://blogen-eight.vercel.app/api/webhooks/resend` for bounce/complaint events.
6. Re-run unit/e2e and a sandbox send from `/user/publications` → Newsletters → Send.

Until step 4 succeeds, studio shows a warning; `sendNewsletterNow` and welcome sends throw instead of reporting fake success.

## Stage D blockers

- Stripe Marketplace provision (payments / Connect) — see `docs/qa/checkpoint-f.md`
- ~~Analytics event ingest + rollups~~ (Stage D shipped)
- Paywalls/entitlements depend on Stripe for live checkout; server refuse-without-env is in place
