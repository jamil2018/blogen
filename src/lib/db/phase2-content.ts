import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { TablesInsert } from "../supabase/database.types";
import {
  extractStructuralMetadata,
  type PostStructuralMetadata,
} from "../phase-2/contracts";
import { isPassageAnchor } from "../source-references/contracts";
import type { PassageAnnotation } from "../phase-2/contracts";

export async function upsertPostStructuralMetadata(input: {
  postId: string;
  revisionId: string | null;
  revisionNumber: number;
  html: string;
  tags: string[];
  authorId: string;
  publishedAt: string | null;
}): Promise<PostStructuralMetadata> {
  const metadata = extractStructuralMetadata(input);
  const supabase = await createClient();

  const row: TablesInsert<"post_structural_metadata"> = {
    post_id: metadata.postId,
    revision_id: metadata.revisionId,
    revision_number: metadata.revisionNumber,
    sections: metadata.sections,
    citations: metadata.citations,
    referenced_post_ids: metadata.referencedPostIds,
    tags: metadata.tags,
    author_id: metadata.authorId,
    published_at: metadata.publishedAt,
  };

  const { error } = await supabase.from("post_structural_metadata").upsert(row, {
    onConflict: "post_id,revision_number",
  });
  if (error) throw new Error(error.message);
  return metadata;
}

export async function getLatestStructuralMetadata(
  postId: string
): Promise<PostStructuralMetadata | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("post_structural_metadata")
    .select("*")
    .eq("post_id", postId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  return {
    postId: data.post_id,
    revisionNumber: data.revision_number,
    revisionId: data.revision_id,
    sections: (data.sections as PostStructuralMetadata["sections"]) ?? [],
    citations: (data.citations as PostStructuralMetadata["citations"]) ?? [],
    referencedPostIds: data.referenced_post_ids ?? [],
    tags: data.tags ?? [],
    authorId: data.author_id,
    publishedAt: data.published_at,
  };
}

export async function listMetadataReferencedPosts(
  postId: string
): Promise<string[]> {
  const metadata = await getLatestStructuralMetadata(postId);
  return metadata?.referencedPostIds ?? [];
}

export async function listAnnotationsForCollection(
  userId: string,
  collectionId: string
): Promise<PassageAnnotation[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("passage_annotations")
    .select(
      "id, collection_id, source_reference_id, passage, note, created_at, updated_at, source_references!inner(bound_post_id, owner_user_id)"
    )
    .eq("collection_id", collectionId)
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const ref = Array.isArray(row.source_references)
        ? row.source_references[0]
        : row.source_references;
      if (!ref || !isPassageAnchor(row.passage)) return null;
      return {
        id: row.id,
        collectionId: row.collection_id,
        sourceReferenceId: row.source_reference_id,
        boundPostId: ref.bound_post_id as string,
        passage: row.passage,
        note: row.note,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    })
    .filter((row): row is PassageAnnotation => Boolean(row));
}

export async function createPassageAnnotation(input: {
  userId: string;
  collectionId: string;
  sourceReferenceId: string;
  passage: PassageAnnotation["passage"];
  note: string;
}): Promise<PassageAnnotation> {
  const supabase = await createClient();
  const insert: TablesInsert<"passage_annotations"> = {
    owner_user_id: input.userId,
    collection_id: input.collectionId,
    source_reference_id: input.sourceReferenceId,
    passage: input.passage,
    note: input.note.trim(),
  };

  const { data, error } = await supabase
    .from("passage_annotations")
    .insert(insert)
    .select(
      "id, collection_id, source_reference_id, passage, note, created_at, updated_at, source_references!inner(bound_post_id)"
    )
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create annotation");

  const ref = Array.isArray(data.source_references)
    ? data.source_references[0]
    : data.source_references;
  if (!isPassageAnchor(data.passage)) throw new Error("Invalid passage anchor");

  return {
    id: data.id,
    collectionId: data.collection_id,
    sourceReferenceId: data.source_reference_id,
    boundPostId: ref?.bound_post_id as string,
    passage: data.passage,
    note: data.note,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updatePassageAnnotation(
  userId: string,
  annotationId: string,
  note: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("passage_annotations")
    .update({ note: note.trim() })
    .eq("id", annotationId)
    .eq("owner_user_id", userId);
  if (error) throw new Error(error.message);
}

export async function deletePassageAnnotation(userId: string, annotationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("passage_annotations")
    .delete()
    .eq("id", annotationId)
    .eq("owner_user_id", userId);
  if (error) throw new Error(error.message);
}
