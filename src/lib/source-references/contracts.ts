/**
 * Phase 2 Task 1: revision-safe source reference contracts.
 * Pure types and resolution logic — no I/O.
 */

import type { PostStatus } from "../posts/contracts";

/** Optional passage locator within a pinned revision. */
export type PassageAnchor =
  | { kind: "section"; sectionId: string }
  | {
      kind: "text_range";
      startOffset: number;
      endOffset: number;
      quote?: string;
    };

/** Minimal frozen payload when a live post/revision is no longer reachable. */
export type FrozenRevisionSnapshot = {
  title: string;
  summary: string;
  revisionNumber: number;
  revisionId?: string | null;
  slug?: string | null;
  publishedAt?: string | null;
};

export type SourceReferenceRecord = {
  id: string;
  boundPostId: string;
  postRevisionId: string | null;
  revisionNumber: number;
  passage: PassageAnchor | null;
  frozenSnapshot: FrozenRevisionSnapshot | null;
  createdAt: string;
};

export type SourceResolutionState =
  | "available"
  | "stale"
  | "source_unavailable"
  | "tombstone"
  | "no_revision";

export type ResolvedSourceReference = {
  state: SourceResolutionState;
  reference: Pick<
    SourceReferenceRecord,
    "id" | "boundPostId" | "postRevisionId" | "revisionNumber" | "passage"
  >;
  /** Latest published revision number when the live post is reachable. */
  liveRevisionNumber: number | null;
  postStatus: PostStatus | null;
  /** Populated when state is tombstone or source is permanently deleted. */
  tombstone: {
    postId: string;
    title: string;
    reason: "deleted";
    frozenSnapshot: FrozenRevisionSnapshot;
  } | null;
  /** Inline freeze on the reference when revision row was removed but tombstone row absent. */
  frozenSnapshot: FrozenRevisionSnapshot | null;
  /** Human-readable explanation for UI surfaces. */
  message: string;
};

export type SourceResolutionInput = {
  reference: Pick<
    SourceReferenceRecord,
    | "id"
    | "boundPostId"
    | "postRevisionId"
    | "revisionNumber"
    | "passage"
    | "frozenSnapshot"
  >;
  post: { id: string; status: PostStatus; authorId: string } | null;
  tombstone: {
    postId: string;
    title: string;
    reason: "deleted";
    frozenSnapshot: FrozenRevisionSnapshot;
  } | null;
  latestRevisionNumber: number | null;
  viewer: {
    isAuthenticated: boolean;
    userId: string | null;
    isAdmin: boolean;
  };
};

export function isPassageAnchor(value: unknown): value is PassageAnchor {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.kind === "section") {
    return typeof v.sectionId === "string" && v.sectionId.length > 0;
  }
  if (v.kind === "text_range") {
    return (
      typeof v.startOffset === "number" &&
      typeof v.endOffset === "number" &&
      v.startOffset >= 0 &&
      v.endOffset >= v.startOffset
    );
  }
  return false;
}

export function buildRevisionSnapshot(input: {
  title: string;
  summary: string;
  revisionNumber: number;
  revisionId?: string | null;
  slug?: string | null;
  publishedAt?: string | null;
}): FrozenRevisionSnapshot {
  return {
    title: input.title,
    summary: input.summary,
    revisionNumber: input.revisionNumber,
    revisionId: input.revisionId ?? null,
    slug: input.slug ?? null,
    publishedAt: input.publishedAt ?? null,
  };
}

function viewerCanAccessPost(
  post: { status: PostStatus; authorId: string },
  viewer: SourceResolutionInput["viewer"]
): boolean {
  if (post.status === "published") return true;
  if (!viewer.isAuthenticated || !viewer.userId) return false;
  if (viewer.isAdmin) return true;
  return post.authorId === viewer.userId;
}

/**
 * Resolve a pinned source reference against live post/revision state.
 * References never silently adopt a newer revision — stale is explicit.
 */
export function resolveSourceReference(
  input: SourceResolutionInput
): ResolvedSourceReference {
  const base = {
    reference: {
      id: input.reference.id,
      boundPostId: input.reference.boundPostId,
      postRevisionId: input.reference.postRevisionId,
      revisionNumber: input.reference.revisionNumber,
      passage: input.reference.passage,
    },
    liveRevisionNumber: input.latestRevisionNumber,
    postStatus: input.post?.status ?? null,
    tombstone: input.tombstone,
    frozenSnapshot: input.reference.frozenSnapshot,
  };

  if (input.tombstone) {
    return {
      ...base,
      state: "tombstone",
      frozenSnapshot: input.tombstone.frozenSnapshot,
      message:
        "This source was deleted. Saved revision metadata is shown from your library.",
    };
  }

  if (input.reference.frozenSnapshot && !input.post) {
    return {
      ...base,
      state: "tombstone",
      message:
        "This source is no longer available. Saved revision metadata is preserved.",
    };
  }

  if (!input.post) {
    return {
      ...base,
      state: "source_unavailable",
      message: "The source post could not be found.",
    };
  }

  if (!viewerCanAccessPost(input.post, input.viewer)) {
    return {
      ...base,
      state: "source_unavailable",
      message:
        input.post.status === "draft"
          ? "This source is no longer published."
          : "You do not have permission to view this source.",
    };
  }

  if (input.latestRevisionNumber == null || input.latestRevisionNumber < 1) {
    return {
      ...base,
      state: "no_revision",
      message: "This source has no published revision to reference yet.",
    };
  }

  if (input.reference.revisionNumber < input.latestRevisionNumber) {
    return {
      ...base,
      state: "stale",
      message: `Saved from revision ${input.reference.revisionNumber}; the post is now at revision ${input.latestRevisionNumber}.`,
    };
  }

  return {
    ...base,
    state: "available",
    message: "Source reference is current.",
  };
}

/** Whether library save should pin a new revision or keep an existing pin. */
export function shouldPinRevisionOnLibrarySave(existingReference: {
  revisionNumber: number;
} | null): boolean {
  return existingReference == null;
}
