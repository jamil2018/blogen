"use server";

import { revalidatePath } from "next/cache";
import {
  findPosts as findPostsQuery,
  getAuthorPostCounts,
  getCategoryPostCounts,
  getPlatformStats,
  getPostById as getPostByIdQuery,
  listAllPosts,
  listCuratedPosts,
  listLatestPosts,
  listPaginatedPosts,
  listPostsByAuthor,
  listRelatedPosts,
  listRelatedIdeas,
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
import type { TablesInsert, TablesUpdate } from "../lib/supabase/database.types";
import type { Post, PostStatus } from "../types/post";
import { slugifyTitle } from "../lib/posts/contracts";
import { logAppEvent } from "../lib/observability";
import { upsertPostStructuralMetadata } from "../lib/db/phase2-content";

export type PostInput = {
  title: string;
  description: string;
  summary: string;
  category: string;
  tags?: string[] | string;
  image?: File | null;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  slug?: string;
  scheduledAt?: string;
  distributeWeb?: boolean;
  distributeFollowers?: boolean;
  distributeEmail?: boolean;
  publicationId?: string;
  sectionId?: string;
  distributionMode?: "web_only" | "email_only" | "web_and_email";
  accessLevel?: "public" | "members" | "paid";
  requiredTierId?: string;
  previewPercent?: number;
  submitToPublication?: boolean;
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
    seoTitle: String(formData.get("seoTitle") ?? "") || undefined,
    seoDescription: String(formData.get("seoDescription") ?? "") || undefined,
    canonicalUrl: String(formData.get("canonicalUrl") ?? "") || undefined,
    slug: String(formData.get("slug") ?? "") || undefined,
    scheduledAt: String(formData.get("scheduledAt") ?? "") || undefined,
    distributeWeb: formData.get("distributeWeb") !== "false",
    distributeFollowers: formData.get("distributeFollowers") !== "false",
    distributeEmail: formData.get("distributeEmail") === "true",
    publicationId: String(formData.get("publicationId") ?? "") || undefined,
    sectionId: String(formData.get("sectionId") ?? "") || undefined,
    distributionMode: (String(formData.get("distributionMode") ?? "") ||
      undefined) as PostInput["distributionMode"],
    accessLevel: (String(formData.get("accessLevel") ?? "") ||
      undefined) as PostInput["accessLevel"],
    requiredTierId: String(formData.get("requiredTierId") ?? "") || undefined,
    previewPercent: formData.get("previewPercent")
      ? Number(formData.get("previewPercent"))
      : undefined,
    submitToPublication: formData.get("submitToPublication") === "true",
  };
}

async function appendRevision(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  postId: string,
  actorId: string,
  row: {
    title: string;
    description: string;
    summary: string;
    cover_url: string | null;
    cover_path: string | null;
    tags: string[];
    category_id: string;
    slug: string | null;
    seo_title: string | null;
    seo_description: string | null;
    canonical_url: string | null;
    published_at: string;
  }
) {
  const { data: latest } = await supabase
    .from("post_revisions")
    .select("revision_number")
    .eq("post_id", postId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const revision_number = (latest?.revision_number ?? 0) + 1;
  const insert: TablesInsert<"post_revisions"> = {
    post_id: postId,
    revision_number,
    title: row.title,
    description: row.description,
    summary: row.summary,
    cover_url: row.cover_url,
    cover_path: row.cover_path,
    tags: row.tags,
    category_id: row.category_id,
    slug: row.slug,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    canonical_url: row.canonical_url,
    published_at: row.published_at,
    created_by: actorId,
  };
  const { data: inserted, error } = await supabase
    .from("post_revisions")
    .insert(insert)
    .select("id, revision_number")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Failed to append revision");

  try {
    const { data: postRow } = await supabase
      .from("posts")
      .select("author_id, tags")
      .eq("id", postId)
      .maybeSingle();
    if (postRow) {
      await upsertPostStructuralMetadata({
        postId,
        revisionId: inserted.id,
        revisionNumber: inserted.revision_number,
        html: row.description,
        tags: row.tags,
        authorId: postRow.author_id,
        publishedAt: row.published_at,
      });
    }
  } catch (metaError) {
    logAppEvent("warn", "post.structure_metadata_failed", {
      postId,
      message: metaError instanceof Error ? metaError.message : "unknown",
    });
  }

  return inserted;
}

async function recordSlugRedirect(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  postId: string,
  oldSlug: string | null | undefined,
  newSlug: string | null | undefined
) {
  if (!oldSlug || !newSlug || oldSlug === newSlug) return;
  await supabase.from("post_slug_redirects").upsert(
    { old_slug: oldSlug, post_id: postId },
    { onConflict: "old_slug" }
  );
}

export async function getAllPosts() {
  return listAllPosts({ includeNonPublic: true });
}

export async function getPublicPosts() {
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
  const { applyPaywallToPost } = await import("../lib/db/memberships");
  return applyPaywallToPost(post);
}

export async function getPostsByAuthor(authorId?: string) {
  if (authorId) {
    return listPostsByAuthor(authorId);
  }
  const { user } = await requireUser();
  return listPostsByAuthor(user.id, { includeNonPublic: true });
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

export async function getRelatedPosts(postId: string) {
  const post = await getPostByIdQuery(postId);
  if (!post) return [];
  return listRelatedPosts(post);
}

export async function getRelatedIdeas(postId: string) {
  const post = await getPostByIdQuery(postId);
  if (!post) return [];
  return listRelatedIdeas(post);
}

export async function getCuratedPosts() {
  return listCuratedPosts();
}

export async function getCuratedPostsByAuthor() {
  const { user } = await requireUser();
  return listCuratedPosts(user.id);
}

export async function getPublicPlatformStats() {
  return getPlatformStats();
}

export async function getPublicAuthorPostCounts() {
  return getAuthorPostCounts();
}

export async function getPublicCategoryPostCounts() {
  return getCategoryPostCounts();
}

async function assertCanEditPost(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  userId: string,
  postId: string
) {
  const { data: existing, error } = await supabase
    .from("posts")
    .select(
      "id, author_id, cover_path, status, slug, published_at, scheduled_at"
    )
    .eq("id", postId)
    .maybeSingle();
  if (error || !existing) throw new Error("Invalid post id");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (existing.author_id !== userId && !profile?.is_admin) {
    throw new Error("Not authorized to update this post");
  }
  return existing;
}

export async function getPostRevisions(postId: string) {
  const { supabase, user } = await requireUser();
  await assertCanEditPost(supabase, user.id, postId);
  const { data, error } = await supabase
    .from("post_revisions")
    .select(
      "id, post_id, revision_number, title, summary, slug, published_at, created_at"
    )
    .eq("post_id", postId)
    .order("revision_number", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    postId: row.post_id,
    revisionNumber: row.revision_number,
    title: row.title,
    summary: row.summary,
    slug: row.slug ?? undefined,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }));
}

export async function getPostBySlug(slug: string) {
  const { createClient } = await import("../lib/supabase/server");
  const { isSupabaseConfigured } = await import("../lib/supabase/env");
  if (!isSupabaseConfigured() || !slug) return null;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const { applyPaywallToPost } = await import("../lib/db/memberships");

  if (post) {
    return applyPaywallToPost(mapPost(post as PostRow));
  }

  const { data: redirect } = await supabase
    .from("post_slug_redirects")
    .select("post_id")
    .eq("old_slug", slug)
    .maybeSingle();

  if (!redirect) return null;

  const { data: redirected } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("id", redirect.post_id)
    .eq("status", "published")
    .maybeSingle();

  return redirected
    ? applyPaywallToPost(mapPost(redirected as PostRow))
    : null;
}

export async function createPost(formData: FormData): Promise<Post> {
  const intent = String(formData.get("intent") ?? "draft") as
    | "draft"
    | "publish"
    | "schedule";
  const postData = readPostInput(formData);
  const { supabase, user } = await requireUser();

  let coverUrl: string | null = null;
  let coverPath: string | null = null;

  if (postData.image) {
    const uploaded = await uploadPublicFile(
      supabase,
      "post-covers",
      user.id,
      postData.image
    );
    coverUrl = uploaded.url;
    coverPath = uploaded.path;
  } else if (intent === "publish" || intent === "schedule") {
    throw new Error("Cover image is required to publish");
  }

  const now = new Date().toISOString();
  let status: PostStatus = "draft";
  let published_at: string | null = null;
  let scheduled_at: string | null = null;

  if (intent === "publish") {
    status = "published";
    published_at = now;
  } else if (intent === "schedule") {
    if (!postData.scheduledAt) {
      throw new Error("scheduledAt is required to schedule");
    }
    const when = new Date(postData.scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new Error("Schedule time must be in the future");
    }
    status = "scheduled";
    scheduled_at = when.toISOString();
  }

  const slug =
    postData.slug?.trim() ||
    slugifyTitle(postData.title || "untitled", crypto.randomUUID());

  const insert: TablesInsert<"posts"> = {
    title: postData.title,
    description: postData.description,
    summary: postData.summary,
    category_id: postData.category,
    tags: normalizeTags(postData.tags),
    author_id: user.id,
    cover_url: coverUrl,
    cover_path: coverPath,
    status,
    slug,
    seo_title: postData.seoTitle ?? null,
    seo_description: postData.seoDescription ?? null,
    canonical_url: postData.canonicalUrl ?? null,
    published_at,
    scheduled_at,
    distribute_web: postData.distributeWeb ?? true,
    distribute_followers: postData.distributeFollowers ?? true,
    distribute_email: postData.distributeEmail ?? false,
    publication_id: postData.publicationId ?? null,
    section_id: postData.sectionId ?? null,
    distribution_mode: postData.distributionMode ?? "web_only",
    access_level: postData.accessLevel ?? "public",
    required_tier_id: postData.requiredTierId ?? null,
    preview_percent: postData.previewPercent ?? 20,
    submission_status: postData.submitToPublication
      ? "submitted"
      : null,
  };

  const { data, error } = await supabase
    .from("posts")
    .insert(insert)
    .select(POST_LIST_SELECT)
    .single();

  if (error || !data) {
    logAppEvent("error", "post.create_failed", { message: error?.message });
    throw new Error(error?.message ?? "Invalid post data");
  }

  if (status === "published") {
    await appendRevision(supabase, data.id, user.id, {
      title: data.title,
      description: data.description,
      summary: data.summary,
      cover_url: data.cover_url,
      cover_path: data.cover_path,
      tags: data.tags ?? [],
      category_id: data.category_id,
      slug: data.slug,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      canonical_url: data.canonical_url,
      published_at: data.published_at ?? now,
    });
  }

  revalidatePath("/");
  revalidatePath("/user/posts");
  revalidatePath("/admin/posts");
  return mapPost(data as PostRow);
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<Post> {
  const intent = String(formData.get("intent") ?? "draft") as
    | "draft"
    | "publish"
    | "schedule"
    | "unpublish"
    | "archive";
  const postData = readPostInput(formData);
  const { supabase, user } = await requireUser();
  const existing = await assertCanEditPost(supabase, user.id, postId);

  const updates: TablesUpdate<"posts"> = {
    title: postData.title,
    description: postData.description,
    summary: postData.summary,
    category_id: postData.category,
    tags: normalizeTags(postData.tags),
    seo_title: postData.seoTitle ?? null,
    seo_description: postData.seoDescription ?? null,
    canonical_url: postData.canonicalUrl ?? null,
    distribute_web: postData.distributeWeb ?? true,
    distribute_followers: postData.distributeFollowers ?? true,
    distribute_email: postData.distributeEmail ?? false,
    publication_id: postData.publicationId ?? null,
    section_id: postData.sectionId ?? null,
    distribution_mode: postData.distributionMode ?? "web_only",
    access_level: postData.accessLevel ?? "public",
    required_tier_id: postData.requiredTierId ?? null,
    preview_percent: postData.previewPercent ?? 20,
  };

  if (postData.submitToPublication && postData.publicationId) {
    updates.submission_status = "submitted";
  }

  if (postData.slug?.trim()) {
    updates.slug = postData.slug.trim();
  }

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

  const now = new Date().toISOString();
  if (intent === "publish") {
    updates.status = "published";
    updates.published_at = existing.published_at ?? now;
    updates.scheduled_at = null;
    updates.slug =
      updates.slug ??
      existing.slug ??
      slugifyTitle(postData.title || "untitled", postId);
  } else if (intent === "schedule") {
    if (!postData.scheduledAt) {
      throw new Error("scheduledAt is required to schedule");
    }
    const when = new Date(postData.scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new Error("Schedule time must be in the future");
    }
    updates.status = "scheduled";
    updates.scheduled_at = when.toISOString();
    updates.slug =
      updates.slug ??
      existing.slug ??
      slugifyTitle(postData.title || "untitled", postId);
  } else if (intent === "unpublish") {
    updates.status = "draft";
    updates.scheduled_at = null;
  } else if (intent === "archive") {
    updates.status = "archived";
    updates.scheduled_at = null;
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .select(POST_LIST_SELECT)
    .single();

  if (error || !data) {
    logAppEvent("error", "post.update_failed", {
      postId,
      message: error?.message,
    });
    throw new Error(error?.message ?? "Invalid post id");
  }

  await recordSlugRedirect(supabase, postId, existing.slug, data.slug);

  if (intent === "publish") {
    await appendRevision(supabase, postId, user.id, {
      title: data.title,
      description: data.description,
      summary: data.summary,
      cover_url: data.cover_url,
      cover_path: data.cover_path,
      tags: data.tags ?? [],
      category_id: data.category_id,
      slug: data.slug,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      canonical_url: data.canonical_url,
      published_at: data.published_at ?? now,
    });
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  if (data.slug) revalidatePath(`/p/${data.slug}`);
  revalidatePath("/user/posts");
  revalidatePath("/admin/posts");
  return mapPost(data as PostRow);
}

export async function saveDraft(formData: FormData): Promise<Post> {
  formData.set("intent", "draft");
  const postId = String(formData.get("postId") ?? "");
  if (postId) return updatePost(postId, formData);
  return createPost(formData);
}

export async function schedulePost(postId: string, formData: FormData) {
  formData.set("intent", "schedule");
  return updatePost(postId, formData);
}

export async function publishPost(postId: string, formData?: FormData) {
  const data = formData ?? new FormData();
  data.set("intent", "publish");
  if (!data.get("title")) {
    const existing = await getPostByIdQuery(postId);
    if (!existing) throw new Error("Invalid post id");
    data.set("title", existing.title);
    data.set("description", existing.description);
    data.set("summary", existing.summary);
    data.set(
      "category",
      typeof existing.category === "string"
        ? existing.category
        : existing.category.id
    );
    for (const tag of existing.tags) data.append("tags", tag);
  }
  return updatePost(postId, data);
}

export async function unpublishPost(postId: string) {
  const existing = await getPostByIdQuery(postId);
  if (!existing) throw new Error("Invalid post id");
  const formData = new FormData();
  formData.set("intent", "unpublish");
  formData.set("title", existing.title);
  formData.set("description", existing.description);
  formData.set("summary", existing.summary);
  formData.set(
    "category",
    typeof existing.category === "string"
      ? existing.category
      : existing.category.id
  );
  for (const tag of existing.tags) formData.append("tags", tag);
  return updatePost(postId, formData);
}

export async function archivePost(postId: string) {
  const existing = await getPostByIdQuery(postId);
  if (!existing) throw new Error("Invalid post id");
  const formData = new FormData();
  formData.set("intent", "archive");
  formData.set("title", existing.title);
  formData.set("description", existing.description);
  formData.set("summary", existing.summary);
  formData.set(
    "category",
    typeof existing.category === "string"
      ? existing.category
      : existing.category.id
  );
  for (const tag of existing.tags) formData.append("tags", tag);
  return updatePost(postId, formData);
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

/**
 * Publish due scheduled posts. Called by Vercel Cron with service role.
 * Returns count of posts published.
 */
export async function publishDueScheduledPosts(nowIso = new Date().toISOString()) {
  const { createAdminClient } = await import("../lib/supabase/admin");
  const supabase = createAdminClient();

  const { data: due, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(50);

  if (error) throw new Error(error.message);

  let published = 0;
  for (const row of due ?? []) {
    const post = row as PostRow;
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: post.published_at ?? nowIso,
        scheduled_at: null,
      })
      .eq("id", post.id)
      .eq("status", "scheduled");

    if (updateError) {
      logAppEvent("error", "cron.publish_scheduled_failed", {
        postId: post.id,
        message: updateError.message,
      });
      continue;
    }

    const { data: latest } = await supabase
      .from("post_revisions")
      .select("revision_number")
      .eq("post_id", post.id)
      .order("revision_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    await supabase.from("post_revisions").insert({
      post_id: post.id,
      revision_number: (latest?.revision_number ?? 0) + 1,
      title: post.title,
      description: post.description,
      summary: post.summary,
      cover_url: post.cover_url,
      cover_path: post.cover_path,
      tags: post.tags ?? [],
      category_id: post.category_id!,
      slug: post.slug,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      canonical_url: post.canonical_url,
      published_at: post.published_at ?? nowIso,
      created_by: post.author_id,
    });

    published += 1;
    revalidatePath(`/posts/${post.id}`);
    if (post.slug) revalidatePath(`/p/${post.slug}`);
  }

  if (published) {
    revalidatePath("/");
    revalidatePath("/following");
  }

  return { published };
}
