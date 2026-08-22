"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  createPassageAnnotation,
  deletePassageAnnotation,
  listAnnotationsForCollection,
  updatePassageAnnotation,
} from "../lib/db/phase2-content";
import {
  getKnowledgeSpaceByCollectionId,
  listUserKnowledgeSpaces,
  promoteCollectionToKnowledgeSpace,
} from "../lib/db/knowledge-spaces";
import {
  createReadingPath,
  getReadingPathBySlug,
  listPublishedReadingPaths,
} from "../lib/db/reading-paths";
import { updatePostReusePermissions } from "../lib/db/reuse-permissions";
import { addPostToCollection } from "../lib/db/collections";
import { trackPhase2Event } from "../lib/db/phase2-analytics";
import { validateAnnotationNote } from "../lib/phase-2/contracts";
import type { PassageAnchor } from "../lib/source-references/contracts";
import type { PostReusePermissions, ReadingPathRelationship } from "../lib/phase-2/contracts";
import { getPostReusePermissions } from "../lib/db/reuse-permissions";
import { createSourceReferenceForPost } from "../lib/db/source-references";

export async function getCollectionAnnotations(collectionId: string) {
  const { user } = await requireUser();
  return listAnnotationsForCollection(user.id, collectionId);
}

export async function savePassageAnnotation(input: {
  collectionId: string;
  postId: string;
  passage: PassageAnchor;
  note: string;
}) {
  const { user } = await requireUser();
  const noteError = validateAnnotationNote(input.note);
  if (noteError) throw new Error(noteError);

  const sourceReferenceId = await createSourceReferenceForPost({
    ownerUserId: user.id,
    postId: input.postId,
    passage: input.passage,
  });

  const annotation = await createPassageAnnotation({
    userId: user.id,
    collectionId: input.collectionId,
    sourceReferenceId,
    passage: input.passage,
    note: input.note,
  });

  await trackPhase2Event("annotation_created", {
    collectionId: input.collectionId,
    postId: input.postId,
  });

  revalidatePath(`/library/collections/${input.collectionId}`);
  revalidatePath(`/library/spaces/${input.collectionId}`);
  return annotation;
}

export async function editPassageAnnotation(annotationId: string, note: string) {
  const { user } = await requireUser();
  const noteError = validateAnnotationNote(note);
  if (noteError) throw new Error(noteError);
  await updatePassageAnnotation(user.id, annotationId, note);
  revalidatePath("/library");
}

export async function removePassageAnnotation(annotationId: string) {
  const { user } = await requireUser();
  await deletePassageAnnotation(user.id, annotationId);
  revalidatePath("/library");
}

export async function getUserKnowledgeSpaces() {
  const { user } = await requireUser();
  return listUserKnowledgeSpaces(user.id);
}

export async function getKnowledgeSpace(collectionId: string) {
  const { user } = await requireUser();
  return getKnowledgeSpaceByCollectionId(user.id, collectionId);
}

export async function promoteToKnowledgeSpace(collectionId: string) {
  const { user } = await requireUser();
  const space = await promoteCollectionToKnowledgeSpace(user.id, collectionId);
  await trackPhase2Event("space_promoted", {
    collectionId,
    spaceId: space.id,
    sourceCount: space.itemCount,
  });
  revalidatePath("/library");
  revalidatePath(`/library/collections/${collectionId}`);
  revalidatePath(`/library/spaces/${collectionId}`);
  return space;
}

export async function getReadingPaths() {
  return listPublishedReadingPaths();
}

export async function getReadingPath(slug: string) {
  return getReadingPathBySlug(slug);
}

export async function saveReadingPathToCollection(pathSlug: string, collectionId: string) {
  const { user } = await requireUser();
  const path = await getReadingPathBySlug(pathSlug);
  if (!path) throw new Error("Reading path not found");

  for (const item of path.items) {
    await addPostToCollection(user.id, collectionId, item.boundPostId);
  }

  await trackPhase2Event("reading_path_saved", {
    pathId: path.id,
    collectionId,
    sourceCount: path.items.length,
  });

  revalidatePath(`/library/collections/${collectionId}`);
  return { added: path.items.length };
}

export async function recordReadingPathStarted(pathSlug: string) {
  const path = await getReadingPathBySlug(pathSlug);
  if (!path) return null;
  await trackPhase2Event("reading_path_started", {
    pathId: path.id,
    sourceCount: path.items.length,
  });
  return path;
}

export async function getPostReusePermissionsForEdit(postId: string) {
  const { user } = await requireUser();
  const supabase = await import("../lib/supabase/server").then((m) => m.createClient());
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.author_id !== user.id) {
    throw new Error("Only the author can view reuse permissions.");
  }
  return getPostReusePermissions(postId);
}

export async function savePostReusePermissions(
  postId: string,
  permissions: PostReusePermissions
) {
  const { user } = await requireUser();
  await updatePostReusePermissions(user.id, postId, permissions);
  revalidatePath(`/user/posts`);
  revalidatePath(`/posts/${postId}`);
}

export async function createAdminReadingPath(input: {
  title: string;
  purpose: string;
  items: { postId: string; relationshipLabel?: ReadingPathRelationship; transitionNote?: string }[];
  publish?: boolean;
}) {
  const { user } = await requireUser();
  const path = await createReadingPath({
    userId: user.id,
    ...input,
  });
  revalidatePath("/paths");
  return path;
}
