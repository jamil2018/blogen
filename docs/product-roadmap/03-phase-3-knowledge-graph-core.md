# Phase 3 Plan: Knowledge-Graph Core

## Objective

Deliver Blogen’s first defensible product loop: users select native Blogen posts, state an intent, generate an editable and queryable knowledge graph, create a sourced outline or draft from a chosen subgraph, and publish with inspectable provenance.

This phase is successful only if the graph improves understanding and authorial control. A visually impressive node canvas with weak evidence binding is not success.

## Product promise

> Turn the writing you read into a living map of ideas, then create new work whose intellectual lineage remains visible.

## Initial user journey

1. User starts from a Phase 2 collection or knowledge space.
2. User confirms or edits the source set.
3. User enters a concrete intent or question.
4. Blogen analyzes eligible source revisions and proposes claims, concepts, evidence links, and typed relationships.
5. User inspects source passages and accepts, rejects, merges, edits, or reconnects proposals.
6. User queries the space or selects a subgraph.
7. User asks for an outline with a thesis, emphasis, counterarguments, audience, and exclusions.
8. Blogen shows the planned claim-to-source mapping before generating prose.
9. User generates and edits a draft in the normal Blogen editor.
10. Publication freezes the used graph snapshot and optionally exposes a lineage view.

## V1 knowledge model

### Node types

- **Claim:** A proposition stated in or derived from a source passage.
- **Concept:** A normalized subject used to connect claims and sources.
- **Source:** A specific eligible Blogen post revision.
- **Evidence passage:** The exact text span supporting a claim extraction.
- **User assertion:** A claim added by the user and explicitly not attributed to a source.

### Initial relationship vocabulary

- **supports**
- **challenges**
- **extends**
- **defines**
- **applies**
- **causes**
- **qualifies**
- **supersedes**
- **related to** as an explicitly weak fallback

Every relationship must carry direction, origin, evidence references where applicable, generation version, and confirmation state.

### States

- machine-proposed
- user-confirmed
- user-edited
- user-created
- rejected
- stale because a permission/source condition changed

## Scope

### Included

- native Blogen post sources only
- private single-user spaces
- intent-driven extraction
- claim/concept/relationship proposal
- editable graph plus nonvisual structured views
- evidence inspection and queries grounded in selected sources
- subgraph selection
- sourced outline generation
- optional draft generation inside the existing editor
- frozen provenance and public lineage for eligible sources
- author attribution/reuse feedback

### Excluded

- arbitrary web/PDF/video ingestion
- real-time collaboration
- automatic public graphs for every post
- autonomous publishing
- universal truth scores
- graph-based payments or licensing
- unrestricted recursive generation from generated posts

## Workstreams and tasks

### Task 1: Approve the graph and provenance contracts

**Description:** Define schema, vocabulary, versioning, permissions, evidence requirements, and the boundary between extracted, inferred, and user-authored knowledge.

**Acceptance criteria:**

- [ ] Every node and relationship type has precise semantics and examples.
- [ ] Machine proposals cannot be confused with confirmed or source-stated facts.
- [ ] A graph snapshot can be reconstructed from its sources, model/extraction version, edits, and permissions.

**Verification:** Architecture review using representative supportive, contradictory, ambiguous, and revised-source cases.

**Dependencies:** Phase 2 source, revision, and consent contracts.

**Estimated scope:** M.

### Task 2: Build a versioned extraction pipeline

**Description:** Process selected eligible post revisions into structured claims, concepts, passage evidence, and proposed relationships without blocking ordinary publication.

**Acceptance criteria:**

- [ ] Each extraction is bound to exact source revisions and an extraction configuration/version.
- [ ] Partial failure is visible per source and can be retried safely.
- [ ] Ineligible or withdrawn sources are not newly processed.

**Verification:** Deterministic fixture tests around the pipeline boundary, retry/idempotency tests, and permission revocation tests.

**Dependencies:** Task 1.

**Estimated scope:** Split into source-processing and proposal-generation M slices.

### Task 3: Create a gold evaluation set

**Description:** Establish a reviewed set of posts, intents, claims, relationships, contradictions, and expected evidence spans before optimizing extraction.

**Acceptance criteria:**

- [ ] The set includes multiple domains, writing styles, ambiguous claims, and intentional disagreements.
- [ ] Evaluation separately measures claim fidelity, evidence accuracy, relationship quality, omission, and unsupported invention.
- [ ] Release thresholds and manual-review procedures are documented.

**Verification:** Independent reviewer agreement and baseline extraction report.

**Dependencies:** Task 1; proceeds alongside Task 2.

**Estimated scope:** M.

### Task 4: Present extraction as reviewable proposals

**Description:** Before showing a complex graph, give users a structured review surface for claims, concepts, duplicates, and evidence.

**Acceptance criteria:**

- [ ] Users can accept, reject, edit, merge, and split proposals.
- [ ] Every sourced claim opens the exact passage in context.
- [ ] Bulk actions remain reversible and preserve an audit trail.

**Verification:** Proposal-state tests, undo/recovery tests, accessibility checks, and task-based usability evaluation.

**Dependencies:** Task 2.

**Estimated scope:** M.

### Checkpoint A: Trustworthy extraction

- [ ] Gold-set thresholds are met or limitations are explicitly bounded.
- [ ] No supported claim can lose its source binding through review edits.
- [ ] Permission withdrawal and partial failure behave safely.
- [ ] Users understand proposal versus confirmation states.

### Task 5: Build complementary graph and structured views

**Description:** Provide a visual graph for relationships plus list/table/source views for precision, accessibility, and dense editing.

**Acceptance criteria:**

- [ ] Users can locate, filter, select, and inspect the same entities across all views.
- [ ] Graph layout remains usable at the V1 source/node limits and never becomes the only way to complete a task.
- [ ] Color, position, and line shape are not the sole carriers of meaning.

**Verification:** Keyboard and screen-reader testing, graph-size performance tests, and cross-view state consistency tests.

**Dependencies:** Task 4.

**Estimated scope:** Multiple M vertical slices.

### Task 6: Support relationship editing

**Description:** Let users create, delete, redirect, and retype relationships while retaining provenance and origin.

**Acceptance criteria:**

- [ ] Relationship direction and type are explicit before confirmation.
- [ ] User edits never rewrite source text or imply source authorship.
- [ ] Undo and audit history cover all relationship mutations.

**Verification:** Mutation/audit tests, invalid-state tests, and usability review with contradictory claims.

**Dependencies:** Tasks 4–5.

**Estimated scope:** M.

### Task 7: Make spaces queryable with grounded answers

**Description:** Allow users to ask questions over selected sources/graph elements, returning answers that separate evidence, inference, disagreement, and absence.

**Acceptance criteria:**

- [ ] Answers cite exact graph nodes and source passages.
- [ ] Conflicting sources are surfaced rather than silently resolved.
- [ ] The system states when selected sources do not support an answer.

**Verification:** Grounded-answer evaluation set, contradiction cases, citation correctness checks, and adversarial unsupported-question tests.

**Dependencies:** Tasks 4–6.

**Estimated scope:** M.

### Checkpoint B: Editable knowledge space

- [ ] Users can understand and correct the proposed knowledge representation.
- [ ] Visual and nonvisual views remain synchronized.
- [ ] Grounded queries expose evidence, disagreement, and uncertainty.
- [ ] Space performance meets defined V1 limits.

### Task 8: Add subgraph selection and synthesis briefs

**Description:** Let users select relevant nodes/relationships and specify thesis, emphasis, counterarguments, audience, format, and exclusions.

**Acceptance criteria:**

- [ ] The selected graph scope is explicit and editable before generation.
- [ ] Required counterarguments and exclusions survive into the generation plan.
- [ ] The system warns when the requested thesis exceeds available evidence.

**Verification:** Brief-to-plan contract tests and representative argumentative/explanatory/tutorial scenarios.

**Dependencies:** Tasks 5–7.

**Estimated scope:** M.

### Task 9: Generate a sourced outline before prose

**Description:** Produce a section-level plan mapping intended claims and counterarguments to sources, allowing author correction before drafting.

**Acceptance criteria:**

- [ ] Each factual section identifies its supporting claims and passages.
- [ ] Unsupported authorial transitions or proposed assertions are visibly marked.
- [ ] Users can reorder, remove, add, or change emphasis without regenerating the entire space.

**Verification:** Outline coverage tests, unsupported-claim detection, edit persistence, and user evaluation.

**Dependencies:** Task 8.

**Estimated scope:** M.

### Task 10: Integrate draft generation into the existing editor

**Description:** Create prose from an approved outline inside Blogen’s hardened editor while retaining source and graph bindings outside canonical text.

**Acceptance criteria:**

- [ ] Generated content arrives as an editable draft and is never automatically published.
- [ ] Author edits do not corrupt the frozen generation inputs or provenance record.
- [ ] Regeneration is scoped and cannot silently overwrite unrelated author edits.

**Verification:** Editor lifecycle tests, overwrite/recovery tests, provenance integrity checks, and publish-preview comparison.

**Dependencies:** Task 9 and Phase 1 editor quality gate.

**Estimated scope:** Multiple M slices.

### Task 11: Freeze and publish intellectual lineage

**Description:** Bind a published revision to the exact graph snapshot, outline, source revisions, and eligible evidence used to create it. Provide an optional public “How this was built” view.

**Acceptance criteria:**

- [ ] Publication creates an immutable lineage snapshot for that post revision.
- [ ] Public lineage respects source permissions and never exposes private notes or rejected proposals.
- [ ] Readers can move from a derived claim to its eligible source context and understand author-added material.

**Verification:** Snapshot reproducibility, privacy/permission matrix, source withdrawal behavior, and public lineage usability test.

**Dependencies:** Tasks 1, 7, 9–10.

**Estimated scope:** M.

### Task 12: Return attribution to source authors

**Description:** Notify and credit authors when eligible work is reused in published lineage, without turning attribution into noisy engagement spam.

**Acceptance criteria:**

- [ ] Source authors can see where and how eligible work contributed.
- [ ] Notification preferences and abuse/reporting controls are available.
- [ ] Attribution distinguishes citation, graph inclusion, and substantive derived use.

**Verification:** Event accuracy, preferences tests, abuse scenarios, and author feedback review.

**Dependencies:** Task 11.

**Estimated scope:** M.

### Task 13: Operate the system safely and economically

**Description:** Add cost controls, quotas, latency targets, observability, data retention, abuse resistance, and provider-independent failure behavior.

**Acceptance criteria:**

- [ ] Expensive work is bounded, cancellable where possible, and transparent to users.
- [ ] Extraction and generation failures cannot corrupt spaces or drafts.
- [ ] Logs and analytics exclude private source contents and prompts except under explicit, documented consent.

**Verification:** Load/cost tests, cancellation/retry tests, provider-failure simulation, and privacy/security review.

**Dependencies:** Begins with Task 2 and gates release after Task 12.

**Estimated scope:** Multiple M slices.

## V1 limits to decide before implementation

Set conservative limits and test them explicitly:

- maximum posts per space
- maximum words/tokens processed per generation
- maximum nodes and relationships shown interactively
- supported post block types and citation formats
- extraction timeout and retry behavior
- retention of generated intermediate data
- private-space and published-lineage quotas

These are product contracts, not hidden implementation details.

## Phase exit criteria

- [ ] A user completes source selection → intent → extraction → review → editable graph.
- [ ] Claims and relationships retain exact evidence and clear origin states.
- [ ] Users can query the space and receive grounded, disagreement-aware answers.
- [ ] A selected subgraph produces an editable sourced outline.
- [ ] An approved outline can produce a draft without overwriting author work.
- [ ] Publication freezes provenance and can expose a permission-safe lineage view.
- [ ] Source authors receive accurate, controllable attribution.
- [ ] Evaluation, accessibility, privacy, security, latency, and cost gates pass.
- [ ] The ordinary write-from-scratch and read-a-post experiences remain first-class.

## Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Graph is visually novel but not useful | High | Optimize for source inspection, correction, queries, and outlining; provide structured views. |
| Extraction invents or distorts claims | High | Gold evaluation set, passage binding, proposal states, and user review before synthesis. |
| Provenance creates false certainty | High | Separate quotation, extraction, inference, and user assertion; expose disagreement and absence. |
| Dense graphs become unusable | High | Intent-bound scope, conservative limits, filtering, clustering, and list/table alternatives. |
| Generated writing homogenizes authors | High | Outline-first flow, scoped generation, author control, and explicit user assertions. |
| Author work is exploited without consent | High | Enforce Phase 2 reuse controls and return visible attribution. |
| Model costs make the feature unsustainable | High | Async extraction, caching by source revision/configuration, quotas, and cost telemetry. |
| Graph model blocks future representations | Medium | Keep typed/versioned primitives and provider-independent contracts; avoid universal ontology claims. |

## Post-V1 research backlog

These are candidates for future brainstorming, not commitments:

- external URLs, PDFs, video transcripts, and documents
- public and collaborative knowledge spaces
- author-published canonical graphs
- graph diffs across post revisions
- concept pages spanning the network
- competing interpretations of the same source set
- domain-specific relationship vocabularies
- human expert review and verified knowledge spaces
- citation export and research workflows
- publication/newsletter integrations
- monetization and licensing for attributable reuse
- personal/private knowledge spaces with stronger privacy guarantees
- APIs or embeds for lineage and graph views

## Phase deliverables

- approved graph/provenance/consent contracts
- evaluated versioned extraction pipeline
- proposal review experience
- accessible graph and structured editors
- grounded query experience
- subgraph synthesis brief and sourced outline
- editor-integrated draft generation
- immutable, permission-safe public lineage
- source-author attribution loop
- production cost, trust, and quality report
