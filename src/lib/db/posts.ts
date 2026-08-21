import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { PaginatedPosts, Post } from "../../types/post";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import {
  clampPage,
  computeTotalPages,
  paginationRange,
} from "../posts/contracts";

export type ListPostsFilters = {
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
  category?: string;
  tag?: string;
  author?: string;
  q?: string;
  /** When true, do not force status=published (studio / owner lists rely on RLS). */
  includeNonPublic?: boolean;
};

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

function applyPublicFilter<
  T extends {
    eq: (c: string, v: string) => T;
    neq: (c: string, v: string) => T;
  },
>(query: T, includeNonPublic?: boolean) {
  if (includeNonPublic) return query;
  return query.eq("status", "published").neq("distribution_mode", "email_only");
}

export async function listAllPosts(options?: {
  includeNonPublic?: boolean;
}): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    query = applyPublicFilter(query, options?.includeNonPublic);
    const { data, error } = await query;
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function listPaginatedPosts(
  page = 1,
  limit = 10,
  filters: Omit<ListPostsFilters, "page" | "limit"> = {}
): Promise<PaginatedPosts | undefined> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const ascending = filters.sort === "oldest";

    let countQuery = supabase
      .from("posts")
      .select("id", { count: "exact", head: true });
    countQuery = applyPublicFilter(countQuery, filters.includeNonPublic);

    let query = supabase.from("posts").select(POST_LIST_SELECT, { count: "exact" });
    query = applyPublicFilter(query, filters.includeNonPublic);

    if (filters.q) {
      const pattern = `%${filters.q}%`;
      query = query.or(`title.ilike.${pattern},description.ilike.${pattern},summary.ilike.${pattern}`);
      countQuery = countQuery.or(
        `title.ilike.${pattern},description.ilike.${pattern},summary.ilike.${pattern}`
      );
    }
    if (filters.tag) {
      query = query.contains("tags", [filters.tag]);
      countQuery = countQuery.contains("tags", [filters.tag]);
    }
    if (filters.author) {
      query = query.eq("author_id", filters.author);
      countQuery = countQuery.eq("author_id", filters.author);
    }
    if (filters.category) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("title", filters.category)
        .maybeSingle();
      if (!category) {
        return {
          data: [],
          count: 0,
          page: 1,
          limit,
          totalPages: 1,
        };
      }
      query = query.eq("category_id", category.id);
      countQuery = countQuery.eq("category_id", category.id);
    }

    const { count: rawCount, error: countError } = await countQuery;
    if (countError) throw countError;
    const total = rawCount ?? 0;
    const totalPages = computeTotalPages(total, limit);
    const safePage = clampPage(page, totalPages);
    const { from, to } = paginationRange(safePage, limit);

    const { data, error } = await query
      .order(filters.includeNonPublic ? "created_at" : "published_at", {
        ascending,
        nullsFirst: false,
      })
      .order("created_at", { ascending })
      .range(from, to);
    if (error) throw error;

    return {
      data: (data as PostRow[]).map(mapPost),
      count: total,
      page: safePage,
      limit,
      totalPages,
    };
  });
}

export async function listLatestPosts(limit = 6): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function getPostById(id: string): Promise<Post | undefined> {
  if (!id) return undefined;
  return safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPost(data as PostRow) : undefined;
  });
}

export async function listPostsByAuthor(
  authorId: string,
  options?: { includeNonPublic?: boolean }
): Promise<Post[]> {
  if (!authorId) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("author_id", authorId)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    query = applyPublicFilter(query, options?.includeNonPublic);
    const { data, error } = await query;
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function findPosts(filters: {
  category?: string;
  tag?: string;
  title?: string;
}): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("status", "published");

    if (filters.title) {
      query = query.ilike("title", `%${filters.title}%`);
    }
    if (filters.tag) {
      query = query.contains("tags", [filters.tag]);
    }
    if (filters.category) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("title", filters.category)
        .maybeSingle();
      if (!category) return [];
      query = query.eq("category_id", category.id);
    }

    const { data, error } = await query
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function searchPosts(queryText: string): Promise<Post[]> {
  if (!queryText) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("status", "published")
      .or(
        `title.ilike.%${queryText}%,description.ilike.%${queryText}%,summary.ilike.%${queryText}%`
      )
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function searchPostTitles(
  queryText: string
): Promise<Pick<Post, "id" | "title">[]> {
  if (!queryText || queryText.length < 2) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, title")
      .eq("status", "published")
      .or(
        `title.ilike.%${queryText}%,description.ilike.%${queryText}%,summary.ilike.%${queryText}%`
      )
      .limit(10);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
    }));
  });
  return result ?? [];
}

export async function listRelatedPosts(
  post: Post,
  limit = 3
): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const categoryId =
      typeof post.category === "object" ? post.category.id : post.category;
    let query = supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("status", "published")
      .neq("id", post.id)
      .limit(limit * 3);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throw error;

    const mapped = (data as PostRow[]).map(mapPost);
    const tagSet = new Set(post.tags ?? []);
    const scored = mapped
      .map((candidate) => {
        const overlap = candidate.tags.filter((t) => tagSet.has(t)).length;
        return { candidate, overlap };
      })
      .sort((a, b) => b.overlap - a.overlap);
    return scored.slice(0, limit).map((s) => s.candidate);
  });
  return result ?? [];
}

export async function listCuratedPosts(authorId?: string) {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("id, title, status, created_at, updated_at, published_at")
      .order("created_at", { ascending: false });
    if (authorId) {
      query = query.eq("author_id", authorId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      status: row.status as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      publishedAt: row.published_at as string | null,
    }));
  });
  return result ?? [];
}

export async function getPlatformStats() {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("public_platform_stats");
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return {
      publishedPosts: Number(row?.published_posts ?? 0),
      authorsWithPosts: Number(row?.authors_with_posts ?? 0),
      categoriesWithPosts: Number(row?.categories_with_posts ?? 0),
    };
  });
  return (
    result ?? {
      publishedPosts: 0,
      authorsWithPosts: 0,
      categoriesWithPosts: 0,
    }
  );
}

export async function getAuthorPostCounts(authorId?: string) {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("public_post_counts_by_author", {
      p_author_id: authorId ?? null,
    });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      authorId: row.author_id as string,
      postCount: Number(row.post_count),
    }));
  });
  return result ?? [];
}

export async function getCategoryPostCounts(categoryId?: string) {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("public_post_counts_by_category", {
      p_category_id: categoryId ?? null,
    });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      categoryId: row.category_id as string,
      postCount: Number(row.post_count),
    }));
  });
  return result ?? [];
}
