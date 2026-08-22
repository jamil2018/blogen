import { describe, expect, it } from "vitest";
import {
  buildRevisionSnapshot,
  isPassageAnchor,
  resolveSourceReference,
  shouldPinRevisionOnLibrarySave,
} from "../../src/lib/source-references/contracts";

const baseReference = {
  id: "ref-1",
  boundPostId: "post-1",
  postRevisionId: "rev-1",
  revisionNumber: 2,
  passage: null,
  frozenSnapshot: null,
};

describe("passage anchor validation", () => {
  it("accepts section anchors", () => {
    expect(isPassageAnchor({ kind: "section", sectionId: "intro" })).toBe(true);
  });

  it("accepts text range anchors", () => {
    expect(
      isPassageAnchor({
        kind: "text_range",
        startOffset: 10,
        endOffset: 40,
        quote: "hello",
      })
    ).toBe(true);
  });

  it("rejects invalid anchors", () => {
    expect(isPassageAnchor(null)).toBe(false);
    expect(isPassageAnchor({ kind: "section" })).toBe(false);
    expect(
      isPassageAnchor({ kind: "text_range", startOffset: 5, endOffset: 2 })
    ).toBe(false);
  });
});

describe("resolveSourceReference", () => {
  const viewer = { isAuthenticated: true, userId: "user-1", isAdmin: false };

  it("returns available when revision matches latest", () => {
    const result = resolveSourceReference({
      reference: baseReference,
      post: { id: "post-1", status: "published", authorId: "author-1" },
      tombstone: null,
      latestRevisionNumber: 2,
      viewer,
    });
    expect(result.state).toBe("available");
  });

  it("returns stale without rewriting the pinned revision", () => {
    const result = resolveSourceReference({
      reference: baseReference,
      post: { id: "post-1", status: "published", authorId: "author-1" },
      tombstone: null,
      latestRevisionNumber: 4,
      viewer,
    });
    expect(result.state).toBe("stale");
    expect(result.reference.revisionNumber).toBe(2);
    expect(result.message).toContain("revision 2");
    expect(result.message).toContain("revision 4");
  });

  it("returns source_unavailable for unpublished posts to non-owners", () => {
    const result = resolveSourceReference({
      reference: baseReference,
      post: { id: "post-1", status: "draft", authorId: "author-1" },
      tombstone: null,
      latestRevisionNumber: 2,
      viewer,
    });
    expect(result.state).toBe("source_unavailable");
  });

  it("allows authors to resolve their own draft sources", () => {
    const result = resolveSourceReference({
      reference: baseReference,
      post: { id: "post-1", status: "draft", authorId: "user-1" },
      tombstone: null,
      latestRevisionNumber: 2,
      viewer,
    });
    expect(result.state).toBe("available");
  });

  it("returns tombstone when post was deleted", () => {
    const frozen = buildRevisionSnapshot({
      title: "Deleted post",
      summary: "Summary",
      revisionNumber: 2,
      revisionId: "rev-1",
    });
    const result = resolveSourceReference({
      reference: baseReference,
      post: null,
      tombstone: {
        postId: "post-1",
        title: "Deleted post",
        reason: "deleted",
        frozenSnapshot: frozen,
      },
      latestRevisionNumber: null,
      viewer,
    });
    expect(result.state).toBe("tombstone");
    expect(result.tombstone?.frozenSnapshot.title).toBe("Deleted post");
  });

  it("uses inline frozen snapshot when post row is gone", () => {
    const frozen = buildRevisionSnapshot({
      title: "Frozen",
      summary: "Sum",
      revisionNumber: 1,
    });
    const result = resolveSourceReference({
      reference: { ...baseReference, frozenSnapshot: frozen, postRevisionId: null },
      post: null,
      tombstone: null,
      latestRevisionNumber: null,
      viewer,
    });
    expect(result.state).toBe("tombstone");
    expect(result.frozenSnapshot?.title).toBe("Frozen");
  });

  it("returns no_revision when post has never been published", () => {
    const result = resolveSourceReference({
      reference: { ...baseReference, revisionNumber: 0 },
      post: { id: "post-1", status: "published", authorId: "author-1" },
      tombstone: null,
      latestRevisionNumber: null,
      viewer,
    });
    expect(result.state).toBe("no_revision");
  });
});

describe("library revision pinning", () => {
  it("pins on first save only", () => {
    expect(shouldPinRevisionOnLibrarySave(null)).toBe(true);
    expect(shouldPinRevisionOnLibrarySave({ revisionNumber: 3 })).toBe(false);
  });
});

describe("buildRevisionSnapshot", () => {
  it("builds a stable snapshot shape", () => {
    const snap = buildRevisionSnapshot({
      title: "Hello",
      summary: "World",
      revisionNumber: 1,
      revisionId: "abc",
      slug: "hello",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(snap).toEqual({
      title: "Hello",
      summary: "World",
      revisionNumber: 1,
      revisionId: "abc",
      slug: "hello",
      publishedAt: "2026-01-01T00:00:00.000Z",
    });
  });
});
