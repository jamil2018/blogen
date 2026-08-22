import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { TablesInsert } from "../supabase/database.types";
import {
  estimateReadingPathMinutes,
  relationshipLabel,
  slugifyReadingPath,
  type ReadingPathRelationship,
} from "../phase-2/contracts";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import type { Post } from "../../types/post";

export type ReadingPathSummary = {
  id: string;
  slug: string;
  title: string;
  purpose: string;
  estimatedMinutes: number;
  itemCount: number;
  isPublished: boolean;
};

export type ReadingPathItem = {
  id: string;
  boundPostId: string;
  sortOrder: number;
  relationshipLabel: ReadingPathRelationship | null;
  transitionNote: string | null;
  post?: Post;
};

export type ReadingPathDetail = ReadingPathSummary & {
  items: ReadingPathItem[];
};

export async function listPublishedReadingPaths(): Promise<ReadingPathSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reading_paths")
    .select("id, slug, title, purpose, estimated_minutes, is_published")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const paths = data ?? [];
  const ids = paths.map((p) => p.id);
  const countMap = new Map<string, number>();
  if (ids.length) {
    const { data: items } = await supabase
      .from("reading_path_items")
      .select("path_id")
      .in("path_id", ids);
    for (const item of items ?? []) {
      countMap.set(item.path_id, (countMap.get(item.path_id) ?? 0) + 1);
    }
  }

  return paths.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    purpose: p.purpose,
    estimatedMinutes:
      p.estimated_minutes ?? estimateReadingPathMinutes(countMap.get(p.id) ?? 0),
    itemCount: countMap.get(p.id) ?? 0,
    isPublished: p.is_published,
  }));
}

export async function getReadingPathBySlug(slug: string): Promise<ReadingPathDetail | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: path, error } = await supabase
    .from("reading_paths")
    .select("id, slug, title, purpose, estimated_minutes, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error || !path) return null;

  const { data: items } = await supabase
    .from("reading_path_items")
    .select("id, bound_post_id, sort_order, relationship_label, transition_note")
    .eq("path_id", path.id)
    .order("sort_order", { ascending: true });

  const postIds = (items ?? []).map((i) => i.bound_post_id);
  const postsById = new Map<string, Post>();
  if (postIds.length) {
    const { data: posts } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .in("id", postIds)
      .eq("status", "published");
    for (const row of posts ?? []) {
      postsById.set(row.id, mapPost(row as PostRow));
    }
  }

  const mappedItems: ReadingPathItem[] = (items ?? []).map((item) => ({
    id: item.id,
    boundPostId: item.bound_post_id,
    sortOrder: item.sort_order,
    relationshipLabel: item.relationship_label as ReadingPathRelationship | null,
    transitionNote: item.transition_note,
    post: postsById.get(item.bound_post_id),
  }));

  return {
    id: path.id,
    slug: path.slug,
    title: path.title,
    purpose: path.purpose,
    estimatedMinutes:
      path.estimated_minutes ?? estimateReadingPathMinutes(mappedItems.length),
    itemCount: mappedItems.length,
    isPublished: path.is_published,
    items: mappedItems,
  };
}

export async function createReadingPath(input: {
  userId: string;
  title: string;
  purpose: string;
  items: {
    postId: string;
    relationshipLabel?: ReadingPathRelationship;
    transitionNote?: string;
  }[];
  publish?: boolean;
}): Promise<ReadingPathDetail> {
  const supabase = await createClient();
  const slug = `${slugifyReadingPath(input.title)}-${Date.now().toString(36).slice(-4)}`;

  const pathInsert: TablesInsert<"reading_paths"> = {
    slug,
    title: input.title.trim(),
    purpose: input.purpose.trim(),
    estimated_minutes: estimateReadingPathMinutes(input.items.length),
    created_by: input.userId,
    is_published: input.publish ?? false,
  };

  const { data: path, error } = await supabase
    .from("reading_paths")
    .insert(pathInsert)
    .select("id, slug, title, purpose, estimated_minutes, is_published")
    .single();
  if (error || !path) throw new Error(error?.message ?? "Failed to create path");

  const itemRows: TablesInsert<"reading_path_items">[] = input.items.map((item, index) => ({
    path_id: path.id,
    bound_post_id: item.postId,
    sort_order: index,
    relationship_label: item.relationshipLabel ?? null,
    transition_note: item.transitionNote?.trim() || null,
  }));

  if (itemRows.length) {
    const { error: itemsError } = await supabase.from("reading_path_items").insert(itemRows);
    if (itemsError) throw new Error(itemsError.message);
  }

  const detail = await getReadingPathBySlug(path.slug);
  if (!detail) throw new Error("Failed to load created path");
  return detail;
}

export async function getPathLinksForPost(postId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_path_items")
    .select(
      "bound_post_id, relationship_label, reading_paths!inner(title, is_published)"
    )
    .neq("bound_post_id", postId);

  const results: {
    postId: string;
    label: ReadingPathRelationship;
    pathTitle: string;
  }[] = [];

  const { data: samePathItems } = await supabase
    .from("reading_path_items")
    .select("path_id")
    .eq("bound_post_id", postId);

  const pathIds = (samePathItems ?? []).map((i) => i.path_id);
  if (!pathIds.length) return results;

  const { data: siblings } = await supabase
    .from("reading_path_items")
    .select("bound_post_id, relationship_label, path_id, reading_paths!inner(title, is_published)")
    .in("path_id", pathIds)
    .neq("bound_post_id", postId);

  for (const row of siblings ?? []) {
    const path = Array.isArray(row.reading_paths) ? row.reading_paths[0] : row.reading_paths;
    if (!path?.is_published || !row.relationship_label) continue;
    results.push({
      postId: row.bound_post_id,
      label: row.relationship_label as ReadingPathRelationship,
      pathTitle: path.title,
    });
  }

  return results;
}

export function formatPathRelationship(label: ReadingPathRelationship | null): string {
  return label ? relationshipLabel(label) : "";
}
