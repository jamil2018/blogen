import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import type { Post } from "../../types/post";

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function listLibraryPosts(userId: string): Promise<Post[]> {
  if (!userId) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("library_items")
      .select(`created_at, post:posts!post_id (${POST_LIST_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .map((row) => {
        const post = Array.isArray(row.post) ? row.post[0] : row.post;
        return post ? mapPost(post as PostRow) : null;
      })
      .filter((p): p is Post => Boolean(p));
  });
  return result ?? [];
}

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
  if (!userId || !postId) return false;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("library_items")
      .select("post_id")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  });
  return result ?? false;
}

export async function saveLibraryItem(userId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("library_items").upsert(
    { user_id: userId, post_id: postId },
    { onConflict: "user_id,post_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);
}

export async function removeLibraryItem(userId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_items")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);
  if (error) throw new Error(error.message);
}

export async function migrateLocalBookmarks(userId: string, postIds: string[]) {
  const unique = [...new Set(postIds.filter(Boolean))];
  if (!unique.length) return { merged: 0 };
  const supabase = await createClient();
  const rows = unique.map((post_id) => ({ user_id: userId, post_id }));
  const { error, count } = await supabase
    .from("library_items")
    .upsert(rows, { onConflict: "user_id,post_id", ignoreDuplicates: true, count: "exact" });
  if (error) throw new Error(error.message);
  return { merged: count ?? unique.length };
}
