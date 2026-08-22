"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  addPostToCollection,
  createCollection,
  deleteCollection,
  getCollectionById,
  getPostCollectionMembership,
  listCollectionItems,
  listCollections,
  listCollectionsForPost,
  removePostFromCollection,
  renameCollection,
  reorderCollection,
  updateCollectionIntent,
} from "../lib/db/collections";
import { trackPhase2Event } from "../lib/db/phase2-analytics";
import { logAppEvent } from "../lib/observability";
import {
  validateCollectionIntent,
  validateCollectionName,
} from "../lib/phase-2/contracts";
import { mapPost, POST_LIST_SELECT, type PostRow } from "../lib/db/mappers";
import { createClient } from "../lib/supabase/server";
import type { Post } from "../types/post";

export async function getUserCollections() {
  const { user } = await requireUser();
  return listCollections(user.id);
}

export async function getCollection(collectionId: string) {
  const { user } = await requireUser();
  return getCollectionById(user.id, collectionId);
}

export async function getCollectionPosts(collectionId: string): Promise<Post[]> {
  const { user } = await requireUser();
  const items = await listCollectionItems(user.id, collectionId);
  if (!items.length) return [];

  const supabase = await createClient();
  const postIds = items.map((i) => i.boundPostId);
  const { data } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .in("id", postIds);

  const postsById = new Map((data ?? []).map((row) => [row.id, mapPost(row as PostRow)]));

  return items
    .map((item) => postsById.get(item.boundPostId))
    .filter((post): post is Post => Boolean(post));
}

export async function createUserCollection(name: string) {
  const { user } = await requireUser();
  const error = validateCollectionName(name);
  if (error) throw new Error(error);

  try {
    const collection = await createCollection(user.id, name);
    await trackPhase2Event("collection_created", {
      collectionId: collection.id,
    });
    revalidatePath("/library");
    return collection;
  } catch (err) {
    logAppEvent("error", "collection.create_failed", {
      message: err instanceof Error ? err.message : "unknown",
    });
    throw err;
  }
}

export async function renameUserCollection(collectionId: string, name: string) {
  const { user } = await requireUser();
  const error = validateCollectionName(name);
  if (error) throw new Error(error);
  const collection = await renameCollection(user.id, collectionId, name);
  revalidatePath("/library");
  revalidatePath(`/library/collections/${collectionId}`);
  return collection;
}

export async function setCollectionIntent(collectionId: string, intent: string) {
  const { user } = await requireUser();
  const error = validateCollectionIntent(intent);
  if (error) throw new Error(error);
  const collection = await updateCollectionIntent(user.id, collectionId, intent);
  await trackPhase2Event("collection_intent_set", { collectionId });
  revalidatePath(`/library/collections/${collectionId}`);
  return collection;
}

export async function removeUserCollection(collectionId: string) {
  const { user } = await requireUser();
  await deleteCollection(user.id, collectionId);
  revalidatePath("/library");
}

export async function addToCollection(collectionId: string, postId: string) {
  const { user } = await requireUser();
  try {
    const result = await addPostToCollection(user.id, collectionId, postId);
    if (result.created) {
      await trackPhase2Event("source_added_to_collection", {
        collectionId,
        postId,
      });
    }
    revalidatePath("/library");
    revalidatePath(`/library/collections/${collectionId}`);
    revalidatePath(`/posts/${postId}`);
    return result;
  } catch (err) {
    logAppEvent("error", "collection.add_failed", {
      collectionId,
      postId,
      message: err instanceof Error ? err.message : "unknown",
    });
    throw err;
  }
}

export async function removeFromCollection(collectionId: string, postId: string) {
  const { user } = await requireUser();
  await removePostFromCollection(user.id, collectionId, postId);
  revalidatePath("/library");
  revalidatePath(`/library/collections/${collectionId}`);
}

export async function reorderCollectionItems(collectionId: string, orderedItemIds: string[]) {
  const { user } = await requireUser();
  await reorderCollection(user.id, collectionId, orderedItemIds);
  revalidatePath(`/library/collections/${collectionId}`);
}

export async function getPostCollections(postId: string) {
  try {
    const { user } = await requireUser();
    return getPostCollectionMembership(user.id, postId);
  } catch {
    return {};
  }
}

export async function getPostCollectionList(postId: string) {
  try {
    const { user } = await requireUser();
    return listCollectionsForPost(user.id, postId);
  } catch {
    return [];
  }
}

export async function getCollectionsWithMembership(postId: string) {
  const { user } = await requireUser();
  const [collections, membership] = await Promise.all([
    listCollections(user.id),
    getPostCollectionMembership(user.id, postId),
  ]);
  return collections.map((c) => ({
    ...c,
    containsPost: Boolean(membership[c.id]),
  }));
}
