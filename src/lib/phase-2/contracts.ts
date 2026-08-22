/**
 * Phase 2 pure contracts: collections, structure metadata, reuse, paths, related ideas, analytics.
 */

import { extractHeadingToc } from "../posts/contracts";
import type { PassageAnchor } from "../source-references/contracts";

// ---------------------------------------------------------------------------
// Task 2 — Collections
// ---------------------------------------------------------------------------

export type Collection = {
  id: string;
  name: string;
  intent: string | null;
  itemCount: number;
  promotedToSpaceAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CollectionItem = {
  id: string;
  collectionId: string;
  boundPostId: string;
  sourceReferenceId: string;
  sortOrder: number;
  createdAt: string;
};

export function normalizeCollectionName(name: string): string {
  return name.trim().slice(0, 120);
}

export function validateCollectionName(name: string): string | null {
  const normalized = normalizeCollectionName(name);
  if (!normalized) return "Collection name is required.";
  if (normalized.length < 2) return "Collection name must be at least 2 characters.";
  return null;
}

export function reorderCollectionItems(
  items: { id: string; sortOrder: number }[],
  orderedIds: string[]
): { id: string; sortOrder: number }[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return orderedIds
    .map((id, index) => {
      const item = byId.get(id);
      return item ? { id: item.id, sortOrder: index } : null;
    })
    .filter((item): item is { id: string; sortOrder: number } => Boolean(item));
}

// ---------------------------------------------------------------------------
// Task 4 — Intent
// ---------------------------------------------------------------------------

export function normalizeCollectionIntent(intent: string): string {
  return intent.trim().slice(0, 500);
}

export function validateCollectionIntent(intent: string): string | null {
  const normalized = normalizeCollectionIntent(intent);
  if (!normalized) return null;
  if (normalized.length < 8) {
    return "Intent should be a short question or goal (at least 8 characters).";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Task 5 — Annotations
// ---------------------------------------------------------------------------

export type PassageAnnotation = {
  id: string;
  collectionId: string;
  sourceReferenceId: string;
  boundPostId: string;
  passage: PassageAnchor;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export function validateAnnotationNote(note: string): string | null {
  if (note.trim().length > 2000) return "Note must be 2000 characters or fewer.";
  return null;
}

// ---------------------------------------------------------------------------
// Task 6 — Post structure metadata
// ---------------------------------------------------------------------------

export type StructuralSection = {
  id: string;
  text: string;
  level: number;
};

export type StructuralCitation = {
  kind: "blogen_post" | "external_url";
  target: string;
  label?: string;
};

export type PostStructuralMetadata = {
  postId: string;
  revisionNumber: number;
  revisionId: string | null;
  sections: StructuralSection[];
  citations: StructuralCitation[];
  referencedPostIds: string[];
  tags: string[];
  authorId: string | null;
  publishedAt: string | null;
};

const BLOGEN_POST_LINK_RE =
  /href=["'](?:https?:\/\/[^"']+)?\/(?:posts|p)\/([^"'/?#]+)["']/gi;

export function extractStructuralMetadata(input: {
  postId: string;
  revisionId: string | null;
  revisionNumber: number;
  html: string;
  tags: string[];
  authorId: string;
  publishedAt: string | null;
}): PostStructuralMetadata {
  const sections = extractHeadingToc(input.html).map((h) => ({
    id: h.id,
    text: h.text,
    level: h.level,
  }));

  const citations: StructuralCitation[] = [];
  const referencedPostIds = new Set<string>();

  let match: RegExpExecArray | null;
  const linkRe = new RegExp(BLOGEN_POST_LINK_RE.source, "gi");
  while ((match = linkRe.exec(input.html)) !== null) {
    const target = match[1];
    if (!target) continue;
    if (/^[0-9a-f-]{36}$/i.test(target)) {
      referencedPostIds.add(target);
      citations.push({ kind: "blogen_post", target, label: target });
    } else {
      citations.push({ kind: "blogen_post", target, label: target });
    }
  }

  const externalRe = /href=["'](https?:\/\/[^"']+)["']/gi;
  while ((match = externalRe.exec(input.html)) !== null) {
    const url = match[1];
    if (!url.includes("/posts/") && !url.includes("/p/")) {
      citations.push({ kind: "external_url", target: url });
    }
  }

  return {
    postId: input.postId,
    revisionNumber: input.revisionNumber,
    revisionId: input.revisionId,
    sections,
    citations,
    referencedPostIds: [...referencedPostIds],
    tags: input.tags,
    authorId: input.authorId,
    publishedAt: input.publishedAt,
  };
}

// ---------------------------------------------------------------------------
// Task 7 — Reuse permissions
// ---------------------------------------------------------------------------

export type ReusePermissionKind =
  | "private_spaces"
  | "public_lineage"
  | "quotation"
  | "synthesis";

export type PostReusePermissions = {
  privateSpaces: boolean;
  publicLineage: boolean;
  quotation: boolean;
  synthesis: boolean;
};

export const DEFAULT_REUSE_PERMISSIONS: PostReusePermissions = {
  privateSpaces: true,
  publicLineage: true,
  quotation: true,
  synthesis: false,
};

export type ReuseAction = "add_to_collection" | "quote" | "lineage" | "synthesis";

export function isReuseAllowed(
  permissions: PostReusePermissions,
  action: ReuseAction
): boolean {
  switch (action) {
    case "add_to_collection":
      return permissions.privateSpaces;
    case "quote":
      return permissions.quotation;
    case "lineage":
      return permissions.publicLineage;
    case "synthesis":
      return permissions.synthesis;
    default:
      return false;
  }
}

export function reuseDenialReason(
  permissions: PostReusePermissions,
  action: ReuseAction
): string | null {
  if (isReuseAllowed(permissions, action)) return null;
  switch (action) {
    case "add_to_collection":
      return "The author has not allowed this post in private knowledge spaces.";
    case "quote":
      return "The author has not allowed quotation of this post.";
    case "lineage":
      return "The author has not allowed public lineage for this post.";
    case "synthesis":
      return "The author has not allowed synthesis from this post.";
    default:
      return "This reuse action is not permitted.";
  }
}

// ---------------------------------------------------------------------------
// Task 8 — Reading paths
// ---------------------------------------------------------------------------

export type ReadingPathRelationship =
  | "introduces"
  | "extends"
  | "applies"
  | "challenges";

export const READING_PATH_RELATIONSHIPS: ReadingPathRelationship[] = [
  "introduces",
  "extends",
  "applies",
  "challenges",
];

export function relationshipLabel(label: ReadingPathRelationship): string {
  switch (label) {
    case "introduces":
      return "Introduces";
    case "extends":
      return "Extends";
    case "applies":
      return "Applies";
    case "challenges":
      return "Challenges";
  }
}

export function slugifyReadingPath(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "reading-path";
}

export function estimateReadingPathMinutes(postCount: number): number {
  return Math.max(5, postCount * 8);
}

// ---------------------------------------------------------------------------
// Task 9 — Related ideas
// ---------------------------------------------------------------------------

export type RelatedIdeaBasis =
  | "reading_path"
  | "citation"
  | "shared_metadata"
  | "category_tag_fallback";

export type RelatedIdeaKind = "curated" | "declared" | "suggested";

export type RelatedIdea = {
  postId: string;
  basis: RelatedIdeaBasis;
  kind: RelatedIdeaKind;
  explanation: string;
  relationshipLabel?: ReadingPathRelationship;
};

export function scoreRelatedIdeas(input: {
  sourcePostId: string;
  candidates: { postId: string; tags: string[]; categoryId?: string }[];
  sourceTags: string[];
  sourceCategoryId?: string;
  pathLinks: { postId: string; label: ReadingPathRelationship; pathTitle: string }[];
  citationLinks: { postId: string }[];
  metadataLinks: { postId: string; sharedSections: string[] }[];
  limit?: number;
}): RelatedIdea[] {
  const limit = input.limit ?? 3;
  const results: RelatedIdea[] = [];
  const seen = new Set<string>([input.sourcePostId]);

  for (const link of input.pathLinks) {
    if (seen.has(link.postId)) continue;
    seen.add(link.postId);
    results.push({
      postId: link.postId,
      basis: "reading_path",
      kind: "curated",
      explanation: `${relationshipLabel(link.label)} in “${link.pathTitle}”.`,
      relationshipLabel: link.label,
    });
  }

  for (const link of input.citationLinks) {
    if (seen.has(link.postId)) continue;
    seen.add(link.postId);
    results.push({
      postId: link.postId,
      basis: "citation",
      kind: "declared",
      explanation: "This post cites or is cited by the other.",
    });
  }

  for (const link of input.metadataLinks) {
    if (seen.has(link.postId)) continue;
    seen.add(link.postId);
    results.push({
      postId: link.postId,
      basis: "shared_metadata",
      kind: "suggested",
      explanation:
        link.sharedSections.length > 0
          ? `Shares section topics: ${link.sharedSections.slice(0, 2).join(", ")}.`
          : "Shares structural metadata with this post.",
    });
  }

  if (results.length < limit) {
    const tagSet = new Set(input.sourceTags);
    const scored = input.candidates
      .filter((c) => !seen.has(c.postId))
      .map((candidate) => {
        const tagOverlap = candidate.tags.filter((t) => tagSet.has(t)).length;
        const sameCategory =
          input.sourceCategoryId &&
          candidate.categoryId &&
          input.sourceCategoryId === candidate.categoryId
            ? 1
            : 0;
        return { candidate, score: tagOverlap + sameCategory };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { candidate } of scored) {
      if (results.length >= limit) break;
      if (seen.has(candidate.postId)) continue;
      seen.add(candidate.postId);
      results.push({
        postId: candidate.postId,
        basis: "category_tag_fallback",
        kind: "suggested",
        explanation: "Related by shared category or tags.",
      });
    }
  }

  return results.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Task 10 — Knowledge space
// ---------------------------------------------------------------------------

export type KnowledgeSpace = {
  id: string;
  collectionId: string;
  name: string;
  intent: string | null;
  createdAt: string;
};

export function canPromoteToKnowledgeSpace(collection: {
  itemCount: number;
  promotedToSpaceAt: string | null;
}): { ok: boolean; reason?: string } {
  if (collection.promotedToSpaceAt) {
    return { ok: false, reason: "This collection is already a knowledge space." };
  }
  if (collection.itemCount < 1) {
    return { ok: false, reason: "Add at least one source before creating a space." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Task 11 — Analytics (privacy-safe funnel)
// ---------------------------------------------------------------------------

export type Phase2AnalyticsEventName =
  | "library_save"
  | "collection_created"
  | "source_added_to_collection"
  | "collection_intent_set"
  | "annotation_created"
  | "space_promoted"
  | "reading_path_saved"
  | "reading_path_started";

export const PHASE2_ANALYTICS_EVENTS: Phase2AnalyticsEventName[] = [
  "library_save",
  "collection_created",
  "source_added_to_collection",
  "collection_intent_set",
  "annotation_created",
  "space_promoted",
  "reading_path_saved",
  "reading_path_started",
];

/** Never include intent text, note bodies, or passage quotes in analytics payloads. */
export function buildPhase2AnalyticsExtra(input: {
  collectionId?: string;
  postId?: string;
  pathId?: string;
  spaceId?: string;
  itemCount?: number;
  sourceCount?: number;
}): Record<string, string | number | boolean | null> {
  const extra: Record<string, string | number | boolean | null> = {};
  if (input.collectionId) extra.collection_id = input.collectionId;
  if (input.postId) extra.post_id = input.postId;
  if (input.pathId) extra.path_id = input.pathId;
  if (input.spaceId) extra.space_id = input.spaceId;
  if (typeof input.itemCount === "number") extra.item_count = input.itemCount;
  if (typeof input.sourceCount === "number") extra.source_count = input.sourceCount;
  return extra;
}

export function phase2FunnelStage(event: Phase2AnalyticsEventName): string {
  switch (event) {
    case "library_save":
      return "save";
    case "collection_created":
    case "source_added_to_collection":
      return "collection";
    case "collection_intent_set":
      return "intent";
    case "annotation_created":
      return "annotation";
    case "space_promoted":
      return "space";
    case "reading_path_saved":
    case "reading_path_started":
      return "path";
  }
}
