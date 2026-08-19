import type { Category } from "../../types/category";
import type { Comment } from "../../types/comment";
import type { Post } from "../../types/post";
import type { User } from "../../types/user";

export type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  facebook_id: string | null;
  linkedin_id: string | null;
  twitter_id: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  is_admin: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CategoryRow = {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
};

export type PostRow = {
  id: string;
  title: string;
  description: string;
  summary: string;
  cover_url: string | null;
  cover_path: string | null;
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  author_id?: string;
  category_id?: string;
  author?: ProfileRow | ProfileRow[] | null;
  category?: CategoryRow | CategoryRow[] | null;
};

export type CommentRow = {
  id: string;
  text: string;
  created_at: string | null;
  updated_at: string | null;
  author_id?: string;
  post_id?: string;
  author?: ProfileRow | ProfileRow[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function mapUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    isAdmin: Boolean(row.is_admin),
    bio: row.bio ?? undefined,
    facebookId: row.facebook_id ?? undefined,
    linkedinId: row.linkedin_id ?? undefined,
    twitterId: row.twitter_id ?? undefined,
    imageURL: row.avatar_url ?? undefined,
    imageFileName: row.avatar_path ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function mapPost(row: PostRow): Post {
  const author = one(row.author);
  const category = one(row.category);

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    summary: row.summary,
    imageURL: row.cover_url ?? undefined,
    imageFileName: row.cover_path ?? undefined,
    tags: row.tags ?? [],
    author: author ? mapUser(author) : (row.author_id ?? ""),
    category: category ? mapCategory(category) : (row.category_id ?? ""),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function mapComment(row: CommentRow): Comment {
  const author = one(row.author);
  return {
    id: row.id,
    text: row.text,
    author: author ? mapUser(author) : (row.author_id ?? ""),
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export const PROFILE_COLUMNS =
  "id, name, email, bio, facebook_id, linkedin_id, twitter_id, avatar_url, avatar_path, is_admin, created_at, updated_at";

export const POST_LIST_SELECT = `
  id, title, description, summary, cover_url, cover_path, tags, created_at, updated_at, author_id, category_id,
  author:profiles!author_id (${PROFILE_COLUMNS}),
  category:categories!category_id (id, title, created_at, updated_at)
`;

export const COMMENT_SELECT = `
  id, text, created_at, updated_at, author_id, post_id,
  author:profiles!author_id (${PROFILE_COLUMNS})
`;
