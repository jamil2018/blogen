import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { TablesInsert } from "../supabase/database.types";
import {
  normalizeCollectionIntent,
  normalizeCollectionName,
  reorderCollectionItems,
  type Collection,
  type CollectionItem,
} from "../phase-2/contracts";
import {
  createSourceReferenceForPost,
  getLatestPostRevision,
} from "./source-references";
import { getPostReusePermissions, assertReuseAllowed } from "./reuse-permissions";

function mapCollection(row: {
  id: string;
  name: string;
  intent: string | null;
  promoted_to_space_at: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number | null;
}): Collection {
  return {
    id: row.id,
    name: row.name,
    intent: row.intent,
    itemCount: Number(row.item_count ?? 0),
    promotedToSpaceAt: row.promoted_to_space_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCollections(userId: string): Promise<Collection[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, intent, promoted_to_space_at, created_at, updated_at")
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const collections = data ?? [];
  if (!collections.length) return [];

  const ids = collections.map((c) => c.id);
  const { data: counts } = await supabase
    .from("collection_items")
    .select("collection_id")
    .in("collection_id", ids);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.collection_id, (countMap.get(row.collection_id) ?? 0) + 1);
  }

  return collections.map((c) =>
    mapCollection({ ...c, item_count: countMap.get(c.id) ?? 0 })
  );
}

export async function getCollectionById(
  userId: string,
  collectionId: string
): Promise<Collection | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, name, intent, promoted_to_space_at, created_at, updated_at")
    .eq("id", collectionId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error || !data) return null;

  const { count } = await supabase
    .from("collection_items")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  return mapCollection({ ...data, item_count: count ?? 0 });
}

export async function createCollection(userId: string, name: string): Promise<Collection> {
  const supabase = await createClient();
  const insert: TablesInsert<"collections"> = {
    owner_user_id: userId,
    name: normalizeCollectionName(name),
  };
  const { data, error } = await supabase
    .from("collections")
    .insert(insert)
    .select("id, name, intent, promoted_to_space_at, created_at, updated_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to create collection");
  return mapCollection({ ...data, item_count: 0 });
}

export async function renameCollection(
  userId: string,
  collectionId: string,
  name: string
): Promise<Collection> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .update({ name: normalizeCollectionName(name) })
    .eq("id", collectionId)
    .eq("owner_user_id", userId)
    .select("id, name, intent, promoted_to_space_at, created_at, updated_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to rename collection");

  const { count } = await supabase
    .from("collection_items")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  return mapCollection({ ...data, item_count: count ?? 0 });
}

export async function updateCollectionIntent(
  userId: string,
  collectionId: string,
  intent: string
): Promise<Collection> {
  const supabase = await createClient();
  const normalized = normalizeCollectionIntent(intent);
  const { data, error } = await supabase
    .from("collections")
    .update({ intent: normalized || null })
    .eq("id", collectionId)
    .eq("owner_user_id", userId)
    .select("id, name, intent, promoted_to_space_at, created_at, updated_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to update intent");

  const { count } = await supabase
    .from("collection_items")
    .select("id", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  return mapCollection({ ...data, item_count: count ?? 0 });
}

export async function deleteCollection(userId: string, collectionId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId)
    .eq("owner_user_id", userId);
  if (error) throw new Error(error.message);
}

export async function listCollectionItems(
  userId: string,
  collectionId: string
): Promise<CollectionItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();

  const collection = await getCollectionById(userId, collectionId);
  if (!collection) return [];

  const { data, error } = await supabase
    .from("collection_items")
    .select("id, collection_id, source_reference_id, bound_post_id, sort_order, created_at")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    collectionId: row.collection_id,
    boundPostId: row.bound_post_id,
    sourceReferenceId: row.source_reference_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }));
}

export async function addPostToCollection(
  userId: string,
  collectionId: string,
  postId: string
): Promise<{ item: CollectionItem; created: boolean }> {
  await assertReuseAllowed(postId, "add_to_collection");

  const supabase = await createClient();
  const collection = await getCollectionById(userId, collectionId);
  if (!collection) throw new Error("Collection not found");

  const { data: existing } = await supabase
    .from("collection_items")
    .select("id, collection_id, source_reference_id, bound_post_id, sort_order, created_at")
    .eq("collection_id", collectionId)
    .eq("bound_post_id", postId)
    .maybeSingle();

  if (existing) {
    return {
      item: {
        id: existing.id,
        collectionId: existing.collection_id,
        boundPostId: existing.bound_post_id,
        sourceReferenceId: existing.source_reference_id,
        sortOrder: existing.sort_order,
        createdAt: existing.created_at,
      },
      created: false,
    };
  }

  const sourceReferenceId = await createSourceReferenceForPost({
    ownerUserId: userId,
    postId,
  });

  const { data: maxOrderRow } = await supabase
    .from("collection_items")
    .select("sort_order")
    .eq("collection_id", collectionId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxOrderRow?.sort_order ?? -1) + 1;
  const insert: TablesInsert<"collection_items"> = {
    collection_id: collectionId,
    source_reference_id: sourceReferenceId,
    bound_post_id: postId,
    sort_order: sortOrder,
  };

  const { data, error } = await supabase
    .from("collection_items")
    .insert(insert)
    .select("id, collection_id, source_reference_id, bound_post_id, sort_order, created_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Failed to add to collection");

  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);

  return {
    item: {
      id: data.id,
      collectionId: data.collection_id,
      boundPostId: data.bound_post_id,
      sourceReferenceId: data.source_reference_id,
      sortOrder: data.sort_order,
      createdAt: data.created_at,
    },
    created: true,
  };
}

export async function removePostFromCollection(
  userId: string,
  collectionId: string,
  postId: string
) {
  const supabase = await createClient();
  const collection = await getCollectionById(userId, collectionId);
  if (!collection) throw new Error("Collection not found");

  const { error } = await supabase
    .from("collection_items")
    .delete()
    .eq("collection_id", collectionId)
    .eq("bound_post_id", postId);
  if (error) throw new Error(error.message);

  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);
}

export async function reorderCollection(
  userId: string,
  collectionId: string,
  orderedItemIds: string[]
) {
  const supabase = await createClient();
  const items = await listCollectionItems(userId, collectionId);
  const updates = reorderCollectionItems(items, orderedItemIds);

  for (const update of updates) {
    const { error } = await supabase
      .from("collection_items")
      .update({ sort_order: update.sortOrder })
      .eq("id", update.id)
      .eq("collection_id", collectionId);
    if (error) throw new Error(error.message);
  }
}

export async function listCollectionsForPost(
  userId: string,
  postId: string
): Promise<{ collectionId: string; name: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collection_items")
    .select("collection_id, collections!inner(id, name, owner_user_id)")
    .eq("bound_post_id", postId);
  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const collection = Array.isArray(row.collections)
        ? row.collections[0]
        : row.collections;
      if (!collection || collection.owner_user_id !== userId) return null;
      return { collectionId: collection.id, name: collection.name };
    })
    .filter((row): row is { collectionId: string; name: string } => Boolean(row));
}

export async function getPostCollectionMembership(
  userId: string,
  postId: string
): Promise<Record<string, boolean>> {
  const memberships = await listCollectionsForPost(userId, postId);
  return Object.fromEntries(memberships.map((m) => [m.collectionId, true]));
}

export { getLatestPostRevision };
