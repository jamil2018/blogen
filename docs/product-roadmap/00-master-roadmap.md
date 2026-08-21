# Blogen Product Roadmap

## Product direction

Blogen should become a credible publishing and reading platform whose distinctive object is a living, attributable knowledge space. It must first earn trust through a competent core experience, then introduce knowledge-oriented behaviors with minimal disruption, and only then make the knowledge graph a primary creation and discovery surface.

The roadmap deliberately avoids trying to match every Medium or Substack feature. It establishes the capabilities users reasonably expect, while investing most heavily in a differentiated loop:

```text
Read and select Blogen posts
            ↓
Organize sources around an intent
            ↓
Construct and edit claims, concepts, and relationships
            ↓
Query or select a relevant subgraph
            ↓
Create a sourced outline and post
            ↓
Publish with inspectable provenance
            ↓
Feed new knowledge back into the network
```

## Guiding principles

1. **Competitive foundation before novelty.** Blogen must first fix defects and deliver the core reader, writer, publication, audience, distribution, analytics, and revenue capabilities expected of a credible Medium/Substack alternative.
2. **Posts remain first-class.** Blogen is not replacing readable articles with graph diagrams. Graphs augment reading, discovery, and creation.
3. **Native knowledge is privileged.** Blogen posts should initially be the richest and safest source type because Blogen controls their authorship, revisions, structure, citations, and permissions.
4. **Intent shapes synthesis.** Graph generation must begin with a user question or purpose; it should not claim to produce one objectively correct representation.
5. **Provenance is structural.** Every extracted or generated claim must remain traceable to exact sources and source revisions.
6. **Users retain epistemic control.** Machine proposals are editable, rejectable, and visibly distinct from user-confirmed relationships.
7. **Incremental integration.** Each phase must leave Blogen useful and releasable without requiring the next phase to justify it.
8. **Future optionality.** External sources, collaboration, newsletters, monetization, richer social features, and new knowledge representations remain possible without being premature commitments.

## Competitive position

### Competitive foundation

Blogen needs a dependable version of the expectations established by mature platforms. This is a product-capability requirement, not merely a quality requirement:

- excellent reading on desktop and mobile
- dependable authoring, drafts, previews, and publishing
- profiles with meaningful identity and expertise
- search, topic discovery, saved content, and relevant recommendations
- follow/subscription primitives or a clearly stated alternative
- moderation, reporting, privacy, copyright, and author controls
- analytics sufficient for authors to understand readership
- stable URLs, metadata, sharing, accessibility, and performance
- email subscriptions, delivery, unsubscribe handling, and welcome flows
- audience ownership through consent-safe import and export
- publications with branding, roles, contributors, and editorial workflow
- author and publication analytics covering content, traffic, audience, and email
- free and paid membership tiers, content access rules, and creator payouts

The detailed parity definition and explicit boundaries are included in [Phase 1 — Competitive publishing foundation and UX hardening](./01-phase-1-ux-hardening.md).

### Differentiation ceiling

Blogen should win on capabilities that conventional blogging platforms do not make central:

- intent-driven knowledge spaces made from selected posts
- claim-level source inspection
- editable relationships such as supports, challenges, extends, and supersedes
- graph-guided outlining and writing
- visible intellectual lineage for published work
- idea-level discovery across authors and posts
- attribution and reuse metrics, not only views and followers

## Phases

| Phase | Outcome | User-visible promise | Exit gate |
|---|---|---|---|
| 1. Competitive publishing foundation | Reliable feature parity and UX quality | “Blogen is a serious place to read, publish, distribute, grow an audience, and earn.” | Mandatory reader, writer, publication, newsletter, audience, analytics, moderation, migration, and monetization capabilities pass the competitive-foundation gates. |
| 2. Minimal-disruption integration | Knowledge-ready platform primitives | “Save sources, organize them, and follow meaningful reading paths.” | Users can build source collections and Blogen retains provenance-ready metadata without changing the post model. |
| 3. Knowledge-graph core | Differentiated creation loop | “Turn selected writing into an editable map and create attributable new work.” | A user completes selection → intent → graph → sourced outline/draft → provenance-aware publication end to end. |

Detailed plans:

- [Phase 1 — Competitive publishing foundation and UX hardening](./01-phase-1-ux-hardening.md)
- [Phase 2 — Minimal-disruption feature integration](./02-phase-2-minimal-disruption-integration.md)
- [Phase 3 — Knowledge-graph core](./03-phase-3-knowledge-graph-core.md)

## Cross-phase product architecture

### Stable domain concepts

- **Post:** Published or draft long-form content with an author and immutable revision identity.
- **Source reference:** A pointer to a post revision and, when relevant, an exact passage.
- **Library item:** A user’s saved reference to a post.
- **Collection:** A user-curated group of library items; becomes a selectable source set.
- **Knowledge space:** An intent-bound working environment containing sources, annotations, graph elements, and generated artifacts.
- **Claim:** A proposition attributable to one or more source passages or explicitly authored by the user.
- **Concept:** A normalized subject connected to claims, posts, and other concepts.
- **Relationship:** A typed, directed connection with provenance and confirmation state.
- **Generated artifact:** An outline or draft tied to the exact graph snapshot that produced it.
- **Lineage view:** The published explanation of sources, relationships, transformations, and author additions behind a post.

### Required boundaries

- Keep canonical post content independent from generated graph data.
- Version sources and graphs so later edits do not silently change a published post’s provenance.
- Store machine proposals separately from user-confirmed knowledge.
- Treat generated text as a draft, never as automatically publishable content.
- Model permissions and reuse consent before enabling public graph reuse.
- Keep extraction/model providers replaceable; product semantics must not depend on one model vendor.

## Cross-phase quality gates

Every releasable slice must meet the following bar:

- automated tests cover its happy path and important failure states
- keyboard-only and screen-reader-relevant interactions are verified
- desktop and small-screen layouts are checked
- loading, empty, error, offline/retry, and permission states are designed
- performance and error telemetry are available
- destructive actions require clear confirmation and offer recovery where practical
- user-facing counts and derived data are consistent across surfaces
- privacy, provenance, and permissions are testable rather than implied
- no phase requires unpublished future functionality to make its UI understandable

## Success metrics

Use metrics diagnostically, not as engagement-at-all-costs targets.

### Foundation

- successful search rate
- save/bookmark retrieval rate
- draft save and publish success rates
- median article load and interaction readiness
- broken-link, client-error, and failed-action rates
- percentage of new users who reach a meaningful first read or first draft

### Knowledge readiness

- percentage of saved posts later added to a collection
- collections with two or more sources
- reading-path completion and continuation rates
- source-selection-to-space-start conversion
- percentage of native posts with usable structural metadata

### Knowledge graph

- graph generation completion and failure rates
- percentage of proposed nodes/relationships edited, rejected, or confirmed
- source-inspection frequency
- graph-to-outline and outline-to-draft conversion
- provenance coverage of generated factual claims
- percentage of published derived posts with lineage enabled
- reuse and attribution returned to source authors

## Governance and decision points

Human review is required at these gates:

1. Approve the competitive-foundation matrix, pricing posture, publication model, and information architecture before Phase 1 feature implementation.
2. Approve the collection/knowledge-space domain boundary before Phase 2 persistence work.
3. Approve the claim, relationship, provenance, revision, and consent model before Phase 3 extraction work.
4. Conduct a trust and safety review before public sharing, collaboration, or external-source ingestion.
5. Review actual behavior and metrics after each phase before expanding scope.

## Explicit non-goals for this roadmap

- full newsletter delivery and email-marketing automation
- advanced revenue products beyond core paid memberships, such as sponsorship marketplaces or complex commerce
- importing every external content type
- autonomous publication
- a generic chatbot attached to the editor
- follower-count-driven social feeds
- real-time multiplayer graph editing
- automatic truth scoring
- exhaustive parity with Medium or Substack

These may be reconsidered through later brainstorming and evidence. They should not distort the first differentiated product loop.

## Roadmap exit condition

This roadmap is complete when Blogen is competitively credible as a reading, publishing, distribution, audience, and membership platform and a user can create and publish a sourced post from an editable, intent-driven graph with inspectable lineage. Further work should be selected from observed use, author feedback, trust outcomes, and future strategy sessions—not assumed in advance.
