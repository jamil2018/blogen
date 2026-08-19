import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { Comment } from "../../types/comment";
import { COMMENT_SELECT, mapComment, type CommentRow } from "./mappers";

export async function listCommentsByPost(postId: string): Promise<Comment[]> {
  if (!postId || !isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data as CommentRow[]).map(mapComment);
  } catch {
    return [];
  }
}

export async function countCommentsOnAuthorPosts(
  authorId: string
): Promise<number> {
  if (!authorId || !isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id")
      .eq("author_id", authorId);
    if (postsError) throw postsError;
    if (!posts?.length) return 0;

    const postIds = posts.map((row) => row.id as string);
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .in("post_id", postIds);
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getCommentById(
  postId: string,
  commentId: string
): Promise<Comment | undefined> {
  if (!postId || !commentId || !isSupabaseConfigured()) return undefined;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("post_id", postId)
      .eq("id", commentId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapComment(data as CommentRow) : undefined;
  } catch {
    return undefined;
  }
}
