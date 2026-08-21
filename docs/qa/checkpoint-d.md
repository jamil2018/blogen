# Checkpoint D — Stage B exit

Stage B (Tasks 13–16) reader/writer parity checklist before Stage C.

## Apply order

1. `supabase/migrations/20260821000000_phase1_stage_a.sql` (if not already applied)
2. `supabase/migrations/20260821010000_phase1_stage_b.sql`

## Checklist

- [ ] Following feed auth-gated; empty onboarding suggests real authors/topics
- [ ] Follow controls on author profiles, category cards, post detail
- [ ] Reading progress optional; disable/clear independent of Library
- [ ] Account export JSON includes library, follows, progress, prefs; delete reader data works
- [ ] Schedule publish + `/api/cron/publish-scheduled` (requires `CRON_SECRET` + service role)
- [ ] Revision history visible on edit; distribution toggles (email deferred)
- [ ] Stable `/p/[slug]` URLs; slug change writes `post_slug_redirects`
- [ ] Import/export zip under `/user/posts/portability` with mapped/skipped/failed report

## Archive behavior

Archived posts leave public feeds (`status != published`) but retain their id and prior slug redirects so links can still resolve for authors/admins. Public slug pages only serve `published` posts.

## Stage C blockers

- Resend Marketplace provision for email distribution / newsletters
- `publications` schema before publication follow targets are real
- Stripe not required for Stage C
