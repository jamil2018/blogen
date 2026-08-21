import type {
  DistributionMode,
  Newsletter,
  NewsletterStatus,
  Publication,
  PublicationMember,
  PublicationMemberRole,
  PublicationSection,
  SubmissionStatus,
  Subscription,
  SubscriptionSource,
  SubscriptionStatus,
  SubscriptionTargetType,
} from "../../types/publication";
import { mapUser, type ProfileRow } from "./mappers";

export type PublicationRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline: string | null;
  about: string | null;
  logo_url: string | null;
  logo_path: string | null;
  cover_url: string | null;
  cover_path: string | null;
  accent_color: string | null;
  owner_id: string;
  welcome_email_subject: string | null;
  welcome_email_body: string | null;
  welcome_email_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PublicationSectionRow = {
  id: string;
  publication_id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PublicationMemberRow = {
  publication_id: string;
  user_id: string;
  role: PublicationMemberRole;
  created_at: string | null;
  user?: ProfileRow | ProfileRow[] | null;
};

export type SubscriptionRow = {
  id: string;
  target_type: SubscriptionTargetType;
  target_id: string;
  email: string;
  user_id: string | null;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  consent_at: string | null;
  consent_attestation: string | null;
  unsubscribed_at: string | null;
  confirmed_at: string | null;
  welcome_sent_at: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type NewsletterRow = {
  id: string;
  publication_id: string | null;
  author_id: string | null;
  post_id: string | null;
  subject: string;
  preview_text: string | null;
  html_body: string;
  distribution_mode: DistributionMode;
  status: NewsletterStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

function one<T>(value: T | T[] | null | undefined): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export function mapPublication(row: PublicationRow): Publication {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    tagline: row.tagline ?? undefined,
    about: row.about ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    accentColor: row.accent_color ?? undefined,
    ownerId: row.owner_id,
    welcomeEmailSubject: row.welcome_email_subject ?? undefined,
    welcomeEmailBody: row.welcome_email_body ?? undefined,
    welcomeEmailEnabled: row.welcome_email_enabled ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

export function mapPublicationSection(
  row: PublicationSectionRow
): PublicationSection {
  return {
    id: row.id,
    publicationId: row.publication_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

export function mapPublicationMember(
  row: PublicationMemberRow
): PublicationMember {
  const user = one(row.user);
  return {
    publicationId: row.publication_id,
    userId: row.user_id,
    role: row.role,
    createdAt: row.created_at ?? undefined,
    userName: user ? mapUser(user).name : undefined,
    userEmail: user ? mapUser(user).email : undefined,
  };
}

export function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    email: row.email,
    userId: row.user_id ?? undefined,
    status: row.status,
    source: row.source,
    consentAt: row.consent_at ?? undefined,
    consentAttestation: row.consent_attestation ?? undefined,
    unsubscribedAt: row.unsubscribed_at ?? undefined,
    confirmedAt: row.confirmed_at ?? undefined,
    welcomeSentAt: row.welcome_sent_at ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export function mapNewsletter(row: NewsletterRow): Newsletter {
  return {
    id: row.id,
    publicationId: row.publication_id ?? undefined,
    authorId: row.author_id ?? undefined,
    postId: row.post_id ?? undefined,
    subject: row.subject,
    previewText: row.preview_text ?? undefined,
    htmlBody: row.html_body,
    distributionMode: row.distribution_mode,
    status: row.status,
    scheduledAt: row.scheduled_at ?? undefined,
    sentAt: row.sent_at ?? undefined,
    createdAt: row.created_at ?? undefined,
  };
}

export const PUBLICATION_SELECT = `
  id, slug, name, description, tagline, about, logo_url, logo_path, cover_url, cover_path,
  accent_color, owner_id, welcome_email_subject, welcome_email_body, welcome_email_enabled,
  created_at, updated_at
`;

export type { SubmissionStatus };
