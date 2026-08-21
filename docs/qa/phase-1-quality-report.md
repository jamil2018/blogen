# Phase 1 Quality Report — Stage E Exit Gate

**Date:** 2026-08-22  
**Scope:** Competitive-foundation exit for Blogen Phase 1 (Stages A–E)  
**Plan:** Phase 1 full plan (Stages A–E); exit criteria in `docs/product-roadmap/01-phase-1-ux-hardening.md`  
**Route matrix:** `docs/qa/phase-1-route-matrix.md`

## Verdict

**Phase 1 code on `main`: COMPLETE for continuing product work.**  
**Live email / paid journeys: DEFERRED to final deploy readiness** (not blockers for treating Phase 1 code as done).

Reader, writer, publication, analytics, and monetization/email **code paths** are in place. Live Resend sends and Stripe checkout/Connect wait until all features are ready to deploy. Until then, email/payment paths **refuse without env** (no mocked success) — confirmed by code and e2e webhook status checks.

---

## Automated suite results (2026-08-21)

| Suite | Command | Result | Evidence |
| --- | --- | --- | --- |
| Lint | `npm run lint` | **PASS** (0 errors, 12 warnings) | Pre-existing `@next/next/no-img-element` / hook warnings; fixed Stage E lint error in `PublicationsStudioView` (`react-hooks/set-state-in-effect`) |
| Typecheck | `npm run typecheck` | **PASS** | `tsc --noEmit` exit 0 |
| Unit / contracts | `npm test` | **PASS** | Vitest: **5 files, 30 tests** |
| Production build | `npm run build` | **PASS** | Next.js 16 build; routes include `/pubs/[slug]`, `/p/[slug]`, studio analytics/memberships/earnings, webhooks |
| Playwright smoke | `npm run e2e` | **PASS** | **15/15** Chromium tests (Stages A–D smoke): auth redirects, policies, a11y home (no critical axe), slug/pub soft-fail, Resend/Stripe webhooks return **503/401** when unconfigured |

CI workflow (`.github/workflows/ci.yml`) runs lint → typecheck → vitest, then build + e2e on PR/`main`.

### Env observed in this workspace

| Variable | Status |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / publishable / service role | SET (`.env.local`) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_WEBHOOK_SECRET` | **Deferred to deploy** — do not provision now |
| `STRIPE_*` / publishable | **Deferred to deploy** for live paid journeys (refuse-without-env until set) |
| `CRON_SECRET` / `NEXT_PUBLIC_SITE_URL` | **Deferred to deploy** (manual) |
| Vercel CLI `whoami` / project link | **OK** when linked |
| Marketplace install Resend / Stripe | **Deferred** until final deploy readiness (`docs/qa/ops-progress.md`) |

---

## Five parity journeys

### 1. Reader — **PASS (code)**; email legs deferred to deploy

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Discover a post | PASS (code + smoke) | `/` Explore; Stage A e2e home load |
| Read comfortably | PASS (code) | TOC, related, share, reading progress (Stage B) |
| Follow author / publication | PASS (code + smoke gates) | Follow controls; `/following` auth redirect e2e |
| Subscribe by email | **DEFERRED (deploy)** | Subscribe UI/actions exist; live sends wait for Resend at deploy |
| Receive and manage delivery | **DEFERRED (deploy)** | Resend webhook/suppression implemented; env at deploy prep |
| Save / respond / report | PASS (code + smoke) | Library auth redirect e2e; reports + `/admin/moderation` |
| Return via Library or feed | PASS (code) | `/library`, `/following` |

**Remaining for live email:** Resend at final deploy readiness; ensure Stage A–C migrations on the target project. Not a Phase 1 code-complete blocker.

### 2. Independent writer — **PASS (code)**; email/cron live deferred to deploy

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Register → profile | PASS (code) | Auth + `/user/profile` fields (Stage A) |
| Import or create | PASS (code) | Editor + `/user/posts/portability` |
| Save / recover / preview | PASS (code) | Draft autosave, `/user/posts/preview/[postId]` |
| Schedule / publish | PARTIAL | Schedule + cron route exist; **cron needs `CRON_SECRET` + service role on deploy** |
| Distribute to followers | PASS (code) | Web + followers distribution toggles |
| Distribute to email subscribers | **DEFERRED (deploy)** | Requires Resend at final deploy readiness |
| Inspect performance | PASS (code + smoke gate) | `/user/analytics` + rollups; empty-ok until traffic |
| Export owned content | PASS (code) | Portability export zip |

**Remaining for live schedule/email:** `CRON_SECRET` + Resend at deploy prep; apply Stage A–D migrations on target. Not a Phase 1 code-complete blocker.

### 3. Publication — **PASS (code)**; email legs deferred to deploy

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Create publication | PASS (code + smoke gate) | `/user/publications`; signed-out redirect e2e |
| Configure identity / branding | PASS (code) | Studio branding form; **custom domain deferred (P1)** |
| Invite contributor | PASS (code) | `publication_members` + invite action |
| Review submission | PASS (code) | Editorial states + audit |
| Publish / schedule on web | PASS (code) | Post + pub attribution; schedule as writer |
| Email subscribers | **DEFERRED (deploy)** | Newsletter send refuses without Resend until deploy |
| Moderate discussion | PASS (code) | Platform reports + admin queue; pub-level discussion moderation is report-path based |
| Inspect performance | PASS (code) | Publication-scoped analytics rollups |

**Remaining for live pub email:** Resend + Checkpoint E live checklist at deploy. Not a Phase 1 code-complete blocker.

### 4. Paid creator — **DEFERRED (deploy)** for live path; **PASS (code)** refuse-without-env

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Connect payment provider | **DEFERRED (deploy)** | Connect onboarding refuses without Stripe env; UI warns |
| Define tiers / access | PASS (code) | Tier CRUD + post `accessLevel` public\|members\|paid; Stripe Price sync when configured |
| Publish preview / paywalled content | PASS (code) | Server-side entitlement strip in `applyPaywall` / slug route |
| Reader checkout | **DEFERRED (deploy)** | `startMembershipCheckout` refuses without Stripe |
| Entitlement enforced | PASS (code) | Code path exists; live paid entitlement after Stripe at deploy |
| Earnings / payout | **DEFERRED (deploy)** | Ledger UI + Connect refuse without Stripe |
| Cancel / refund states | PASS (code) | Webhook handlers + admin `/admin/payments`; live after webhook secret |

**Remaining for live paid journeys:** Stripe + webhook (+ Connect) at final deploy readiness (Checkpoint F). Honest refuse-without-env verified by e2e (`/api/webhooks/stripe` ∈ {401, 503}). Not a Phase 1 code-complete blocker.

### 5. Migrating creator — **PASS (code)**; welcome/delivery live deferred to deploy

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Import content | PASS (code) | Portability Markdown/HTML zip + mapped/skipped/failed |
| Import consented subscribers | PARTIAL | CSV import with consent attestation in code; **needs Stage C migration + live rehearsal** |
| Inspect validation / errors | PASS (code) | Import reports |
| Configure welcome / delivery | **DEFERRED (deploy)** for live send | Welcome config stored; send requires Resend at deploy |
| Verify URLs / domain | PARTIAL | `/p/[slug]` + redirects; **custom domains deferred (P1)** |
| Export without lock-in | PASS (code) | Content export + audience CSV export |

**Remaining for live migration email:** Resend + migration apply + launch-readiness rehearsal at deploy (`docs/qa/launch-readiness.md`); custom domain out of Phase 1 P0. Not a Phase 1 code-complete blocker.

---

## P0 matrix status (roadmap competitive foundation)

| Area | P0 mandatory outcome | Status | Notes |
| --- | --- | --- | --- |
| Reading | Long-form, Library, continuity, comments, share, report | **PASS (code)** | Highlights/passage references: basic TOC/anchors; advanced highlights not a separate product surface |
| Discovery | Search, topics/tags, authors/pubs, Following, related | **PASS (code)** | |
| Identity | Profiles, expertise, links, contribution history, privacy | **PASS (code)** | |
| Authoring | Editor, recovery, preview, metadata, schedule, revisions, archive, import/export | **PASS (code)** | Cron secret required for prod schedule |
| Publications | Branded pub, homepage/archive/sections, roles, submission workflow | **PASS (code)** | Email distribution blocked on Resend |
| Audience | Follow vs subscribe, newsletters, consent, welcome, dashboard, import/export | **PASS (code)** | Schema + UI; **live email deferred to deploy** |
| Analytics | Post/traffic/pub/author/audience metrics + definitions | **PASS (code)** | `docs/analytics/metrics.md`; empty rollups until traffic |
| Monetization | Free/paid tiers, paywalls, checkout, entitlements, cancel/refund, earnings/payouts | **PASS (code)** | Refuse-without-env; **live Stripe deferred to deploy** |
| Community | Notifications (editorial), comments, reporting, moderation, support path | **PASS (code)** | Mute/block not shipped (acceptable minimum) |
| Trust | Policies, consent/suppression hooks, export/delete, copyright, audit, backups docs | **PASS (code)** | Policies + audit + launch docs; backup drill is ops at deploy |
| Platform | Responsive web, a11y smoke, SEO metadata, observability, rate-limit posture | **PASS (local)** | Home axe critical=0; observability via `logAppEvent` |

**P0 exit criterion “journeys pass end to end on production-like infra”:** **deferred to deploy readiness** for email/paid legs. Phase 1 **code** is complete enough to continue product work.

---

## P1 ship / defer / reject

Explicit decisions aligned with the Phase 1 plan locked deferrals plus other P1 items found in the roadmap matrix.

| P1 item | Decision | Rationale |
| --- | --- | --- |
| Custom domains (profile / publication) | **Defer** | Plan-locked; architecture uses `/pubs/[slug]` and `/p/[slug]` without foreclosing later DNS/Vercel domains |
| Verified / expert identity programs | **Defer** | Plan-locked; profiles carry expertise/links without verification badges |
| Trials / complimentary access | **Defer** | Plan-locked; Stripe membership statuses may include `trialing` in types for provider fidelity, but creator-facing trial/comp flows are not productized |
| Advanced email segmentation / targeted campaigns | **Defer** | Plan-locked; audience filter by status/source only |
| CSV cohort analytics beyond documented exports | **Defer** | Plan-locked; studio uses rollups + metric definitions; no cohort CSV builder |
| Publication recommendations / growth attribution | **Defer** | Not required for P0 Following + related-by-tags/category |
| Expanded embeds / reusable templates | **Defer** | TipTap baseline sufficient for Phase 1; expand in later phases |
| Advanced reading preferences | **Defer** | Reading progress on/off + Library is enough |
| Referrals (Substack-style) | **Reject for Phase 1** | Growth loop is out of competitive-foundation P0; revisit in Phase 2+ growth work |
| Founding / supporter tier UX beyond free+paid | **Defer** | Creators can model tiers via Stripe Prices once provisioned at deploy; no special founding UX |
| Publication-led community spaces | **Defer** | Comments + reports cover community minimum |
| Additional creator safety tooling | **Defer** | Admin moderation + payment support cases ship; deeper safety later |
| Custom-domain automation (platform P1) | **Defer** | Same as custom domains |

---

## Migration apply order checklist

Apply **exactly in order** on local (`supabase db reset` / migrate) or hosted (Supabase SQL / CLI):

| # | File | Stage |
| --- | --- | --- |
| 1 | `supabase/migrations/20260821000000_phase1_stage_a.sql` | A — status/RLS, library, reports, aggregates |
| 2 | `supabase/migrations/20260821010000_phase1_stage_b.sql` | B — follows, reading progress, schedule/slug redirects, portability support |
| 3 | `supabase/migrations/20260821020000_phase1_stage_c.sql` | C — publications, editorial, subscriptions/newsletters |
| 4 | `supabase/migrations/20260821030000_phase1_stage_d.sql` | D — analytics, memberships, ledger, Stripe event tables |

**Before apply:** snapshot / backup (see `docs/qa/launch-readiness.md`).  
**After apply:** regenerate types if needed; confirm seeded posts are `published`; spot-check About/Categories/Authors counts; run Vitest + Playwright; complete Checkpoints C–F checklists on the target environment.

Prior init migration(s) under `supabase/migrations/` must already be present on the project before Stage A.

---

## Phase exit criteria scorecard

From `docs/product-roadmap/01-phase-1-ux-hardening.md`:

| Criterion | Status |
| --- | --- |
| Count / pagination defects fixed + regression-tested | **PASS** (contracts + smoke; requires migrations on live DB) |
| Saving has clear Library model | **PASS** |
| Search, profiles, homepage, reading UX baseline | **PASS** |
| Registration-to-publication without content loss | **PASS (code)** — confirm on live seed |
| A11y / performance / metadata / moderation / telemetry gates active | **PASS (local)** |
| Knowledge-oriented copy without promising Phase 2/3 | **PASS** (positioning intent in Stage A) |
| No Phase 1 surface depends on graph | **PASS** |
| Every P0 implemented or approved equivalent | **PASS (code)** — live email/monetization at deploy |
| Five journeys pass end to end | **PASS (code)**; live email/paid legs **deferred to deploy** |
| Following, newsletters, audience, editorial, analytics, paid access, payouts on production-like infra | **PASS (code)** — Resend/Stripe/migrate/cron at deploy prep |
| Every P1 has ship/defer/reject | **PASS** (table above) |

---

## Remaining ops (deploy readiness — not Phase 1 code blockers)

Live tracker: **`docs/qa/ops-progress.md`** (2026-08-22).

**Product decision:** Skip configuring Resend and Stripe until all features are in place and the product is finally ready to deploy. Phase 1 code on `main` is complete for continuing product work.

1. ~~**Vercel login & link**~~ — done when needed for deploys (`jamil2018`, project `blogen`).
2. **At final deploy readiness — Resend:** owned domain + Marketplace install → env pull → webhook (Checkpoint E / `docs/qa/ops-progress.md`). Until then, refuse-without-env stands.
3. **At final deploy readiness — Stripe:** Marketplace (or confirm existing resource) → webhook secret → optional Connect (Checkpoint F). Until then, refuse-without-env stands.
4. **At deploy — app env:** `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`; ensure `SUPABASE_SERVICE_ROLE_KEY` on the host for cron/admin.
5. **When promoting an environment — apply DB migrations** A → B → C → D; run launch-readiness rehearsal.
6. **Cron:** ensure `CRON_SECRET` on Vercel after deploy (`vercel.json` schedules `/api/cron/publish-scheduled`).
7. **Re-run Checkpoints E & F** live only at deploy prep; sandbox newsletter send + Stripe test-mode checkout then.
8. **Ops drills:** backup/restore, abuse/load smoke, Supabase advisors (`docs/qa/launch-readiness.md`).
9. **Sign live email/paid journey evidence** after deploy provision flips deferred legs → PASS on production-like infra.

---

## Related artifacts

- `docs/qa/ops-progress.md` — deferred Resend/Stripe + deploy ops tracker
- `docs/qa/checkpoint-c.md` — Stage A
- `docs/qa/checkpoint-d.md` — Stage B
- `docs/qa/checkpoint-e.md` — Stage C / **deploy readiness (Resend)**
- `docs/qa/checkpoint-f.md` — Stage D / **deploy readiness (Stripe)**
- `docs/qa/launch-readiness.md` — Stage D4 ops
- `docs/qa/canonical-counts.md`, `docs/qa/seeded-roles.md`
- `docs/analytics/metrics.md`

---

*Stage E quality gate: Phase 1 code complete for product continuation. Live Resend + Stripe are deferred until final deploy readiness; refuse-without-env remains mandatory until then.*
