# Blogen analytics metrics

First-party event ingest (`analytics_events`) and daily rollups (`analytics_daily_rollups`). Studio charts read rollups only.

## Privacy posture

| Allowed in payload | Never stored |
|---|---|
| Coarse channel (`direct`, `internal`, `search`, `social`, `email`, `other`) | Raw IP addresses |
| Referrer host + short path (no query string) | Email addresses |
| Device class (`mobile` / `desktop` / `tablet` / `unknown`) | Full user-agent strings |
| Opaque `session_hash` (SHA-256 prefix of client UUID) | Card/bank PAN |
| Optional `actor_user_id` when signed in | Exact GPS / fingerprinting IDs |

Anonymous clients may emit only `view` and `read_complete`.

## Event definitions

| Event | Meaning | Typical source |
|---|---|---|
| `view` | Post detail rendered (once per mount) | `PostAnalyticsBeacon` |
| `read_complete` | Scroll depth ≥ ~85% | `PostAnalyticsBeacon` |
| `follow` / `unfollow` | Follow toggle succeeded | `toggleFollow` |
| `subscribe` / `unsubscribe` | Email subscription lifecycle | subscribe actions |
| `checkout_start` | Checkout session created | `startMembershipCheckout` |
| `checkout_complete` | Stripe `checkout.session.completed` | webhook |
| `membership_cancel` | Subscription canceled | webhook |
| `membership_refund` | Charge refunded | webhook |
| `email_open` / `email_click` | Reserved for Resend engagement (when wired) | email pipeline |

### Phase 2 workflow events

Privacy-safe funnel events for save → collection → intent → space. See [phase-2-funnel.md](./phase-2-funnel.md) for proceed criteria.

| Event | Meaning | Typical source |
|---|---|---|
| `library_save` | Post saved to library | `toggleLibrarySave` |
| `collection_created` | User created a collection | `createUserCollection` |
| `source_added_to_collection` | Post added to a collection | `addToCollection` |
| `collection_intent_set` | Collection purpose/intent updated | `updateCollectionIntent` |
| `annotation_created` | Passage annotation saved | `createPassageAnnotation` |
| `space_promoted` | Collection promoted to knowledge space | `promoteCollectionToSpace` |
| `reading_path_saved` | Full path saved to a collection | `saveReadingPathToCollection` |
| `reading_path_started` | Reading path detail viewed | `recordReadingPathStarted` |

Phase 2 payloads may include opaque ids (`post_id`, `collection_id`, `path_id`, `space_id`, `source_count`) only — never intent text, annotation bodies, or passage quotes.

## Rollup scopes

Daily counters by `scope_type`:

- `author` — creator dashboard (`/user/analytics`)
- `publication` — publication owners/editors
- `post` — per-post drill-down (same table; UI may filter later)
- `platform` — internal nil-UUID scope for ops

## Derived KPIs (studio)

- **Views** — sum of `views`
- **Read completes** — sum of `read_completes` (engagement proxy, not unique readers)
- **Follows / subscribes** — net growth is `follows − unfollows` / `subscribes − unsubscribes` over the window
- **Checkout conversion** — `checkout_completes / checkout_starts` when starts &gt; 0

Unique-visitor and cohort analytics are **P1 deferred**.

## Reconciliation

1. Insert fixture events → confirm rollup row increments for author/post/platform.
2. Replay the same webhook event id → entitlements/ledger must not double (Stripe path); analytics may count once per insert.
3. Export: creators may CSV-export rollups later; do not export raw `analytics_events.payload` with session hashes to third parties without review.
