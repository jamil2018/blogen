import {
  archivePost as archivePostAction,
  createPost as createPostAction,
  deletePostsByIds,
  getAllPosts as getAllPostsAction,
  getCuratedPosts,
  getCuratedPostsByAuthor,
  getLatestPosts as getLatestPostsAction,
  getPaginatedPosts as getPaginatedPostsAction,
  getPostById as getPostByIdAction,
  getPostRevisions as getPostRevisionsAction,
  getPostsByAuthor,
  getPublicAuthorPostCounts,
  getPublicCategoryPostCounts,
  getPublicPlatformStats,
  getPublicTags,
  getRelatedPosts,
  getRelatedIdeas,
  findPosts,
  publishPost as publishPostAction,
  searchPostResults as searchPostResultsAction,
  searchPosts as searchPostsAction,
  unpublishPost as unpublishPostAction,
  updatePost,
  type PostInput,
} from "../actions/posts";

export const getAllPosts = getAllPostsAction;
export const getLatestPosts = getLatestPostsAction;
export const getPostById = getPostByIdAction;
export const getPostRevisions = getPostRevisionsAction;
export const getCuratedPostList = getCuratedPosts;
export const getCuratedPostListByAuthor = getCuratedPostsByAuthor;
export const searchPosts = searchPostsAction;
export const searchPostResults = searchPostResultsAction;
export const getPlatformStats = getPublicPlatformStats;
export const getAuthorPostCounts = getPublicAuthorPostCounts;
export const getCategoryPostCounts = getPublicCategoryPostCounts;
export const getPublicTagList = getPublicTags;
export const getRelatedPostsForId = getRelatedPosts;
export const getRelatedIdeasForId = getRelatedIdeas;

export function getPaginatedPosts({
  page,
  limit,
  q,
  categories,
  tag,
  authors,
  sort,
}: {
  page: number;
  limit: number;
  q?: string;
  categories?: string[];
  tag?: string;
  authors?: string[];
  sort?: "newest" | "oldest";
}) {
  return getPaginatedPostsAction({ page, limit, q, categories, tag, authors, sort });
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

function toPostFormData(
  postData: PostInput & { intent?: string; postId?: string }
) {
  const formData = new FormData();
  formData.set("title", postData.title);
  formData.set("description", postData.description);
  formData.set("summary", postData.summary);
  formData.set("category", postData.category);
  if (postData.intent) formData.set("intent", postData.intent);
  if (postData.postId) formData.set("postId", postData.postId);
  if (postData.seoTitle) formData.set("seoTitle", postData.seoTitle);
  if (postData.seoDescription) {
    formData.set("seoDescription", postData.seoDescription);
  }
  if (postData.canonicalUrl) formData.set("canonicalUrl", postData.canonicalUrl);
  if (postData.slug) formData.set("slug", postData.slug);
  if (postData.scheduledAt) formData.set("scheduledAt", postData.scheduledAt);
  if (postData.distributeWeb !== undefined) {
    formData.set("distributeWeb", String(postData.distributeWeb));
  }
  if (postData.distributeFollowers !== undefined) {
    formData.set("distributeFollowers", String(postData.distributeFollowers));
  }
  if (postData.distributeEmail !== undefined) {
    formData.set("distributeEmail", String(postData.distributeEmail));
  }
  if (postData.publicationId) {
    formData.set("publicationId", postData.publicationId);
  }
  if (postData.sectionId) {
    formData.set("sectionId", postData.sectionId);
  }
  if (postData.distributionMode) {
    formData.set("distributionMode", postData.distributionMode);
  }
  if (postData.accessLevel) {
    formData.set("accessLevel", postData.accessLevel);
  }
  if (postData.requiredTierId) {
    formData.set("requiredTierId", postData.requiredTierId);
  }
  if (postData.previewPercent !== undefined) {
    formData.set("previewPercent", String(postData.previewPercent));
  }
  if (postData.submitToPublication !== undefined) {
    formData.set(
      "submitToPublication",
      String(postData.submitToPublication)
    );
  }
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

export function createPost(
  postData: PostInput & { intent?: "draft" | "publish" | "schedule" }
) {
  return createPostAction(
    toPostFormData({ ...postData, intent: postData.intent ?? "publish" })
  );
}

export function saveDraftPost(postData: PostInput & { postId?: string }) {
  const formData = toPostFormData({
    ...postData,
    intent: "draft",
    postId: postData.postId,
  });
  if (postData.postId) {
    return updatePost(postData.postId, formData);
  }
  return createPostAction(formData);
}

export function updatePostById({
  postId,
  values,
  intent = "draft",
}: {
  postId: string;
  values: PostInput;
  intent?: "draft" | "publish" | "schedule" | "unpublish" | "archive";
}) {
  return updatePost(postId, toPostFormData({ ...values, intent, postId }));
}

export function publishPostById(postId: string) {
  return publishPostAction(postId);
}

export function unpublishPostById(postId: string) {
  return unpublishPostAction(postId);
}

export function archivePostById(postId: string) {
  return archivePostAction(postId);
}

export function deleteMultiplePostsById(postId: string[]) {
  return deletePostsByIds(postId);
}
