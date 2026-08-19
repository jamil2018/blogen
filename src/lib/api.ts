import {
  findPosts,
  getPostById as getPostByIdQuery,
  listLatestPosts,
  listPaginatedPosts,
  listPostsByAuthor,
  searchPosts,
} from "./db/posts";
import { listCategories } from "./db/categories";
import { getProfileById } from "./db/auth";
import { listLatestUsers, listUsers } from "./db/users";
import type { Category, PaginatedPosts, Post, User } from "../types";

export async function fetchLatestPosts() {
  return listLatestPosts();
}

export async function fetchPaginatedPosts(page = 1, limit = 5) {
  return listPaginatedPosts(page, limit) as Promise<PaginatedPosts | undefined>;
}

export async function fetchPostById(postId: string) {
  return getPostByIdQuery(postId);
}

export async function fetchAllCategories() {
  return listCategories();
}

export async function fetchAllUsers() {
  return listUsers();
}

export async function fetchLatestUsers() {
  return listLatestUsers();
}

export async function fetchUserById(userId: string): Promise<User | undefined> {
  if (!userId) return undefined;
  return getProfileById(userId);
}

export async function fetchPostsByAuthorId(authorId: string) {
  return listPostsByAuthor(authorId);
}

export async function fetchPostsByCategoryName(categoryName: string) {
  return findPosts({ category: categoryName });
}

export async function fetchPostsByTagName(tagName: string) {
  return findPosts({ tag: tagName });
}

export async function fetchSearchPostResults(searchQuery: string) {
  return searchPosts(searchQuery);
}

export type { Category, PaginatedPosts, Post, User };
