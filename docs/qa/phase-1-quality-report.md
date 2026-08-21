# Phase 1 Quality Report — Stage E Exit Gate

**Date:** 2026-08-21  
**Scope:** Competitive-foundation exit for Blogen Phase 1 (Stages A–E)  
**Plan:** Phase 1 full plan (Stages A–E); exit criteria in `docs/product-roadmap/01-phase-1-ux-hardening.md`  
**Route matrix:** `docs/qa/phase-1-route-matrix.md`

## Verdict

**Code/CI foundation: PASS (local automated suites).**  
**Production-like Phase 1 exit: PARTIAL / not fully exited.**

Reader and independent-writer journeys are implementable and smoke-covered in code. Publication structural paths (create pub, editorial UI, audience CSV) are present. **Paid-creator and email-dependent publication/migrating-creator steps are BLOCKED** until the user provisions Resend + Stripe via Vercel Marketplace, pulls env, applies migrations A→D, and sets `CRON_SECRET`. Email/payment paths **refuse without env** (no mocked success) — confirmed by code and e2e webhook status checks.

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
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_WEBHOOK_SECRET` | **MISSING** (Resend install needs owned domain metadata) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **SET** (Marketplace sandbox `stripe-emerald-pillar`; also `STRIPE_PUBLISHABLE_KEY` alias) |
| `STRIPE_WEBHOOK_SECRET` | **MISSING** (create webhook endpoint, then add secret) |
| `STRIPE_CONNECT_CLIENT_ID` | **MISSING** (optional Connect) |
| `CRON_SECRET` | **MISSING** (manual; not from Marketplace) |
| `NEXT_PUBLIC_SITE_URL` | **MISSING** (manual; set to production URL) |
| Vercel CLI `whoami` / project link | **OK** (`jamil2018`; project `blogen` linked) |
| Marketplace install Stripe | **OK** (sandbox; claim later) |
| Marketplace install Resend | **BLOCKED** — provide `-m domain=<owned>` (see `docs/qa/ops-progress.md`) |

---

## Five parity journeys

### 1. Reader — **PARTIAL**

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Discover a post | PASS (code + smoke) | `/` Explore; Stage A e2e home load |
| Read comfortably | PASS (code) | TOC, related, share, reading progress (Stage B) |
| Follow author / publication | PASS (code + smoke gates) | Follow controls; `/following` auth redirect e2e |
| Subscribe by email | **BLOCKED** | Subscribe UI/actions exist; sends require Resend |
| Receive and manage delivery | **BLOCKED** | Resend webhook/suppression implemented but env missing |
| Save / respond / report | PASS (code + smoke) | Library auth redirect e2e; reports + `/admin/moderation` |
| Return via Library or feed | PASS (code) | `/library`, `/following` |

**Blockers:** Resend Marketplace + env; DB migrations A–C applied on target project for follows/subscriptions tables.

### 2. Independent writer — **PARTIAL**

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Register → profile | PASS (code) | Auth + `/user/profile` fields (Stage A) |
| Import or create | PASS (code) | Editor + `/user/posts/portability` |
| Save / recover / preview | PASS (code) | Draft autosave, `/user/posts/preview/[postId]` |
| Schedule / publish | PARTIAL | Schedule + cron route exist; **cron needs `CRON_SECRET` + service role on deploy** |
| Distribute to followers | PASS (code) | Web + followers distribution toggles |
| Distribute to email subscribers | **BLOCKED** | Requires Resend |
| Inspect performance | PASS (code + smoke gate) | `/user/analytics` + rollups; empty-ok until traffic |
| Export owned content | PASS (code) | Portability export zip |

**Blockers:** Resend for email distribution; apply Stage A–D migrations; set cron secret for scheduled go-live in production.

### 3. Publication — **PARTIAL**

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Create publication | PASS (code + smoke gate) | `/user/publications`; signed-out redirect e2e |
| Configure identity / branding | PASS (code) | Studio branding form; **custom domain deferred (P1)** |
| Invite contributor | PASS (code) | `publication_members` + invite action |
| Review submission | PASS (code) | Editorial states + audit |
| Publish / schedule on web | PASS (code) | Post + pub attribution; schedule as writer |
| Email subscribers | **BLOCKED** | Newsletter send refuses without Resend |
| Moderate discussion | PASS (code) | Platform reports + admin queue; pub-level discussion moderation is report-path based |
| Inspect performance | PASS (code) | Publication-scoped analytics rollups |

**Blockers:** Resend; migrations through Stage C (+ D for analytics); Checkpoint E live checklist still unchecked on production-like infra.

### 4. Paid creator — **BLOCKED**

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Connect payment provider | **BLOCKED** | Connect onboarding throws without Stripe env; UI warns |
| Define tiers / access | PARTIAL | Tier CRUD + post `accessLevel` public\|members\|paid in studio; **Stripe Price sync needs Stripe** |
| Publish preview / paywalled content | PARTIAL | Server-side entitlement strip in `applyPaywall` / slug route; live paid entitlement needs memberships from Stripe |
| Reader checkout | **BLOCKED** | `startMembershipCheckout` refuses without Stripe |
| Entitlement enforced | PARTIAL | Code path exists; end-to-end paid entitlement unproven without Stripe |
| Earnings / payout | **BLOCKED** | Ledger UI + Connect refuse without Stripe |
| Cancel / refund states | PARTIAL | Webhook handlers + admin `/admin/payments`; untested live |

**Blockers:** Stripe Marketplace provision + webhook endpoint + Connect Express (Checkpoint F). Honest refuse-without-env verified by e2e (`/api/webhooks/stripe` ∈ {401, 503}).

### 5. Migrating creator — **PARTIAL**

| Step | Status | Evidence / blocker |
| --- | --- | --- |
| Import content | PASS (code) | Portability Markdown/HTML zip + mapped/skipped/failed |
| Import consented subscribers | PARTIAL | CSV import with consent attestation in code; **needs Stage C migration + live rehearsal** |
| Inspect validation / errors | PASS (code) | Import reports |
| Configure welcome / delivery | **BLOCKED** for live send | Welcome config stored; send requires Resend |
| Verify URLs / domain | PARTIAL | `/p/[slug]` + redirects; **custom domains deferred (P1)** |
| Export without lock-in | PASS (code) | Content export + audience CSV export |

**Blockers:** Resend for welcome/delivery; migration apply + launch-readiness rehearsal (`docs/qa/launch-readiness.md`); custom domain out of Phase 1 P0.

---

## P0 matrix status (roadmap competitive foundation)

| Area | P0 mandatory outcome | Status | Notes |
| --- | --- | --- | --- |
| Reading | Long-form, Library, continuity, comments, share, report | **PASS (code)** | Highlights/passage references: basic TOC/anchors; advanced highlights not a separate product surface |
| Discovery | Search, topics/tags, authors/pubs, Following, related | **PASS (code)** | |
| Identity | Profiles, expertise, links, contribution history, privacy | **PASS (code)** | |
| Authoring | Editor, recovery, preview, metadata, schedule, revisions, archive, import/export | **PASS (code)** | Cron secret required for prod schedule |
| Publications | Branded pub, homepage/archive/sections, roles, submission workflow | **PASS (code)** | Email distribution blocked on Resend |
| Audience | Follow vs subscribe, newsletters, consent, welcome, dashboard, import/export | **PARTIAL** | Schema + UI; **live email BLOCKED** |
| Analytics | Post/traffic/pub/author/audience metrics + definitions | **PASS (code)** | `docs/analytics/metrics.md`; empty rollups until traffic |
| Monetization | Free/paid tiers, paywalls, checkout, entitlements, cancel/refund, earnings/payouts | **PARTIAL / BLOCKED live** | Code + refuse-without-env; **Stripe required** |
| Community | Notifications (editorial), comments, reporting, moderation, support path | **PASS (code)** | Mute/block not shipped (acceptable minimum) |
| Trust | Policies, consent/suppression hooks, export/delete, copyright, audit, backups docs | **PARTIAL** | Policies + audit + launch docs; backup drill is ops (user) |
| Platform | Responsive web, a11y smoke, SEO metadata, observability, rate-limit posture | **PASS (local)** | Home axe critical=0; observability via `logAppEvent` |

**P0 exit criterion “journeys pass end to end on production-like infra”:** **NOT MET** until Resend + Stripe + migrations + cron are live.

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
| Founding / supporter tier UX beyond free+paid | **Defer** | Creators can model tiers via Stripe Prices once provisioned; no special founding UX |
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
| Every P0 implemented or approved equivalent | **PARTIAL** — monetization/email live ops incomplete |
| Five journeys pass end to end | **PARTIAL / BLOCKED** (see above) |
| Following, newsletters, audience, editorial, analytics, paid access, payouts on production-like infra | **PARTIAL** — code ready; Resend/Stripe/migrate/cron pending |
| Every P1 has ship/defer/reject | **PASS** (table above) |

---

## Remaining user / ops actions (required to fully exit Phase 1)

Live tracker: **`docs/qa/ops-progress.md`** (2026-08-21).

1. ~~**Vercel login & link**~~ — **done** (`jamil2018`, project `blogen` linked).
2. **Provision Resend:** needs owned domain metadata —  
   `npx vercel --non-interactive integration add resend/resend-email --no-claim --plan free -m domain=YOUR_DOMAIN -m region=us-east-1` → `npx vercel env pull .env.local --yes` → webhook `https://blogen-eight.vercel.app/api/webhooks/resend` (Checkpoint E / `docs/qa/ops-progress.md`).
3. ~~**Provision Stripe (Marketplace)**~~ — **done** (sandbox `stripe-emerald-pillar`). Still need **webhook secret** + optional claim/Connect: point Stripe to `https://blogen-eight.vercel.app/api/webhooks/stripe` (events in Checkpoint F) → set `STRIPE_WEBHOOK_SECRET` → enable Connect Express if desired.
4. **Set app env (manual):** `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` (e.g. `https://blogen-eight.vercel.app`); ensure `SUPABASE_SERVICE_ROLE_KEY` on the host for cron/admin.
5. **Apply DB migrations** A → B → C → D on the target Supabase project (confirm before remote apply; `supabase db push` or Dashboard SQL); run launch-readiness migration rehearsal.
6. **Cron:** `vercel.json` already schedules `/api/cron/publish-scheduled`; ensure `CRON_SECRET` is set on Vercel after deploy.
7. **Re-run Checkpoints E & F** live checklists; sandbox newsletter send + Stripe test-mode checkout.
8. **Ops drills:** backup/restore note, abuse/load smoke, Supabase advisors after Stage D (`docs/qa/launch-readiness.md`).
9. **Sign this report** after paid + email journeys flip from BLOCKED → PASS on production-like infra.

---

## Related artifacts

- `docs/qa/ops-progress.md` — live Marketplace / env / migration ops tracker
- `docs/qa/checkpoint-c.md` — Stage A
- `docs/qa/checkpoint-d.md` — Stage B
- `docs/qa/checkpoint-e.md` — Stage C / Resend
- `docs/qa/checkpoint-f.md` — Stage D / Stripe
- `docs/qa/launch-readiness.md` — Stage D4 ops
- `docs/qa/canonical-counts.md`, `docs/qa/seeded-roles.md`
- `docs/analytics/metrics.md`

---

*Stage E quality gate recorded. Do not treat Phase 1 as fully exited on production until Resend, Stripe, migrations, and cron are verified live.*
