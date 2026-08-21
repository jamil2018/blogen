import type { Category } from "../../types/category";
import type { Comment } from "../../types/comment";
import type {
  DistributionMode,
  Post,
  PostAccessLevel,
  PostStatus,
  SubmissionStatus,
} from "../../types/post";
import type { User } from "../../types/user";

export type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  facebook_id: string | null;
  linkedin_id: string | null;
  twitter_id: string | null;
  website_url?: string | null;
  expertise_topics?: string[] | null;
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
  status?: PostStatus | null;
  slug?: string | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  distribute_web?: boolean | null;
  distribute_followers?: boolean | null;
  distribute_email?: boolean | null;
  content_hash?: string | null;
  publication_id?: string | null;
  section_id?: string | null;
  submission_status?: SubmissionStatus | null;
  distribution_mode?: DistributionMode | null;
  access_level?: PostAccessLevel | null;
  required_tier_id?: string | null;
  preview_percent?: number | null;
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
    websiteUrl: row.website_url ?? undefined,
    expertiseTopics: row.expertise_topics ?? undefined,
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
    status: (row.status as PostStatus | undefined) ?? undefined,
    slug: row.slug ?? undefined,
    publishedAt: row.published_at ?? undefined,
    scheduledAt: row.scheduled_at ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    canonicalUrl: row.canonical_url ?? undefined,
    distributeWeb: row.distribute_web ?? undefined,
    distributeFollowers: row.distribute_followers ?? undefined,
    distributeEmail: row.distribute_email ?? undefined,
    contentHash: row.content_hash ?? undefined,
    publicationId: row.publication_id ?? undefined,
    sectionId: row.section_id ?? undefined,
    submissionStatus: row.submission_status ?? undefined,
    distributionMode: row.distribution_mode ?? undefined,
    accessLevel: row.access_level ?? undefined,
    requiredTierId: row.required_tier_id ?? undefined,
    previewPercent: row.preview_percent ?? undefined,
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
  "id, name, email, bio, facebook_id, linkedin_id, twitter_id, website_url, expertise_topics, avatar_url, avatar_path, is_admin, created_at, updated_at";

export const POST_LIST_SELECT = `
  id, title, description, summary, cover_url, cover_path, tags, status, slug, published_at, scheduled_at, seo_title, seo_description, canonical_url, distribute_web, distribute_followers, distribute_email, content_hash, publication_id, section_id, submission_status, distribution_mode, access_level, required_tier_id, preview_percent, created_at, updated_at, author_id, category_id,
  author:profiles!author_id (${PROFILE_COLUMNS}),
  category:categories!category_id (id, title, created_at, updated_at)
`;

export const COMMENT_SELECT = `
  id, text, created_at, updated_at, author_id, post_id,
  author:profiles!author_id (${PROFILE_COLUMNS})
`;
