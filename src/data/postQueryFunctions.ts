import {
  createPost as createPostAction,
  deletePostsByIds,
  getAllPosts as getAllPostsAction,
  getCuratedPosts,
  getCuratedPostsByAuthor,
  getLatestPosts as getLatestPostsAction,
  getPaginatedPosts as getPaginatedPostsAction,
  getPostById as getPostByIdAction,
  getPostsByAuthor,
  findPosts,
  searchPostResults as searchPostResultsAction,
  searchPosts as searchPostsAction,
  updatePost,
  type PostInput,
} from "../actions/posts";

export const getAllPosts = getAllPostsAction;
export const getLatestPosts = getLatestPostsAction;
export const getPostById = getPostByIdAction;
export const getCuratedPostList = getCuratedPosts;
export const getCuratedPostListByAuthor = getCuratedPostsByAuthor;
export const searchPosts = searchPostsAction;
export const searchPostResults = searchPostResultsAction;

export function getPaginatedPosts({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  return getPaginatedPostsAction({ page, limit });
}

export function getMyPosts() {
  return getPostsByAuthor();
}

export function getAllPostsByAuthorId(authorId: string) {
  return getPostsByAuthor(authorId);
}

export function getPostByCategoryName({
  categoryName,
}: {
  categoryName: string;
}) {
  return findPosts({ category: categoryName });
}

export function getPostByTagName({ tagName }: { tagName: string }) {
  return findPosts({ tag: tagName });
}

function toPostFormData(postData: PostInput) {
  const formData = new FormData();
  formData.set("title", postData.title);
  formData.set("description", postData.description);
  formData.set("summary", postData.summary);
  formData.set("category", postData.category);
  const tags = Array.isArray(postData.tags)
    ? postData.tags
    : postData.tags
      ? [postData.tags]
      : [];
  for (const tag of tags) {
    if (tag.trim()) formData.append("tags", tag.trim());
  }
  if (postData.image instanceof File && postData.image.size > 0) {
    formData.set("image", postData.image);
  }
  return formData;
}

export function createPost(postData: PostInput) {
  return createPostAction(toPostFormData(postData));
}

export function updatePostById({
  postId,
  values,
}: {
  postId: string;
  values: PostInput;
}) {
  return updatePost(postId, toPostFormData(values));
}

export function deleteMultiplePostsById(postId: string[]) {
  return deletePostsByIds(postId);
}
