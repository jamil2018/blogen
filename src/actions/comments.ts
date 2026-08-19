"use server";

import { revalidatePath } from "next/cache";
import {
  countCommentsOnAuthorPosts,
  getCommentById,
  listCommentsByPost,
} from "../lib/db/comments";
import { requireUser } from "../lib/db/auth";
import { COMMENT_SELECT, mapComment, type CommentRow } from "../lib/db/mappers";

export async function getCommentsByPost(postId: string) {
  return listCommentsByPost(postId);
}

export async function getAuthorCommentCount() {
  const { user } = await requireUser();
  return countCommentsOnAuthorPosts(user.id);
}

export async function getComment(postId: string, commentId: string) {
  const comment = await getCommentById(postId, commentId);
  if (!comment) throw new Error("Invalid comment id");
  return comment;
}

export async function createComment({
  postId,
  values,
}: {
  postId: string;
  values: { text: string };
}) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      author_id: user.id,
      text: values.text,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Invalid post id");
  revalidatePath(`/posts/${postId}`);
  return mapComment(data as CommentRow);
}

export async function updateComment({
  postId,
  commentId,
  values,
}: {
  postId: string;
  commentId: string;
  values: { text: string };
}) {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("comments")
    .update({ text: values.text })
    .eq("id", commentId)
    .eq("post_id", postId)
    .select(COMMENT_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Invalid comment id");
  revalidatePath(`/posts/${postId}`);
  return mapComment(data as CommentRow);
}

export async function deleteComment({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) {
  const { supabase } = await requireUser();
  const { error, count } = await supabase
    .from("comments")
    .delete({ count: "exact" })
    .eq("id", commentId)
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  if (!count) throw new Error("Invalid comment id");
  revalidatePath(`/posts/${postId}`);
  return { message: "Comment has been deleted" };
}
