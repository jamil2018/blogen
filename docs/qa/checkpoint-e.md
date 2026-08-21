# Checkpoint E — Stage C / Deploy readiness (Resend)

Stage C (Tasks 17–20) publications and distribution. **Code for Stage C is complete** with refuse-without-env. Live Resend is **not** a Stage C gate — configure only at **final deploy readiness**.

## Apply order (when promoting an environment)

1. `supabase/migrations/20260821000000_phase1_stage_a.sql`
2. `supabase/migrations/20260821010000_phase1_stage_b.sql`
3. `supabase/migrations/20260821020000_phase1_stage_c.sql`

## Stage C code checklist

- [x] Create/configure publication under `/user/publications`; public `/pubs/[slug]` archive + sections
- [x] Follow publication targets appear in Following feed; email-only posts excluded from public/web feeds
- [x] Editorial roles owner | editor | contributor; submission transitions + audit + notifications
- [x] Subscribe on pub page; audience dashboard search/filter; CSV import requires consent attestation; CSV export
- [x] Newsletter draft/preview/schedule/send + delivery log (**refuses without Resend env**)
- [x] Resend webhook handler `/api/webhooks/resend` for bounce/complaint/suppression
- [x] Welcome email config on publication (sends only when Resend env present)

## Deploy readiness checklist — Resend

**Do not provision now.** Skip Resend until all features are in place and the product is finally ready to deploy. Do **not** mock sends. See `docs/qa/ops-progress.md`.

### Exact steps (at final deploy readiness only)

1. Accept Marketplace terms if prompted for Resend.
2. Install Resend (requires owned domain + region — not `*.vercel.app`):
   ```bash
   npx vercel --non-interactive integration add resend/resend-email --no-claim --plan free \
     -m domain=YOUR_OWNED_DOMAIN \
     -m region=us-east-1
   ```
3. Pull env into `.env.local` / Vercel:
   ```bash
   npx vercel env pull .env.local --yes
   ```
4. Confirm these names exist (map from integration prefixes if needed):
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (verified sender)
   - `RESEND_WEBHOOK_SECRET` (Svix secret for `/api/webhooks/resend`)
5. In Resend dashboard, point the webhook URL to `https://blogen-eight.vercel.app/api/webhooks/resend` for bounce/complaint events.
6. Re-run unit/e2e and a sandbox send from `/user/publications` → Newsletters → Send.

Until step 4 succeeds at deploy, studio shows a warning; `sendNewsletterNow` and welcome sends throw instead of reporting fake success.

## Related

- Stripe live config is likewise deferred — see `docs/qa/checkpoint-f.md`
- Paywalls/entitlements code refuses without Stripe; live checkout at deploy
