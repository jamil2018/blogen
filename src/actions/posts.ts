"use server";

import { revalidatePath } from "next/cache";
import {
  findPosts as findPostsQuery,
  getPostById as getPostByIdQuery,
  listAllPosts,
  listCuratedPosts,
  listLatestPosts,
  listPaginatedPosts,
  listPostsByAuthor,
  searchPostTitles,
  searchPosts as searchPostsQuery,
} from "../lib/db/posts";
import { requireUser } from "../lib/db/auth";
import {
  deleteStorageObject,
  isUploadedFile,
  uploadPublicFile,
} from "../lib/storage";
import { mapPost, POST_LIST_SELECT, type PostRow } from "../lib/db/mappers";
import type { TablesUpdate } from "../lib/supabase/database.types";
import type { Post } from "../types/post";

export type PostInput = {
  title: string;
  description: string;
  summary: string;
  category: string;
  tags?: string[] | string;
  image?: File | null;
};

function normalizeTags(tags?: string[] | string) {
  if (!tags) return [] as string[];
  if (Array.isArray(tags)) return tags.map((tag) => tag.trim()).filter(Boolean);
  if (tags.includes(",")) {
    return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return tags.trim() ? [tags.trim()] : [];
}

function readPostInput(formData: FormData): PostInput {
  const tags = formData.getAll("tags").flatMap((value) =>
    normalizeTags(String(value))
  );
  const image = formData.get("image");
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    category: String(formData.get("category") ?? ""),
    tags,
    image: isUploadedFile(image) ? image : null,
  };
}

export async function getAllPosts() {
  return listAllPosts();
}

export async function getPaginatedPosts({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) {
  const result = await listPaginatedPosts(page, limit);
  if (!result) {
    return { data: [], count: 0, page, limit, totalPages: 1 };
  }
  return result;
}

export async function getLatestPosts() {
  return listLatestPosts();
}

export async function getPostById(postId: string) {
  const post = await getPostByIdQuery(postId);
  if (!post) throw new Error("Invalid post id");
  return post;
}

export async function getPostsByAuthor(authorId?: string) {
  if (authorId) {
    return listPostsByAuthor(authorId);
  }
  const { user } = await requireUser();
  return listPostsByAuthor(user.id);
}

export async function findPosts(filters: {
  category?: string;
  tag?: string;
  title?: string;
}) {
  return findPostsQuery(filters);
}

export async function searchPosts(searchQuery: string) {
  if (!searchQuery || searchQuery.length < 2) return [];
  return searchPostTitles(searchQuery);
}

export async function searchPostResults(searchQuery: string) {
  return searchPostsQuery(searchQuery);
}

export async function getCuratedPosts() {
  return listCuratedPosts();
}

export async function getCuratedPostsByAuthor() {
  const { user } = await requireUser();
  return listCuratedPosts(user.id);
}

export async function createPost(formData: FormData): Promise<Post> {
  const postData = readPostInput(formData);
  const { supabase, user } = await requireUser();

  if (!postData.image) {
    throw new Error("Cover image is required");
  }

  const uploaded = await uploadPublicFile(
    supabase,
    "post-covers",
    user.id,
    postData.image
  );
  const coverUrl = uploaded.url;
  const coverPath = uploaded.path;

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title: postData.title,
      description: postData.description,
      summary: postData.summary,
      category_id: postData.category,
      tags: normalizeTags(postData.tags),
      author_id: user.id,
      cover_url: coverUrl ?? null,
      cover_path: coverPath ?? null,
    })
    .select(POST_LIST_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Invalid post data");
  revalidatePath("/");
  revalidatePath("/user/posts");
  revalidatePath("/admin/posts");
  return mapPost(data as PostRow);
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<Post> {
  const postData = readPostInput(formData);
  const { supabase, user } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from("posts")
    .select("id, author_id, cover_path")
    .eq("id", postId)
    .maybeSingle();

  if (existingError || !existing) throw new Error("Invalid post id");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.author_id !== user.id && !profile?.is_admin) {
    throw new Error("Not authorized to update this post");
  }

  const updates: TablesUpdate<"posts"> = {
    title: postData.title,
    description: postData.description,
    summary: postData.summary,
    category_id: postData.category,
    tags: normalizeTags(postData.tags),
  };

  if (isUploadedFile(postData.image)) {
    const uploaded = await uploadPublicFile(
      supabase,
      "post-covers",
      user.id,
      postData.image
    );
    updates.cover_url = uploaded.url;
    updates.cover_path = uploaded.path;
    await deleteStorageObject(supabase, "post-covers", existing.cover_path);
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select(POST_LIST_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Invalid post id");
  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/user/posts");
  revalidatePath("/admin/posts");
  return mapPost(data as PostRow);
}

export async function deletePost(postId: string) {
  return deletePostsByIds([postId]);
}

export async function deletePostsByIds(ids: string[]) {
  const { supabase } = await requireUser();
  const { data: posts, error: lookupError } = await supabase
    .from("posts")
    .select("id, cover_path")
    .in("id", ids);

  if (lookupError) throw new Error(lookupError.message);

  for (const post of posts ?? []) {
    await deleteStorageObject(supabase, "post-covers", post.cover_path);
  }

  const { error, count } = await supabase
    .from("posts")
    .delete({ count: "exact" })
    .in("id", ids);

  if (error) throw new Error(error.message);
  if (!count) throw new Error("No posts matched the query");
  revalidatePath("/");
  revalidatePath("/user/posts");
  revalidatePath("/admin/posts");
  return { message: "All posts have been deleted" };
}
