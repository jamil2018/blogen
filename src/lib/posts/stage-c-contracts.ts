/**
 * Pure helpers for Stage C: publications, editorial permissions, distribution, audience.
 */

import type {
  DistributionMode,
  PublicationMemberRole,
  SubmissionStatus,
  SubscriptionStatus,
} from "../../types/publication";

export type FollowTargetType = "author" | "category" | "publication";

export function isFollowableInStageC(targetType: FollowTargetType): boolean {
  return (
    targetType === "author" ||
    targetType === "category" ||
    targetType === "publication"
  );
}

/** Role hierarchy: owner > editor > contributor */
const ROLE_RANK: Record<PublicationMemberRole, number> = {
  owner: 3,
  editor: 2,
  contributor: 1,
};

export function hasMinRole(
  role: PublicationMemberRole | null | undefined,
  min: PublicationMemberRole
): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export type EditorialAction =
  | "submit"
  | "request_changes"
  | "accept"
  | "reject"
  | "schedule"
  | "publish"
  | "manage_members"
  | "manage_branding"
  | "manage_audience"
  | "send_newsletter";

const ACTION_MIN_ROLE: Record<EditorialAction, PublicationMemberRole> = {
  submit: "contributor",
  request_changes: "editor",
  accept: "editor",
  reject: "editor",
  schedule: "editor",
  publish: "editor",
  manage_members: "editor",
  manage_branding: "editor",
  manage_audience: "editor",
  send_newsletter: "editor",
};

export function canPerformEditorialAction(
  role: PublicationMemberRole | null | undefined,
  action: EditorialAction
): boolean {
  return hasMinRole(role, ACTION_MIN_ROLE[action]);
}

/** Valid submission status transitions. */
const TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  submitted: ["changes_requested", "accepted", "rejected"],
  changes_requested: ["submitted", "rejected"],
  accepted: ["scheduled", "published", "rejected", "changes_requested"],
  rejected: ["submitted"],
  scheduled: ["published", "accepted", "rejected"],
  published: [],
};

export function canTransitionSubmission(
  from: SubmissionStatus | null | undefined,
  to: SubmissionStatus
): boolean {
  if (!from) return to === "submitted";
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function slugifyPublicationName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function isValidPublicationSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 64;
}

/**
 * Whether content may appear on the public web for a given distribution mode.
 * email_only posts must not leak into public archives/feeds.
 */
export function allowsWebDistribution(mode: DistributionMode): boolean {
  return mode === "web_only" || mode === "web_and_email";
}

export function allowsEmailDistribution(mode: DistributionMode): boolean {
  return mode === "email_only" || mode === "web_and_email";
}

/** Active subscribers eligible for sends (not suppressed/unsubscribed). */
export function isSendableSubscriptionStatus(
  status: SubscriptionStatus
): boolean {
  return status === "active";
}

export type CsvImportRow = {
  email: string;
  status?: string;
};

export function parseSubscriberCsv(text: string): {
  rows: CsvImportRow[];
  errors: string[];
} {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { rows: [], errors: ["CSV is empty"] };

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("email");
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const rows: CsvImportRow[] = [];
  const errors: string[] = [];

  dataLines.forEach((line, i) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = cols[0]?.toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${i + 1}: invalid email`);
      return;
    }
    rows.push({ email, status: cols[1] });
  });

  return { rows, errors };
}

export function consentAttestationRequired(source: string): boolean {
  return source === "import";
}
