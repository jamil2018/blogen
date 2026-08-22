# Phase 2 analytics funnel

Privacy-safe workflow events for the save → collection → intent → space loop.

## Events

| Event | Funnel stage | Payload fields |
|---|---|---|
| `library_save` | save | `post_id` |
| `collection_created` | collection | `collection_id` |
| `source_added_to_collection` | collection | `collection_id`, `post_id` |
| `collection_intent_set` | intent | `collection_id` |
| `annotation_created` | annotation | `collection_id`, `post_id` |
| `space_promoted` | space | `collection_id`, `space_id`, `source_count` |
| `reading_path_saved` | path | `path_id`, `collection_id`, `source_count` |
| `reading_path_started` | path | `path_id`, `source_count` |

## Explicit exclusions

Never record in analytics payloads:

- collection intent text
- annotation note bodies
- passage quotes or highlights
- private collection names (optional future: hashed ids only)

## Phase 3 proceed criteria (research template)

Review after 30 days of production data:

1. **Proceed** if ≥15% of library savers create a collection with ≥2 sources and return within 7 days.
2. **Change** if collections are created but intent/space promotion is <5% — simplify terminology or surface intent earlier.
3. **Stop** if library save rate drops or error rates on `source_added_to_collection` exceed 2%.

Log funnel stage via `phase2FunnelStage()` in application code when building dashboards.
