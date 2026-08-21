# Phase 2 Plan: Minimal-Disruption Feature Integration

## Objective

Introduce knowledge-oriented behaviors through additive, independently useful features. This phase should change how users save, organize, and traverse posts without replacing the article editor, publication model, or public reading experience.

Its architectural purpose is to establish the source-selection and provenance primitives that Phase 3 will require.

## Product promise

> Save useful writing, organize it around a purpose, and follow meaningful paths through related ideas.

## Integration strategy

- Extend the Phase 1 Library rather than inventing a second saving system.
- Treat a collection as a simple source set before it becomes a knowledge space.
- Add provenance-ready metadata during ordinary publishing without requiring authors to build graphs.
- Introduce relationship language in curated or machine-suggested reading paths, but retain conservative claims.
- Keep every feature useful if Phase 3 is delayed.

## Scope

### Included

- collections of saved Blogen posts
- source selection from cards, posts, search, and Library
- optional collection intent/question
- post structure and immutable revision references
- annotations and passage references
- curated reading paths and basic relationship labels
- author reuse permissions and provenance preferences
- a lightweight knowledge-space shell without graph generation
- metrics needed to validate the differentiated direction

### Excluded

- automatic graph construction
- graph visualization/editing
- AI-generated drafts
- external URLs/PDFs/video ingestion
- public multiplayer editing
- automated truth/confidence scoring

## Workstreams and tasks

### Task 1: Define revision-safe source references

**Description:** Establish identifiers for published post revisions, sections, and stable passage anchors so saved sources and future claims cannot silently drift.

**Acceptance criteria:**

- [ ] A source reference identifies the post, exact revision, and optional passage.
- [ ] Editing a post creates defined behavior for existing references without silently rewriting them.
- [ ] Deleted/unpublished sources retain safe tombstone behavior for authorized users and derived artifacts.

**Verification:** Revision, unpublish, deletion, permission, and anchor-stability contract tests.

**Dependencies:** Phase 1 publication lifecycle.

**Estimated scope:** M.

### Task 2: Extend Library items into collections

**Description:** Let users group saved Blogen posts into named, private collections using the existing saving model.

**Acceptance criteria:**

- [ ] A user can create, rename, reorder, and remove items from a collection.
- [ ] One post may belong to multiple collections without duplication errors.
- [ ] Empty, loading, error, and permission states are complete.

**Verification:** Collection CRUD tests, keyboard/reordering checks, and cross-device persistence tests.

**Dependencies:** Task 1 and Phase 1 Library.

**Estimated scope:** M.

### Task 3: Make source selection available in context

**Description:** Add a consistent “Add to collection” action to post cards, article pages, search results, related content, and Library.

**Acceptance criteria:**

- [ ] Source selection uses consistent language and feedback across all surfaces.
- [ ] Users can create a collection without abandoning their reading context.
- [ ] Duplicate selection and permission failures are understandable and recoverable.

**Verification:** Cross-surface interaction tests and reader usability session.

**Dependencies:** Task 2.

**Estimated scope:** M.

### Checkpoint A: Source collection

- [ ] Users can reliably assemble and revisit multi-post collections.
- [ ] All items resolve to revision-safe source references.
- [ ] Library and collection terminology tests well with target users.

### Task 4: Add intent to collections

**Description:** Allow an optional question, goal, or frame such as “Understand the reliability costs of coding agents.” This turns a generic folder into the precursor of a knowledge space.

**Acceptance criteria:**

- [ ] Users can add and revise an intent without changing the source set.
- [ ] The interface explains that the same sources may be organized differently for different intents.
- [ ] Intent remains private unless the collection is deliberately shared in a future phase.

**Verification:** Persistence tests and comprehension testing with at least three distinct source/intent examples.

**Dependencies:** Task 2.

**Estimated scope:** S.

### Task 5: Support private passage annotations

**Description:** Let users highlight or reference passages and attach private notes inside their collections.

**Acceptance criteria:**

- [ ] A highlight retains its source revision and passage location.
- [ ] Users can inspect the original context and remove or edit their note.
- [ ] Post revisions and permissions produce explicit stale/unavailable states.

**Verification:** Selection/anchor tests across representative content blocks, accessibility checks, and revision scenarios.

**Dependencies:** Task 1 and Task 2.

**Estimated scope:** M.

### Task 6: Capture provenance-ready post structure

**Description:** Store and expose safe structural metadata for native posts: sections, citations, tags, author, revision, publication time, and referenced Blogen posts.

**Acceptance criteria:**

- [ ] Metadata is produced consistently for new and edited native posts.
- [ ] Existing posts have an explicit backfill or unsupported-state strategy.
- [ ] Internal structure does not alter canonical article rendering.

**Verification:** Metadata contract tests, migration/backfill report, and rendered-post regression tests.

**Dependencies:** Task 1 and Phase 1 editor lifecycle.

**Estimated scope:** M.

### Task 7: Introduce author reuse and attribution controls

**Description:** Let authors state whether their published work may participate in private knowledge spaces, public lineage, quotations, and future synthesis.

**Acceptance criteria:**

- [ ] Defaults are understandable and privacy-preserving.
- [ ] Changes apply prospectively according to a documented policy and do not falsify historical lineage.
- [ ] Users can see why a post is or is not eligible for a requested reuse action.

**Verification:** Permission matrix tests, author comprehension review, and policy/legal review.

**Dependencies:** Task 1.

**Estimated scope:** M.

### Checkpoint B: Provenance foundation

- [ ] Native post revisions, passages, and structural metadata are stable.
- [ ] Annotations survive supported edits or show explicit stale states.
- [ ] Reuse decisions are enforceable at the data boundary.

### Task 8: Ship curated reading paths

**Description:** Create ordered multi-post paths with short editorial explanations of how each item relates to the previous one.

**Acceptance criteria:**

- [ ] A path clearly states its purpose, order, authors, and estimated commitment.
- [ ] Relationship labels use a controlled initial vocabulary such as introduces, extends, applies, or challenges.
- [ ] Readers can save a path or add its posts to a collection without losing source identity.

**Verification:** Path creation/display tests, mobile reading check, and editorial quality review.

**Dependencies:** Tasks 2–3 and Task 6.

**Estimated scope:** M.

### Task 9: Add conservative related-idea discovery

**Description:** Improve related content beyond shared categories by using explicit citations, shared structured metadata, and curated relationships. Avoid presenting probabilistic similarity as factual intellectual agreement.

**Acceptance criteria:**

- [ ] Every displayed relationship has an explainable basis.
- [ ] Curated, author-declared, and automatically suggested relationships are visually distinguishable.
- [ ] Low-confidence or unavailable results degrade to the existing related-content behavior.

**Verification:** Relevance evaluation set, explanation inspection, and false-relationship review.

**Dependencies:** Tasks 6 and 8.

**Estimated scope:** M.

### Task 10: Introduce the knowledge-space shell

**Description:** Allow a collection with an intent to be promoted into a private workspace showing sources, annotations, activity, and future graph availability—without pretending a graph exists yet.

**Acceptance criteria:**

- [ ] Promotion preserves collection sources, ordering, notes, and revision references.
- [ ] The space is useful for reviewing sources even without graph generation.
- [ ] UI language describes available capabilities precisely and does not promise automatic synthesis.

**Verification:** Collection-to-space migration test, permission checks, and usability review.

**Dependencies:** Tasks 2, 4–7.

**Estimated scope:** M.

### Task 11: Instrument and evaluate the new loop

**Description:** Measure whether readers actually organize multiple sources and return to them before investing in the full graph experience.

**Acceptance criteria:**

- [ ] Metrics cover save → collection → intent → space transitions without recording private note content.
- [ ] Funnel failures and latency are observable.
- [ ] A research review produces explicit proceed/change/stop recommendations for Phase 3.

**Verification:** Event-schema audit, privacy review, synthetic funnel test, and research report.

**Dependencies:** Tasks 2–10.

**Estimated scope:** M.

## Phase exit criteria

- [ ] Users can assemble and revisit collections of native Blogen sources.
- [ ] Collections may carry an intent and private passage annotations.
- [ ] Every selected source is bound to an explicit post revision.
- [ ] Native posts expose enough structural metadata for claim extraction.
- [ ] Reuse and attribution permissions are enforceable.
- [ ] Reading paths demonstrate relationship-oriented discovery.
- [ ] A collection can become a useful private knowledge-space shell.
- [ ] Evidence shows whether users understand and value the multi-source workflow.
- [ ] Existing reading, authoring, and publishing journeys remain stable.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Collections feel like ordinary folders | Medium | Add intent, annotations, paths, and explainable relationships while keeping terminology simple. |
| Passage anchors break after edits | High | Bind to revisions and display stale-reference states; never silently re-anchor. |
| Consent language is confusing | High | Use concrete examples and validate comprehension before enabling synthesis. |
| Phase 2 leaks graph complexity into the UI | Medium | Keep graph schema internal; expose sources, notes, and paths only. |
| Product metrics collect sensitive intellectual activity | High | Record workflow events, not private intent or note bodies. |
| Existing publishing is destabilized | High | Make metadata extraction asynchronous and non-blocking; preserve canonical post rendering. |

## Phase deliverables

- source-reference and revision contract
- Library collections and contextual selection
- intent and private annotations
- native-post structural metadata
- author reuse/attribution controls
- curated reading paths
- private knowledge-space shell
- Phase 3 readiness and research report
