import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { PaginatedPosts, Post } from "../../types/post";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function listAllPosts(): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function listPaginatedPosts(
  page = 1,
  limit = 10
): Promise<PaginatedPosts | undefined> {
  return safeQuery(async () => {
    const supabase = await createClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    const total = count ?? 0;
    return {
      data: (data as PostRow[]).map(mapPost),
      count: total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  });
}

export async function listLatestPosts(limit = 6): Promise<Post[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
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

export async function listPostsByAuthor(authorId: string): Promise<Post[]> {
  if (!authorId) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select(POST_LIST_SELECT)
      .eq("author_id", authorId)
      .order("created_at", { ascending: false });
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
    let query = supabase.from("posts").select(POST_LIST_SELECT);

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

    const { data, error } = await query.order("created_at", { ascending: false });
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
      .or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as PostRow[]).map(mapPost);
  });
  return result ?? [];
}

export async function searchPostTitles(queryText: string): Promise<Pick<Post, "id" | "title">[]> {
  if (!queryText || queryText.length < 2) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("posts")
      .select("id, title")
      .or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`)
      .limit(10);
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: row.id as string, title: row.title as string }));
  });
  return result ?? [];
}

export async function listCuratedPosts(authorId?: string) {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    let query = supabase
      .from("posts")
      .select("id, title, created_at, updated_at")
      .order("created_at", { ascending: false });
    if (authorId) {
      query = query.eq("author_id", authorId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  });
  return result ?? [];
}
