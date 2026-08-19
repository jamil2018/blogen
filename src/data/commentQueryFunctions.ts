import {
  createComment,
  deleteComment,
  getAuthorCommentCount,
  getComment,
  getCommentsByPost,
  updateComment,
} from "../actions/comments";

export const getCommentsByPostId = getCommentsByPost;
export const getMyCommentCount = getAuthorCommentCount;

export function getCommentByPostIdCommentId({
  postId,
  commentId,
}: {
  postId: string;
  commentId: string;
}) {
  return getComment(postId, commentId);
}

export function updateCommentByPostIdCommentId(args: {
  postId: string;
  commentId: string;
  values: { text: string };
}) {
  return updateComment(args);
}

export function createCommentByPostId(args: {
  postId: string;
  values: { text: string };
}) {
  return createComment(args);
}

export function deleteCommentById(args: { postId: string; commentId: string }) {
  return deleteComment(args);
}
