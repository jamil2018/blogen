import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { TablesInsert } from "../supabase/database.types";
import {
  buildRevisionSnapshot,
  isPassageAnchor,
  resolveSourceReference,
  shouldPinRevisionOnLibrarySave,
  type FrozenRevisionSnapshot,
  type PassageAnchor,
  type ResolvedSourceReference,
  type SourceReferenceRecord,
} from "../source-references/contracts";
import type { PostStatus } from "../posts/contracts";

export type LatestPostRevision = {
  id: string;
  revisionNumber: number;
  title: string;
  summary: string;
  slug: string | null;
  publishedAt: string;
};

export async function getLatestPostRevision(
  postId: string
): Promise<LatestPostRevision | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("post_revisions")
    .select("id, revision_number, title, summary, slug, published_at")
    .eq("post_id", postId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    revisionNumber: data.revision_number,
    title: data.title,
    summary: data.summary,
    slug: data.slug,
    publishedAt: data.published_at,
  };
}

function mapSourceReferenceRow(row: {
  id: string;
  bound_post_id: string;
  post_revision_id: string | null;
  revision_number: number;
  passage: unknown;
  frozen_snapshot: unknown;
  created_at: string;
}): SourceReferenceRecord {
  return {
    id: row.id,
    boundPostId: row.bound_post_id,
    postRevisionId: row.post_revision_id,
    revisionNumber: row.revision_number,
    passage: isPassageAnchor(row.passage) ? row.passage : null,
    frozenSnapshot: parseFrozenSnapshot(row.frozen_snapshot),
    createdAt: row.created_at,
  };
}

export function parseFrozenSnapshot(value: unknown): FrozenRevisionSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.title !== "string" || typeof v.summary !== "string") return null;
  if (typeof v.revisionNumber !== "number") return null;
  return {
    title: v.title,
    summary: v.summary,
    revisionNumber: v.revisionNumber,
    revisionId: typeof v.revisionId === "string" ? v.revisionId : null,
    slug: typeof v.slug === "string" ? v.slug : null,
    publishedAt: typeof v.publishedAt === "string" ? v.publishedAt : null,
  };
}

export async function createSourceReferenceForPost(input: {
  ownerUserId: string;
  postId: string;
  passage?: PassageAnchor | null;
}): Promise<string> {
  const supabase = await createClient();
  const latest = await getLatestPostRevision(input.postId);

  const insert: TablesInsert<"source_references"> = {
    owner_user_id: input.ownerUserId,
    bound_post_id: input.postId,
    post_revision_id: latest?.id ?? null,
    revision_number: latest?.revisionNumber ?? 0,
    passage: input.passage ?? null,
  };

  const { data, error } = await supabase
    .from("source_references")
    .insert(insert)
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create source reference");
  return data.id;
}

export async function getSourceReferenceById(
  referenceId: string
): Promise<SourceReferenceRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_references")
    .select(
      "id, bound_post_id, post_revision_id, revision_number, passage, frozen_snapshot, created_at"
    )
    .eq("id", referenceId)
    .maybeSingle();
  if (error || !data) return null;
  return mapSourceReferenceRow(data);
}

export async function resolveSourceReferenceById(input: {
  referenceId: string;
  viewer: {
    isAuthenticated: boolean;
    userId: string | null;
    isAdmin: boolean;
  };
}): Promise<ResolvedSourceReference | null> {
  const reference = await getSourceReferenceById(input.referenceId);
  if (!reference) return null;
  return resolveStoredSourceReference(reference, input.viewer);
}

export async function resolveStoredSourceReference(
  reference: SourceReferenceRecord,
  viewer: {
    isAuthenticated: boolean;
    userId: string | null;
    isAdmin: boolean;
  }
): Promise<ResolvedSourceReference> {
  const supabase = await createClient();

  const [{ data: post }, { data: tombstone }, latest] = await Promise.all([
    supabase
      .from("posts")
      .select("id, status, author_id")
      .eq("id", reference.boundPostId)
      .maybeSingle(),
    supabase
      .from("post_source_tombstones")
      .select("post_id, title, reason, frozen_snapshot")
      .eq("post_id", reference.boundPostId)
      .maybeSingle(),
    getLatestPostRevision(reference.boundPostId),
  ]);

  return resolveSourceReference({
    reference,
    post: post
      ? {
          id: post.id,
          status: post.status as PostStatus,
          authorId: post.author_id,
        }
      : null,
    tombstone: tombstone
      ? {
          postId: tombstone.post_id,
          title: tombstone.title,
          reason: "deleted",
          frozenSnapshot:
            parseFrozenSnapshot(tombstone.frozen_snapshot) ??
            buildRevisionSnapshot({
              title: tombstone.title,
              summary: "",
              revisionNumber: reference.revisionNumber,
            }),
        }
      : null,
    latestRevisionNumber: latest?.revisionNumber ?? null,
    viewer,
  });
}

export async function getLibraryItemSourceReferenceId(
  userId: string,
  boundPostId: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("library_items")
    .select("source_reference_id")
    .eq("user_id", userId)
    .eq("bound_post_id", boundPostId)
    .maybeSingle();
  return data?.source_reference_id ?? null;
}

export { shouldPinRevisionOnLibrarySave };
