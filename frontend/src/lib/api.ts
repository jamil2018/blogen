import axios from "axios";
import type { Category, PaginatedPosts, Post, User } from "../types";

const isServer = typeof window === "undefined";

function getBaseURL(): string {
  if (isServer) {
    return process.env.API_INTERNAL_URL ?? "http://localhost:8000";
  }

  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

/** Server-safe GET that never throws — RSC pages stay renderable if Express is down. */
export async function serverGet<T>(
  url: string,
  config?: { params?: Record<string, string | number> }
): Promise<T | undefined> {
  try {
    const { data } = await api.get<T>(url, config);
    return data;
  } catch {
    return undefined;
  }
}

export function fetchLatestPosts() {
  return serverGet<Post[]>("/api/posts/latest");
}

export function fetchPaginatedPosts(page = 1, limit = 5) {
  return serverGet<PaginatedPosts>(
    `/api/posts/paginated?page=${page}&limit=${limit}`
  );
}

export function fetchPostById(postId: string) {
  return serverGet<Post>(`/api/posts/${postId}`);
}

export function fetchAllCategories() {
  return serverGet<Category[]>("/api/categories");
}

export function fetchAllUsers() {
  return serverGet<User[]>("/api/users/");
}

export function fetchLatestUsers() {
  return serverGet<User[]>("/api/users/latest");
}

export function fetchUserById(userId: string) {
  if (!userId) {
    return Promise.resolve(undefined);
  }
  return serverGet<User>(`/api/users/${userId}`);
}

export function fetchPostsByAuthorId(authorId: string) {
  return serverGet<Post[]>(`/api/posts/author/${authorId}`);
}

export function fetchPostsByCategoryName(categoryName: string) {
  return serverGet<Post[]>("/api/posts/find", {
    params: { category: categoryName },
  });
}

export function fetchPostsByTagName(tagName: string) {
  return serverGet<Post[]>("/api/posts/find", {
    params: { tag: tagName },
  });
}

export function fetchSearchPostResults(searchQuery: string) {
  return serverGet<Post[]>(
    `/api/posts/searchresult?query=${encodeURIComponent(searchQuery)}`
  );
}
