import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { TablesInsert } from "../supabase/database.types";
import { canPromoteToKnowledgeSpace, type KnowledgeSpace } from "../phase-2/contracts";
import { getCollectionById, listCollectionItems } from "./collections";
import { listAnnotationsForCollection } from "./phase2-content";

export type KnowledgeSpaceDetail = KnowledgeSpace & {
  itemCount: number;
  annotationCount: number;
  activity: { id: string; kind: string; summary: string; createdAt: string }[];
};

export async function getKnowledgeSpaceByCollectionId(
  userId: string,
  collectionId: string
): Promise<KnowledgeSpaceDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from("knowledge_spaces")
    .select("id, collection_id, created_at")
    .eq("collection_id", collectionId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (!space) return null;

  const collection = await getCollectionById(userId, collectionId);
  if (!collection) return null;

  const annotations = await listAnnotationsForCollection(userId, collectionId);

  const { data: activity } = await supabase
    .from("knowledge_space_activity")
    .select("id, kind, summary, created_at")
    .eq("space_id", space.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    id: space.id,
    collectionId: space.collection_id,
    name: collection.name,
    intent: collection.intent,
    createdAt: space.created_at,
    itemCount: collection.itemCount,
    annotationCount: annotations.length,
    activity: (activity ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      summary: a.summary,
      createdAt: a.created_at,
    })),
  };
}

export async function promoteCollectionToKnowledgeSpace(
  userId: string,
  collectionId: string
): Promise<KnowledgeSpaceDetail> {
  const collection = await getCollectionById(userId, collectionId);
  if (!collection) throw new Error("Collection not found");

  const gate = canPromoteToKnowledgeSpace(collection);
  if (!gate.ok) throw new Error(gate.reason);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("knowledge_spaces")
    .select("id")
    .eq("collection_id", collectionId)
    .maybeSingle();

  let spaceId = existing?.id;
  if (!spaceId) {
    const insert: TablesInsert<"knowledge_spaces"> = {
      collection_id: collectionId,
      owner_user_id: userId,
    };
    const { data, error } = await supabase
      .from("knowledge_spaces")
      .insert(insert)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to create space");
    spaceId = data.id;
  }

  await supabase
    .from("collections")
    .update({ promoted_to_space_at: new Date().toISOString() })
    .eq("id", collectionId)
    .eq("owner_user_id", userId);

  const items = await listCollectionItems(userId, collectionId);
  await recordSpaceActivity(spaceId, "promoted", `Knowledge space created with ${items.length} sources.`);

  const detail = await getKnowledgeSpaceByCollectionId(userId, collectionId);
  if (!detail) throw new Error("Failed to load knowledge space");
  return detail;
}

export async function recordSpaceActivity(
  spaceId: string,
  kind: string,
  summary: string
) {
  const supabase = await createClient();
  const insert: TablesInsert<"knowledge_space_activity"> = {
    space_id: spaceId,
    kind,
    summary: summary.slice(0, 240),
  };
  await supabase.from("knowledge_space_activity").insert(insert);
}

export async function listUserKnowledgeSpaces(userId: string): Promise<KnowledgeSpace[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_spaces")
    .select("id, collection_id, created_at, collections!inner(name, intent, owner_user_id)")
    .eq("owner_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const collection = Array.isArray(row.collections) ? row.collections[0] : row.collections;
    return {
      id: row.id,
      collectionId: row.collection_id,
      name: collection?.name ?? "Knowledge space",
      intent: collection?.intent ?? null,
      createdAt: row.created_at,
    };
  });
}
