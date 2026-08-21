# Phase 1 Route / Journey Matrix

Canonical roles for Phase 1 quality gates (Stages A–E). Seeded credentials: `supabase/seed.sql` and `docs/qa/seeded-roles.md`.

Updated for Stage E exit (2026-08-21). See also `docs/qa/phase-1-quality-report.md`.

## Roles

| Role | Auth | Capabilities |
| --- | --- | --- |
| Signed-out reader | Anonymous | Browse published posts, search, categories, authors, pubs, policies; Save/Library/Following → login |
| Signed-in reader | Authenticated | Library, Following, comments, report, subscribe (email when Resend configured); cannot edit others' posts |
| Author / creator | Authenticated | Studio posts, portability, publications (owner), analytics, memberships, earnings |
| Pub editor / contributor | Authenticated + membership | Editorial review / submit per role matrix |
| Admin | `profiles.is_admin = true` | Full moderation, payments support, admin CRUD |

## Public routes

| Route | Signed-out | Signed-in reader | Author | Admin |
| --- | --- | --- | --- | --- |
| `/` (Explore) | Yes | Yes | Yes | Yes |
| `/about` | Yes | Yes | Yes | Yes |
| `/categories` | Yes | Yes | Yes | Yes |
| `/authors` | Yes | Yes | Yes | Yes |
| `/authors/[id]` | Yes | Yes | Yes | Yes |
| `/posts/[id]` | Published only | Published only | Own drafts + published | All |
| `/p/[slug]` | Published slug (+ redirects); paywall strips body when not entitled | Same | Same | Same |
| `/pubs/[slug]` | Public pub homepage / archive / sections | + follow / subscribe | Same | Same |
| `/search/[q]` | Published only | Published only | Published only | Published only |
| `/posts/search/categories/[name]` | Published only | Published only | Published only | Published only |
| `/posts/search/tags/[name]` | Published only | Published only | Published only | Published only |
| `/library` | Redirect → login | Yes | Yes | Yes |
| `/following` | Redirect → login | Yes | Yes | Yes |
| `/privacy`, `/terms`, `/content-policy`, `/copyright` | Yes | Yes | Yes | Yes |
| `/login`, `/register` | Yes | Redirect home | Redirect home | Redirect home |

## Auth / studio routes

| Route | Signed-out | Signed-in reader | Author | Admin |
| --- | --- | --- | --- | --- |
| `/user/dashboard` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/posts` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/posts/create` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/posts/edit/[id]` | Redirect → login | Own only | Own only | Via `/admin` |
| `/user/posts/preview/[postId]` | Redirect → login | Own only | Own only | Via `/admin` |
| `/user/posts/portability` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/publications` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/analytics` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/memberships` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/earnings` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/user/profile` | Redirect → login | Yes | Yes | Redirect → `/admin` |
| `/admin/moderation` | Redirect → login | No | No | Yes |
| `/admin/payments` | Redirect → login | No | No | Yes |
| `/admin/*` | Redirect → login | Forbidden → `/` | Forbidden → `/` | Yes |

## API / webhook / cron routes

| Route | Auth / gate | Notes |
| --- | --- | --- |
| `/api/cron/publish-scheduled` | `CRON_SECRET` bearer | Promotes due `scheduled` posts; refuses without secret |
| `/api/webhooks/resend` | `RESEND_WEBHOOK_SECRET` | Bounce/complaint → suppression; **503** if unconfigured |
| `/api/webhooks/stripe` | `STRIPE_WEBHOOK_SECRET` | Memberships / ledger / disputes; **503** if unconfigured |
| `/auth/callback` | OAuth code exchange | Supabase Auth |

## Critical journeys (smoke coverage)

### Stage A (stabilize)

1. Discover & read → related → share
2. Save to Library (auth-required; signed-out → login)
3. Search autocomplete + results states
4. Draft → autosave → preview → publish → public URL; unpublish/archive
5. Published-only aggregates (About / Categories / Authors)
6. Report → admin moderation
7. Policy footer links

### Stage B (reader / writer)

8. Following feed + follow controls
9. Reading progress (optional clear/disable)
10. Schedule + cron + revision history + `/p/[slug]` redirects
11. Content import/export (`/user/posts/portability`)

### Stage C (publications / email)

12. Create/configure publication → `/pubs/[slug]`
13. Editorial submit/review/audit
14. Audience CSV import/export + subscribe UI
15. Newsletter send / welcome (**requires Resend**; otherwise refuse)

### Stage D (business / trust)

16. Analytics rollups + view beacon
17. Membership tiers + paywall entitlement
18. Checkout / portal / Connect (**requires Stripe**; otherwise refuse)
19. Earnings ledger + admin payment support

## Pagination contract

- Homepage Latest = newest N published posts (`limit` default 6).
- Homepage All Posts = paginated published posts via `?page=` (clamp when `page` exceeds `totalPages`).
- Public counts never include `draft`, `scheduled`, or `archived`.
- Email-only / paywalled bodies must not leak via list cards or unentitled slug views.
