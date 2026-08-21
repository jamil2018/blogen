# Launch readiness — Stage D4

Operational checklist for production-like exit. Pair with Checkpoints C–F.

**Note:** Live **Resend** and **Stripe** Marketplace provisioning is deferred until all features are in place and the product is finally ready to deploy. Code already refuses email/payments without env. Use Checkpoints E/F as the deploy-readiness checklists when that time comes — do not block continuing Phase 1+ product work on provisioning now.

## Migration rehearsal (content + subscribers)

1. Snapshot staging DB (`pg_dump` or Supabase backup).
2. Apply migrations in order A → B → C → D on a clone.
3. Run content import (`/user/posts/portability`) with a known Markdown zip; record mapped / skipped / failed.
4. Run audience CSV import with consent attestation; confirm suppressions are not reactivated.
5. Spot-check public counts (About / Categories / Authors) remain published-only.
6. Document duration and any manual fixes in the Stage E quality report.

## Moderation ownership

| Surface | Owner | Tooling |
|---|---|---|
| Post/comment reports | Platform admin | `/admin/moderation` |
| Publication submissions | Pub owner/editor | `/user/publications` editorial |
| Payment disputes / refunds | Platform admin + creator | `/admin/payments`, Stripe Dashboard |
| Appeals | Admin responds via support case notes | `payment_support_cases` + report audit |

Appeals: reopen report or payment case with status notes; retain audit rows (do not delete history).

## Rate limits (initial posture)

| Path | Guidance |
|---|---|
| Auth | Rely on Supabase Auth rate limits |
| Analytics ingest | Client beacons are low-volume; reject oversized payloads (DB check &lt; 2KB) |
| Webhooks | Idempotent by event id; Stripe/Resend retries are safe |
| CSV import | Cap rows in application layer (Stage C importer); reject without consent |
| Checkout | Stripe-side rate limits; app refuses when unconfigured |

Document any Vercel Firewall / WAF rules added at launch in the quality report.

## Backup / restore drill

1. Confirm automated Supabase backups enabled for the project.
2. Practice restore to a scratch project or branch; verify auth users + posts + subscriptions.
3. Re-link Storage buckets if restore is DB-only.
4. Record RPO/RTO observed.

Blogen does not store card PAN; payment state is recovered from Stripe + `memberships` / `ledger_entries` / `stripe_events`.

## Abuse / load smoke

- [ ] Signed-out crawl of homepage, search, `/p/[slug]` under modest concurrency
- [ ] Burst of analytics `view` events does not 5xx the app
- [ ] Webhook replay of the same Stripe `event_id` does not duplicate memberships/ledger
- [ ] Report spam path still creates rows without leaking PII in logs (`logAppEvent` message-only)

## Ops dashboard checklist

- Vercel deployment health + runtime logs
- Supabase advisors (RLS, unused indexes) after Stage D migration
- **At final deploy readiness:** Stripe test → live switch (Checkpoint F)
- **At final deploy readiness:** Resend domain + webhook health (Checkpoint E)
- Cron `/api/cron/publish-scheduled` with `CRON_SECRET`
