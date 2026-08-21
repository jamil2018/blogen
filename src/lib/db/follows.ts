import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import type { Post } from "../../types/post";
import type { Enums } from "../supabase/database.types";
import { previewBody } from "../posts/stage-d-contracts";

export type FollowTargetType = Enums<"follow_target_type">;

/** List cards must not leak paywalled HTML. */
function redactListPost(post: Post): Post {
  if (!post.accessLevel || post.accessLevel === "public") return post;
  return {
    ...post,
    description: post.summary || previewBody(post.description ?? "", 15),
    accessGranted: false,
  };
}

export type FollowRow = {
  target_type: FollowTargetType;
  target_id: string;
  created_at: string;
};

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function listFollows(userId: string): Promise<FollowRow[]> {
  if (!userId) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("follows")
      .select("target_type, target_id, created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FollowRow[];
  });
  return result ?? [];
}

export async function isFollowing(
  userId: string,
  targetType: FollowTargetType,
  targetId: string
): Promise<boolean> {
  if (!userId || !targetId) return false;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("follows")
      .select("target_id")
      .eq("follower_id", userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  });
  return result ?? false;
}

export async function followTarget(
  userId: string,
  targetType: FollowTargetType,
  targetId: string
) {
  if (targetType === "publication") {
    const supabaseCheck = await createClient();
    const { data: pub, error: pubErr } = await supabaseCheck
      .from("publications")
      .select("id")
      .eq("id", targetId)
      .maybeSingle();
    if (pubErr || !pub) {
      throw new Error("Publication not found");
    }
  }
  const supabase = await createClient();
  const { error } = await supabase.from("follows").upsert(
    {
      follower_id: userId,
      target_type: targetType,
      target_id: targetId,
    },
    { onConflict: "follower_id,target_type,target_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);
}

export async function unfollowTarget(
  userId: string,
  targetType: FollowTargetType,
  targetId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId);
  if (error) throw new Error(error.message);
}

export async function listFollowingFeed(
  userId: string,
  { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
): Promise<{ data: Post[]; count: number; page: number; limit: number; totalPages: number }> {
  const follows = await listFollows(userId);
  const authorIds = follows
    .filter((f) => f.target_type === "author")
    .map((f) => f.target_id);
  const categoryIds = follows
    .filter((f) => f.target_type === "category")
    .map((f) => f.target_id);
  const publicationIds = follows
    .filter((f) => f.target_type === "publication")
    .map((f) => f.target_id);

  if (!authorIds.length && !categoryIds.length && !publicationIds.length) {
    return { data: [], count: 0, page, limit, totalPages: 1 };
  }

  const supabase = await createClient();
  const from = (Math.max(1, page) - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select(POST_LIST_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("distribute_followers", true)
    .neq("distribution_mode", "email_only")
    .order("published_at", { ascending: false, nullsFirst: false });

  // Match posts from followed authors OR categories OR publications
  const filters: string[] = [];
  if (authorIds.length) {
    filters.push(`author_id.in.(${authorIds.join(",")})`);
  }
  if (categoryIds.length) {
    filters.push(`category_id.in.(${categoryIds.join(",")})`);
  }
  if (publicationIds.length) {
    filters.push(`publication_id.in.(${publicationIds.join(",")})`);
  }
  query = query.or(filters.join(","));

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map((row) => redactListPost(mapPost(row as PostRow))),
    count: total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
