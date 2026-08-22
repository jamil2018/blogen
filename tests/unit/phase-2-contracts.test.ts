import { describe, expect, it } from "vitest";
import {
  buildPhase2AnalyticsExtra,
  canPromoteToKnowledgeSpace,
  extractStructuralMetadata,
  isReuseAllowed,
  normalizeCollectionName,
  reorderCollectionItems,
  scoreRelatedIdeas,
  validateCollectionIntent,
  validateCollectionName,
} from "../../src/lib/phase-2/contracts";

describe("collection contracts", () => {
  it("validates collection names", () => {
    expect(validateCollectionName("")).toMatch(/required/i);
    expect(validateCollectionName("Agents")).toBeNull();
  });

  it("reorders items deterministically", () => {
    const items = [
      { id: "a", sortOrder: 0 },
      { id: "b", sortOrder: 1 },
      { id: "c", sortOrder: 2 },
    ];
    expect(reorderCollectionItems(items, ["c", "a"]).map((i) => i.id)).toEqual([
      "c",
      "a",
    ]);
  });
});

describe("intent contracts", () => {
  it("allows empty intent", () => {
    expect(validateCollectionIntent("")).toBeNull();
  });

  it("requires meaningful intent text", () => {
    expect(validateCollectionIntent("short")).toMatch(/8 characters/i);
    expect(
      validateCollectionIntent("Understand coding agent reliability costs")
    ).toBeNull();
  });
});

describe("structural metadata", () => {
  it("extracts sections and blogen links", () => {
    const meta = extractStructuralMetadata({
      postId: "post-1",
      revisionId: "rev-1",
      revisionNumber: 1,
      html: '<h2>Intro</h2><p>See <a href="/posts/550e8400-e29b-41d4-a716-446655440000">other</a></p>',
      tags: ["ai"],
      authorId: "author-1",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(meta.sections[0]?.id).toBe("intro");
    expect(meta.referencedPostIds).toContain("550e8400-e29b-41d4-a716-446655440000");
  });
});

describe("reuse permissions", () => {
  it("defaults synthesis to denied", () => {
    expect(
      isReuseAllowed(
        {
          privateSpaces: true,
          publicLineage: true,
          quotation: true,
          synthesis: false,
        },
        "synthesis"
      )
    ).toBe(false);
    expect(
      isReuseAllowed(
        {
          privateSpaces: true,
          publicLineage: true,
          quotation: true,
          synthesis: false,
        },
        "add_to_collection"
      )
    ).toBe(true);
  });
});

describe("related ideas scoring", () => {
  it("prefers curated path relationships", () => {
    const ideas = scoreRelatedIdeas({
      sourcePostId: "source",
      candidates: [{ postId: "p1", tags: [] }],
      sourceTags: [],
      pathLinks: [
        { postId: "p1", label: "extends", pathTitle: "Agent costs" },
      ],
      citationLinks: [],
      metadataLinks: [],
      limit: 3,
    });
    expect(ideas[0]?.basis).toBe("reading_path");
    expect(ideas[0]?.kind).toBe("curated");
  });
});

describe("knowledge space promotion", () => {
  it("requires at least one source", () => {
    expect(canPromoteToKnowledgeSpace({ itemCount: 0, promotedToSpaceAt: null }).ok).toBe(
      false
    );
    expect(canPromoteToKnowledgeSpace({ itemCount: 2, promotedToSpaceAt: null }).ok).toBe(
      true
    );
  });
});

describe("phase 2 analytics privacy", () => {
  it("never includes free-text intent in payload keys", () => {
    const extra = buildPhase2AnalyticsExtra({
      collectionId: "c1",
      itemCount: 3,
    });
    expect(extra).toEqual({ collection_id: "c1", item_count: 3 });
    expect(Object.keys(extra)).not.toContain("intent");
    expect(Object.keys(extra)).not.toContain("note");
  });
});
