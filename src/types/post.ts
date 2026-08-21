import type { Category } from "./category";
import type { Comment } from "./comment";
import type { User } from "./user";

export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export type SubmissionStatus =
  | "submitted"
  | "changes_requested"
  | "accepted"
  | "rejected"
  | "scheduled"
  | "published";

export type DistributionMode = "web_only" | "email_only" | "web_and_email";

export type PostAccessLevel = "public" | "members" | "paid";

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
  status?: PostStatus;
  slug?: string;
  publishedAt?: string;
  scheduledAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  distributeWeb?: boolean;
  distributeFollowers?: boolean;
  distributeEmail?: boolean;
  contentHash?: string;
  publicationId?: string;
  sectionId?: string;
  submissionStatus?: SubmissionStatus;
  distributionMode?: DistributionMode;
  accessLevel?: PostAccessLevel;
  requiredTierId?: string;
  previewPercent?: number;
  /** Present when paywall applied server-side */
  accessGranted?: boolean;
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

export type PostRevision = {
  id: string;
  postId: string;
  revisionNumber: number;
  title: string;
  summary: string;
  slug?: string;
  publishedAt: string;
  createdAt: string;
};
