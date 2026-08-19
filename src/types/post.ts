import type { Category } from "./category";
import type { Comment } from "./comment";
import type { User } from "./user";

export type Post = {
  id: string;
  title: string;
  description: string;
  summary: string;
  imageURL?: string;
  imageFileName?: string;
  author: User | string;
  comments?: Comment[];
  tags: string[];
  category: Category | string;
  createdAt?: string;
  updatedAt?: string;
};

export type PaginatedPosts = {
  data: Post[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
};
