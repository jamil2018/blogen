import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import type { Post } from "../../types/post";
import {
  createSourceReferenceForPost,
  getLibraryItemSourceReferenceId,
  parseFrozenSnapshot,
} from "./source-references";

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
      .select(
        `created_at, bound_post_id, post_id, source_reference_id,
         post:posts!post_id (${POST_LIST_SELECT})`
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const rows = data ?? [];
    const missingPostIds = rows
      .filter((row) => {
        const post = Array.isArray(row.post) ? row.post[0] : row.post;
        return !post;
      })
      .map((row) => row.bound_post_id as string);

    const tombstoneByPostId = new Map<string, { title: string; frozen_snapshot: unknown }>();
    if (missingPostIds.length) {
      const { data: tombstones } = await supabase
        .from("post_source_tombstones")
        .select("post_id, title, frozen_snapshot")
        .in("post_id", missingPostIds);
      for (const tombstone of tombstones ?? []) {
        tombstoneByPostId.set(tombstone.post_id, tombstone);
      }
    }

    const referenceIds = rows
      .map((row) => row.source_reference_id as string | null)
      .filter(Boolean) as string[];
    const frozenByReferenceId = new Map<string, unknown>();
    if (referenceIds.length) {
      const { data: references } = await supabase
        .from("source_references")
        .select("id, frozen_snapshot")
        .in("id", referenceIds);
      for (const reference of references ?? []) {
        if (reference.frozen_snapshot) {
          frozenByReferenceId.set(reference.id, reference.frozen_snapshot);
        }
      }
    }

    return rows
      .map((row) => {
        const post = Array.isArray(row.post) ? row.post[0] : row.post;
        if (post) return mapPost(post as PostRow);

        const boundId = row.bound_post_id as string;
        const tombstone = tombstoneByPostId.get(boundId);
        const refFrozen = row.source_reference_id
          ? frozenByReferenceId.get(row.source_reference_id as string)
          : null;
        const frozen =
          parseFrozenSnapshot(refFrozen) ??
          parseFrozenSnapshot(tombstone?.frozen_snapshot);
        if (!frozen) return null;

        const placeholder: Post = {
          id: boundId,
          title: frozen.title,
          description: `<p class="text-muted">${frozen.summary || "This source is no longer available."}</p>`,
          summary: frozen.summary || "This saved source is no longer available.",
          author: "Unavailable",
          tags: [],
          category: "Unavailable",
          status: "archived",
          slug: frozen.slug ?? undefined,
          publishedAt: frozen.publishedAt ?? undefined,
        };
        return placeholder;
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
      .select("bound_post_id")
      .eq("user_id", userId)
      .eq("bound_post_id", postId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  });
  return result ?? false;
}

export async function saveLibraryItem(userId: string, postId: string) {
  const supabase = await createClient();

  const existingReferenceId = await getLibraryItemSourceReferenceId(userId, postId);
  let sourceReferenceId = existingReferenceId;

  if (!existingReferenceId) {
    sourceReferenceId = await createSourceReferenceForPost({
      ownerUserId: userId,
      postId,
    });
  }

  const { error } = await supabase.from("library_items").upsert(
    {
      user_id: userId,
      post_id: postId,
      bound_post_id: postId,
      source_reference_id: sourceReferenceId,
    },
    { onConflict: "user_id,bound_post_id" }
  );
  if (error) throw new Error(error.message);
}

export async function removeLibraryItem(userId: string, postId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("library_items")
    .delete()
    .eq("user_id", userId)
    .eq("bound_post_id", postId);
  if (error) throw new Error(error.message);
}

export async function migrateLocalBookmarks(userId: string, postIds: string[]) {
  const unique = [...new Set(postIds.filter(Boolean))];
  if (!unique.length) return { merged: 0 };
  const supabase = await createClient();

  for (const postId of unique) {
    const existingReferenceId = await getLibraryItemSourceReferenceId(userId, postId);
    const sourceReferenceId =
      existingReferenceId ??
      (await createSourceReferenceForPost({ ownerUserId: userId, postId }));

    const { error } = await supabase.from("library_items").upsert(
      {
        user_id: userId,
        post_id: postId,
        bound_post_id: postId,
        source_reference_id: sourceReferenceId,
      },
      { onConflict: "user_id,bound_post_id", ignoreDuplicates: true }
    );
    if (error) throw new Error(error.message);
  }

  return { merged: unique.length };
}
