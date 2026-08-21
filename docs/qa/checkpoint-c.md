# Checkpoint C — Stage A complete

Date: 2026-08-21

## Gate criteria (Stage A)

| Area | Status | Notes |
| --- | --- | --- |
| Quality baseline | Pass (local suite) | Vitest + Playwright smoke + GitHub Actions workflow |
| Aggregates | Pass (code) | RPCs + About/Categories/Authors wired; requires migration applied |
| Library | Pass (code) | Auth-required `/library`, ShareBar save, localStorage migrate-on-login |
| IA / profiles | Pass (code) | Explore/Library/Create/Profile nav; richer profile fields |
| Authoring | Pass (code) | Draft/publish/archive, autosave, preview, revisions on publish |
| Read / search / trust | Pass (code) | TOC, related, policies, reports + admin moderation |
| A11y / observability | Pass (smoke) | axe smoke on home; structured logs on save/library failures |

## Remaining before Stage B

1. Apply migration `20260821000000_phase1_stage_a.sql` to linked Supabase (local `db reset` or hosted migrate).
2. Confirm seeded roles still publish as `status=published` after backfill.
3. Run Playwright against a configured env (CI uses placeholder Supabase keys — library redirect and policy pages still exercise).
4. Manual smoke of draft → publish → public URL on real data.

Stage B (follows, reading progress, schedule cron, import/export) must not start until this checklist is green on a real project.
