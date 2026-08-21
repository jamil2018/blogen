# Phase 1 Plan: Competitive Publishing Foundation and UX Hardening

## Objective

Make Blogen a credible alternative to Medium/Substack before introducing knowledge features. Bug fixing and UX hardening are the first workstream, not the entire phase. The phase also delivers the mandatory reader, writer, publication, distribution, audience, analytics, migration, moderation, and monetization capabilities defined below.

## Observed baseline

- Categories displayed zero articles while category detail pages displayed populated results.
- The Authors directory reported zero articles for an author whose profile displayed four.
- The About page reported zero articles and topics despite populated public pages.
- Homepage pagination advertised a second page but produced an empty All Posts section after clicking Next.
- Signed-out bookmarking displayed a successful save state without a visible saved-items destination or persistence explanation.
- Homepage inventory was repeated across Latest Articles and All Posts.
- Public positioning and onboarding copy described a generic thoughtful-writing community.
- Profiles provided little identity beyond counts, articles, and an email action.
- The mobile hero initially exposed a large dark loading region before its image appeared.
- The authenticated editor and publishing workflow were not inspectable without creating an account; they must be audited at the start of implementation.

## Scope

### Included

- data consistency and public functional defects
- information architecture and positioning clarification
- search, navigation, saved-content, categories, author profiles, and reading polish
- authenticated authoring/publishing audit and essential fixes
- accessibility, responsive behavior, performance, SEO, policies, reporting, and telemetry
- a dependable quality baseline for later phases
- following and personalized reader feeds
- branded multi-author publications and editorial workflow
- email subscriptions, newsletters, audience management, and deliverability
- creator/audience/content analytics
- content and subscriber import/export
- paid memberships, paywalls, entitlements, and creator payouts

### Excluded

- graph generation
- external-source ingestion
- AI drafting
- public collaborative knowledge spaces
- advanced media products such as native podcast hosting and live video
- a generic short-form social feed or chat clone
- native mobile applications

## Delivery stages

1. **Stage A — Stabilize:** Complete Tasks 1–12 and remove observed defects and lifecycle uncertainty.
2. **Stage B — Reader and writer parity:** Complete Tasks 13–16 so Blogen is dependable for ongoing reading and independent publishing.
3. **Stage C — Publication and distribution parity:** Complete Tasks 17–20 so publications can manage contributors and own audience delivery.
4. **Stage D — Business and trust parity:** Complete Tasks 21–24 so creators can measure, monetize, migrate, moderate, and operate safely.
5. **Stage E — Competitive-foundation release:** Run the parity journeys and require the explicit phase exit gate.

## Competitive-foundation requirements

“Feature parity” means that a serious writer or publication should not reject Blogen because a core reading, writing, distribution, audience, ownership, analytics, editorial, or revenue workflow is absent. It does not require copying every interface, media format, ranking system, or mature-platform feature.

The baseline reflects currently documented Medium capabilities including publications, network distribution, followers, newsletters, audience statistics, and custom domains, plus Substack capabilities including subscriber management/import/export, welcome flows, email delivery, analytics, paid publications, recommendations, and referrals.

### Priority classification

- **P0 — Mandatory foundation:** Must ship and pass quality gates before Phase 2 begins.
- **P1 — Competitive expansion:** Must receive an explicit ship, defer, or reject decision with rationale during Phase 1.
- **P2 — Deliberate deferral:** Not required before knowledge integration, but architecture must not foreclose it.

### Capability matrix

| Area | P0 mandatory outcome | P1 expansion | P2 deferral |
|---|---|---|---|
| Reading | Accessible long-form reading, Library, reading continuity, responses/comments, highlights or passage references, sharing, reporting | Advanced reading preferences | Native offline application |
| Discovery | Full search, topics/tags, authors/publications, following feed, explainable related/recommended content | Publication recommendations and growth attribution | Short-form engagement-ranked social feed |
| Identity | Reader/writer profiles, expertise, links, contribution history, privacy controls | Verified or expert identity programs | Complex reputation scoring |
| Authoring | Rich editor, recovery, preview, metadata, schedule, revisions, archive/unpublish, content import/export | Expanded embeds and reusable templates | AI creation before the knowledge workflow |
| Publications | Branded publication, homepage/archive/sections, subscription, owner/editor/contributor roles, submission/review workflow | Custom domains and deeper theme controls | Native site builder parity |
| Audience | Follow versus subscribe, newsletter delivery, consent lifecycle, welcome flows, subscriber dashboard, safe import/export | Limited segmentation, targeted email, recommendations, referrals | General marketing-automation suite |
| Analytics | Post, traffic, publication, author, audience, acquisition, retention, and email metrics with documented definitions | CSV export and advanced cohorts | Cross-site surveillance/advertising analytics |
| Monetization | Free/paid tiers, monthly/annual pricing, paywalls, checkout, entitlements, cancellation/refund states, earnings and payouts | Trials, complimentary access, founding/supporter tier | Sponsorship marketplace and complex commerce |
| Community | Notifications, comments/responses, reporting, moderation, mute/block where relevant, appeals/support path | Publication-led community spaces | Chat clone or real-time community product |
| Trust | Privacy, consent records, unsubscribe/suppression, deletion/export, copyright/takedown, audit logs, backups, recovery | Additional creator safety tooling | Automated truth or reputation scoring |
| Platform | Responsive web, accessibility, performance, SEO, observability, rate limits, reconciliation | Custom-domain automation | Native mobile apps, live video, native podcast hosting |

### Required parity journeys

#### Reader

Discover a post → read comfortably → follow an author/publication → subscribe by email → receive and manage delivery → save/respond/report → return through Library or feed.

#### Independent writer

Register → complete profile → import or create a post → save/recover → preview → schedule/publish → distribute to followers/subscribers → inspect performance → export owned content and audience data.

#### Publication

Create publication → configure identity/domain → invite contributor → review submission → publish/schedule/email → moderate discussion → inspect author/section/audience performance.

#### Paid creator

Connect payment provider → define tiers/access → publish preview/paywalled content → reader subscribes → entitlement is enforced → creator sees earnings/payout → reader cancels or receives a refund through defined states.

#### Migrating creator

Import consented subscribers and content → inspect validation/errors → configure welcome and delivery → verify URLs/domain → export platform-owned data without lock-in.

### Competitive reference sources

- Medium: [publication distribution](https://help.medium.com/hc/en-us/articles/360018677974-What-happens-to-your-story-when-you-publish-on-Medium), [newsletters](https://help.medium.com/hc/en-us/articles/115004682167-Newsletter), [audience statistics](https://help.medium.com/hc/en-us/articles/4405449973015-Audience-stats), and [custom domains](https://help.medium.com/hc/en-us/articles/115003053487-Setting-up-a-custom-domain-for-your-profile-or-publication).
- Substack: [subscriber management](https://support.substack.com/hc/en-us/articles/360058529871-How-do-I-use-the-subscriber-dashboard-on-Substack), [list import](https://support.substack.com/hc/en-us/articles/360037829931-How-do-I-import-my-mailing-list-from-another-platform-such-as-Mailchimp-Ghost-or-Beehiiv), [welcome emails](https://support.substack.com/hc/en-us/articles/24034796625428-How-do-I-set-up-welcome-emails-on-Substack), [metrics](https://support.substack.com/hc/en-us/articles/5320347155860-A-guide-to-Substack-metrics), [paid publications](https://support.substack.com/hc/en-us/articles/360037459952-How-do-I-set-up-a-paid-publication), and [subscriber referrals](https://support.substack.com/hc/en-us/articles/16142857300372-What-are-subscriber-referrals-on-Substack).

These references must be refreshed immediately before implementation because competitor capabilities change.

## Workstreams and tasks

### Task 1: Establish a reproducible product-quality baseline

**Description:** Inventory routes, domain queries, roles, responsive breakpoints, analytics, and the complete authenticated lifecycle using dedicated test users and seeded content.

**Acceptance criteria:**

- [ ] A route/journey matrix covers signed-out reader, signed-in reader, author, and administrator states.
- [ ] Canonical definitions exist for article, author, topic, comment, and engagement counts.
- [ ] Current failures are captured as reproducible tests or issue records before fixes begin.

**Verification:** Run the automated suite, complete a desktop/mobile smoke pass, and preserve evidence for each known defect.

**Dependencies:** None.

**Estimated scope:** M.

### Task 2: Unify public aggregate data

**Description:** Replace inconsistent or placeholder count sources with one authoritative aggregation contract used by About, Categories, category details, Authors, and profiles.

**Acceptance criteria:**

- [ ] The same published post is counted consistently across every public surface.
- [ ] Drafts, archived posts, and unpublished content follow explicitly tested visibility rules.
- [ ] Counts update correctly after publish, unpublish, category change, and deletion.

**Verification:** Contract tests for aggregation rules plus seeded end-to-end comparisons across all affected pages.

**Dependencies:** Task 1.

**Estimated scope:** M.

### Task 3: Repair listing, filtering, sorting, and pagination

**Description:** Establish one predictable list-query contract for homepage posts, author posts, categories, tags, search, and sort controls.

**Acceptance criteria:**

- [ ] Next/Previous never leads to an impossible or unrecoverable page.
- [ ] Empty results explain why they are empty and provide a recovery action.
- [ ] List state is linkable and stable across refresh/back navigation where appropriate.

**Verification:** Boundary tests for zero, one, exactly-one-page, and multi-page datasets; browser tests for filters and history navigation.

**Dependencies:** Tasks 1–2.

**Estimated scope:** M.

### Checkpoint A: Data credibility

- [ ] All seeded counts agree across surfaces.
- [ ] Pagination and filters pass boundary tests.
- [ ] No regressions in public post visibility.

### Task 4: Make saving understandable and retrievable

**Description:** Decide and implement an explicit anonymous/signed-in saving model and add a clear Library destination.

**Acceptance criteria:**

- [ ] Every successful save can be retrieved from an obvious interface.
- [ ] Anonymous saves state that they are device-local, or saving requires authentication with an honest prompt.
- [ ] Repeated clicks, account transitions, and network failures cannot silently lose or duplicate saved state.

**Verification:** Browser tests for anonymous, authenticated, failure, retry, and cross-session behavior.

**Dependencies:** Task 1.

**Estimated scope:** M.

### Task 5: Clarify navigation and homepage roles

**Description:** Remove repeated inventory and give each homepage module a distinct purpose. Introduce stable top-level destinations for Explore, Library, Create, and Profile while preserving appropriate public links.

**Acceptance criteria:**

- [ ] Homepage modules do not simply repeat the same posts.
- [ ] Primary destinations are reachable and understandable on desktop and mobile.
- [ ] Categories and author directories remain discoverable without dominating the product model.

**Verification:** First-click usability checks and automated navigation coverage at supported breakpoints.

**Dependencies:** Task 3 and the positioning decision in the master roadmap.

**Estimated scope:** M.

### Task 6: Strengthen profiles and social credibility

**Description:** Let authors communicate identity, expertise, and contribution history without prematurely building a follower-driven social network.

**Acceptance criteria:**

- [ ] Profiles support biography, expertise/topics, avatar, and approved external links.
- [ ] Contribution statistics are accurate and meaningful.
- [ ] Contact actions explain their destination and do not expose private email addresses unexpectedly.

**Verification:** Permission tests, profile editing tests, public rendering checks, and privacy review.

**Dependencies:** Tasks 1–2.

**Estimated scope:** M.

### Task 7: Audit and harden authoring

**Description:** Inspect the existing editor and make the essential draft lifecycle reliable: create, edit, autosave/manual save, preview, validation, recovery, and revision-safe publishing.

**Acceptance criteria:**

- [ ] An author can create, save, leave, return to, preview, and publish a post without data loss.
- [ ] Validation and failure states preserve user content and identify the recovery action.
- [ ] Published output matches preview for headings, media, links, code, and metadata.

**Verification:** End-to-end author journey, forced network failure/recovery tests, refresh/close recovery, and rendered-output comparison.

**Dependencies:** Task 1.

**Estimated scope:** Split into M-sized slices after the audit.

### Task 8: Harden publication management

**Description:** Make post status, scheduling if already supported, unpublishing, deletion, URL behavior, revisions, and sharing metadata explicit and safe.

**Acceptance criteria:**

- [ ] Authors always know whether a post is draft, published, scheduled, or archived.
- [ ] Destructive or visibility-changing actions require clear confirmation and predictable URL behavior.
- [ ] Social metadata, canonical URLs, feeds/sitemaps, and public HTML reflect the correct revision.

**Verification:** State-transition tests, metadata inspection, link stability checks, and permission tests.

**Dependencies:** Task 7.

**Estimated scope:** M.

### Checkpoint B: Publish confidently

- [ ] New authors can reach a successfully published post from registration.
- [ ] Draft recovery and permission boundaries pass.
- [ ] Preview and published rendering agree.

### Task 9: Improve the reading experience

**Description:** Preserve the restrained article layout while adding useful long-form affordances where content length warrants them.

**Acceptance criteria:**

- [ ] Long posts can expose an accessible table of contents and stable heading links.
- [ ] Related content is relevant and labeled as such; initial implementation may use categories/tags.
- [ ] Share, reading progress, comments, and author information behave correctly with and without authentication.

**Verification:** Short/long article fixtures, keyboard testing, share-link validation, and related-content relevance spot checks.

**Dependencies:** Task 3.

**Estimated scope:** M.

### Task 10: Complete search and discovery states

**Description:** Turn autocomplete into a coherent search journey with full results, keyboard interaction, filters, and honest no-result behavior.

**Acceptance criteria:**

- [ ] Search suggestions and full results use consistent matching rules.
- [ ] The experience is operable by keyboard and announces result changes appropriately.
- [ ] Query, category, tag, and author discovery pages handle loading, empty, and failure states.

**Verification:** Search contract tests, keyboard/screen-reader checks, and result consistency comparisons.

**Dependencies:** Task 3.

**Estimated scope:** M.

### Task 11: Establish platform trust and safety essentials

**Description:** Add the minimum viable policy and moderation framework required for user publishing.

**Acceptance criteria:**

- [ ] Privacy, terms, copyright/reuse, content policy, and reporting paths are publicly reachable.
- [ ] Readers can report posts/comments and authors can understand moderation outcomes.
- [ ] Administrative actions are permissioned, logged, and reversible where appropriate.

**Verification:** Policy-link audit, role/permission tests, report lifecycle test, and audit-log inspection.

**Dependencies:** Task 1.

**Estimated scope:** Split into policy and product M-sized slices.

### Task 12: Set accessibility, performance, and observability gates

**Description:** Make quality measurable in CI and production rather than dependent on periodic manual review.

**Acceptance criteria:**

- [ ] Critical journeys meet agreed accessibility checks and keyboard behavior.
- [ ] Responsive images avoid avoidable blank hero states and excessive transfer size.
- [ ] Client/server failures, slow queries, failed saves, and failed publishes are observable without collecting unnecessary personal data.

**Verification:** Automated accessibility checks, performance budgets, error injection, and mobile/desktop browser smoke tests.

**Dependencies:** Can begin after Task 1 and concludes after Tasks 2–11.

**Estimated scope:** Multiple S/M slices.

### Checkpoint C: Stabilized product

- [ ] Tasks 1–12 pass on production-like infrastructure.
- [ ] Observed defects no longer obscure feature-parity testing.
- [ ] Core lifecycle contracts are stable enough to support audience, publication, and payment work.

### Task 13: Deliver following and a dependable reader home

**Description:** Let readers follow authors, topics, and publications and receive a useful Following feed with bounded, explainable recommendations.

**Acceptance criteria:**

- [ ] Follow/unfollow state is consistent across cards, profiles, publications, and feeds.
- [ ] Readers can choose a chronological Following view and understand why recommended content appears.
- [ ] New and sparse accounts have useful onboarding/empty states without fabricated activity.

**Verification:** Cross-surface state tests, feed-ranking fixtures, privacy review, and new/established reader usability tests.

**Dependencies:** Tasks 2–6 and Task 10.

**Estimated scope:** Multiple M vertical slices.

### Task 14: Complete account-backed reading continuity

**Description:** Extend saving into a reliable Library and add privacy-appropriate reading continuity across devices.

**Acceptance criteria:**

- [ ] Saved posts, reading position/history where enabled, and notification preferences are retrievable across sessions/devices.
- [ ] Users can disable or clear reading-history behavior independently of saved posts.
- [ ] Account deletion/export includes the defined reader data.

**Verification:** Cross-device tests, privacy/control tests, data export/deletion inspection, and offline/retry scenarios.

**Dependencies:** Task 4 and Task 12.

**Estimated scope:** M.

### Task 15: Complete independent-writer publishing parity

**Description:** Extend the hardened editor with scheduling, canonical/SEO/social metadata, publication targeting, revision history, and author-controlled interaction/distribution settings.

**Acceptance criteria:**

- [ ] A writer can publish now or schedule, control metadata, select audience/distribution, and inspect immutable revision history.
- [ ] Preview accurately represents web and email output where both are selected.
- [ ] Unpublish/archive/URL transitions preserve links or provide deliberate redirects.

**Verification:** Scheduled-publication tests with time boundaries, metadata validators, revision tests, and preview/output comparison.

**Dependencies:** Tasks 7–9.

**Estimated scope:** Multiple M slices.

### Task 16: Add content portability

**Description:** Give authors a supported import path and a complete export of their posts, media references, metadata, and revision/publication information.

**Acceptance criteria:**

- [ ] Supported imports report mapped, skipped, and failed content without silent loss.
- [ ] Export uses documented standard formats and contains enough information to leave Blogen.
- [ ] Import is idempotent or provides safe duplicate resolution.

**Verification:** Round-trip fixtures, malformed/large import tests, duplicate tests, and human inspection of exported content.

**Dependencies:** Tasks 7–8 and Task 12.

**Estimated scope:** Multiple M slices.

### Checkpoint D: Reader and independent-writer parity

- [ ] Required reader and independent-writer journeys pass.
- [ ] Following, Library, publishing, scheduling, and portability work across supported devices.
- [ ] No knowledge-graph feature is required to make Blogen useful.

### Task 17: Introduce branded publications

**Description:** Make publications first-class entities with identity, homepage, sections, archive, subscription, navigation, and controlled theming.

**Acceptance criteria:**

- [ ] Publication owners can configure branding and information architecture without breaking accessibility or performance budgets.
- [ ] Posts can belong to the intended author/publication relationship with correct canonical attribution.
- [ ] Publication pages have complete loading, empty, error, archive, and subscription states.

**Verification:** Creation/configuration tests, post ownership tests, responsive/accessibility review, and metadata checks.

**Dependencies:** Tasks 5, 8, 12, and 15.

**Estimated scope:** Multiple M slices.

### Task 18: Add editorial roles and submission workflow

**Description:** Support owner, editor, and contributor roles plus submit, review, request-changes, accept/reject, schedule, and audit states.

**Acceptance criteria:**

- [ ] Each role has a tested permission matrix and cannot cross publication boundaries.
- [ ] Contributors retain authorship while publication editors control publication acceptance and timing.
- [ ] Review decisions, content changes, and role changes are auditable and notify the correct participants.

**Verification:** Permission/adversarial tests, end-to-end contributor workflow, audit inspection, and notification tests.

**Dependencies:** Task 17 and Task 15.

**Estimated scope:** Multiple M slices.

### Task 19: Build subscriptions and newsletter delivery

**Description:** Separate in-product following from consented email subscription and support web-only, email-only, and web+email publication.

**Acceptance criteria:**

- [ ] Subscribe, confirmation where required, preferences, unsubscribe, suppression, bounce, complaint, and re-subscribe states are defined and enforced.
- [ ] Authors can preview/test, schedule, send, observe delivery, and safely retry/reconcile ambiguous failures.
- [ ] Web archives and email delivery follow the author’s selected mode without accidental exposure.

**Verification:** Email-provider sandbox tests, suppression/bounce/complaint scenarios, scheduling tests, accessibility/email-client review, and reconciliation tests.

**Dependencies:** Tasks 15 and 17; Task 12 observability.

**Estimated scope:** Multiple M slices.

### Task 20: Add audience management and onboarding

**Description:** Provide a subscriber dashboard, consent-safe import/export, welcome page/emails, preferences, limited segmentation, and acquisition attribution.

**Acceptance criteria:**

- [ ] Creators can search/filter subscribers, inspect consent/status/source, and perform only authorized lifecycle actions.
- [ ] Imports require consent attestation, validate risk/errors/duplicates, and preserve suppression rules; exports use a standard format.
- [ ] New subscribers receive the correct configurable welcome experience for their tier and preferences.

**Verification:** Import/export fixtures, abuse/spam review scenarios, subscriber-state tests, and welcome-flow tests.

**Dependencies:** Task 19 and Task 11 policy framework.

**Estimated scope:** Multiple M slices.

### Checkpoint E: Publication and distribution parity

- [ ] A publication can recruit contributors, review work, publish on web, and deliver to subscribers.
- [ ] Audience consent, suppression, import/export, and welcome journeys pass.
- [ ] Delivery failures are observable and reconcilable.

### Task 21: Deliver creator analytics

**Description:** Provide trustworthy post, publication, audience, traffic, and email analytics with explicit metric definitions.

**Acceptance criteria:**

- [ ] Creators can inspect performance by post, author, publication section/topic, audience action, traffic source, and delivery channel.
- [ ] Follower/subscriber growth, acquisition, retention/churn, and post-attributed conversions use documented definitions.
- [ ] Privacy-sensitive email metrics follow the applicable product/legal posture and can be exported where promised.

**Verification:** Event-to-report reconciliation, seeded analytics fixtures, privacy review, and CSV validation.

**Dependencies:** Tasks 12–13 and 17–20.

**Estimated scope:** Multiple M slices.

### Task 22: Add paid memberships and access control

**Description:** Support creator-defined free/paid tiers, monthly/annual pricing, trials/complimentary access where approved, and full/preview/subscriber-only posts.

**Acceptance criteria:**

- [ ] Checkout, renewal, cancellation, failed payment, refund policy, and entitlement recovery have complete reader states.
- [ ] Paywall authorization is enforced server-side across web, email, feeds, previews, and direct URLs.
- [ ] Tier changes and access transitions do not leak restricted content or strand legitimate readers.

**Verification:** Payment-provider sandbox, authorization/adversarial tests, webhook replay/idempotency tests, and entitlement reconciliation.

**Dependencies:** Tasks 17, 19–20, and Task 11 policy framework.

**Estimated scope:** Multiple M slices.

### Task 23: Add creator earnings and payout operations

**Description:** Provide payment-provider onboarding, earnings/fees ledger, payout visibility, tax/compliance handoff, disputes, refunds, and support states.

**Acceptance criteria:**

- [ ] Creators can reconcile gross revenue, fees, refunds, net earnings, and payout status.
- [ ] Payment onboarding and payout restrictions are explicit without Blogen storing unnecessary sensitive financial data.
- [ ] Webhook/event replay cannot duplicate entitlements, refunds, or ledger entries.

**Verification:** Ledger invariants, provider sandbox scenarios, payout reconciliation, dispute/refund cases, and security review.

**Dependencies:** Task 22 and Task 21.

**Estimated scope:** Multiple M slices.

### Task 24: Complete migration, moderation, support, and launch readiness

**Description:** Validate content/audience migration, community safety, administrative operations, support escalation, backups, and recovery as one production-readiness program.

**Acceptance criteria:**

- [ ] The migrating-creator journey succeeds with transparent skipped/error outcomes and no consent-rule bypass.
- [ ] Report, comment moderation, publication moderation, account/payment support, and appeals have defined ownership and auditability.
- [ ] Backup/restore, incident response, rate limits, abuse detection, and operational dashboards pass launch exercises.

**Verification:** Migration rehearsal, moderation tabletop, recovery drill, abuse/load tests, and operational sign-off.

**Dependencies:** Tasks 11–12 and 16–23.

**Estimated scope:** Multiple M slices.

## Phase exit criteria

- [ ] All observed count and pagination defects are fixed and regression-tested.
- [ ] Saving has a clear persistence model and Library destination.
- [ ] Search, profiles, homepage, and article reading meet the agreed UX baseline.
- [ ] Registration-to-publication succeeds without content loss.
- [ ] Accessibility, performance, metadata, moderation, and telemetry gates are active.
- [ ] Product copy introduces Blogen’s knowledge-oriented direction without promising unavailable functionality.
- [ ] No Phase 1 surface depends on the future graph feature to feel complete.
- [ ] Every P0 item in this plan’s competitive-foundation requirements is implemented or has an explicitly approved equivalent outcome.
- [ ] Reader, independent-writer, publication, paid-creator, and migrating-creator journeys pass end to end.
- [ ] Following, newsletters, subscriber lifecycle, audience ownership, editorial workflow, analytics, paid access, and payouts operate on production-like infrastructure.
- [ ] Every P1 item has an explicit ship/defer/reject decision with rationale.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Fixes expose conflicting data models | High | Define canonical visibility/count rules before changing individual pages. |
| Phase becomes an endless parity project | High | Use the P0/P1/P2 matrix; require outcome parity while rejecting unrelated feature cloning. |
| Email/payments multiply operational risk | High | Use established providers, idempotent event processing, reconciliation, conservative scope, and launch drills. |
| Parity delays differentiation for too long | High | Release vertical slices incrementally, validate target creators continuously, and begin Phase 2 design research without shipping it early. |
| Navigation anticipates features too early | Medium | Ship only real destinations; use limited previews/waitlists only when clearly labeled. |
| Editor defects are larger than expected | High | Audit first, then split work into vertical draft/publish slices. |
| Metrics encourage shallow engagement | Medium | Measure successful tasks and reuse, not only time-on-site. |

## Phase deliverables

- route and journey matrix
- canonical aggregate-data contract
- verified read/save/search/profile/publish flows
- updated information architecture and positioning copy
- accessibility/performance budgets
- production telemetry dashboard
- signed Phase 1 quality report
- completed competitive-foundation matrix
- reader/writer/publication/paid-creator/migration journey evidence
- newsletter and subscriber operations
- publication/editorial system
- creator analytics and paid-membership operations
