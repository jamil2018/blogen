export type PublicationMemberRole = "owner" | "editor" | "contributor";

export type SubmissionStatus =
  | "submitted"
  | "changes_requested"
  | "accepted"
  | "rejected"
  | "scheduled"
  | "published";

export type DistributionMode = "web_only" | "email_only" | "web_and_email";

export type Publication = {
  id: string;
  slug: string;
  name: string;
  description: string;
  tagline?: string;
  about?: string;
  logoUrl?: string;
  coverUrl?: string;
  accentColor?: string;
  ownerId: string;
  welcomeEmailSubject?: string;
  welcomeEmailBody?: string;
  welcomeEmailEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicationSection = {
  id: string;
  publicationId: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type PublicationMember = {
  publicationId: string;
  userId: string;
  role: PublicationMemberRole;
  createdAt?: string;
  userName?: string;
  userEmail?: string;
};

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "unsubscribed"
  | "suppressed";

export type SubscriptionSource = "web" | "import" | "welcome" | "admin";

export type SubscriptionTargetType = "publication" | "author";

export type Subscription = {
  id: string;
  targetType: SubscriptionTargetType;
  targetId: string;
  email: string;
  userId?: string;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  consentAt?: string;
  consentAttestation?: string;
  unsubscribedAt?: string;
  confirmedAt?: string;
  welcomeSentAt?: string;
  createdAt?: string;
};

export type NewsletterStatus =
  | "draft"
  | "preview"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export type Newsletter = {
  id: string;
  publicationId?: string;
  authorId?: string;
  postId?: string;
  subject: string;
  previewText?: string;
  htmlBody: string;
  distributionMode: DistributionMode;
  status: NewsletterStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt?: string;
};
