"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  addPublicationMember,
  createPublication,
  getMyPublicationRole,
  getPublicationById,
  getPublicationBySlug,
  listPublicationMembers,
  listPublicationPosts,
  listPublicationSections,
  listPublicationSubmissions,
  listPublicationsForUser,
  removePublicationMember,
  updatePublication,
  upsertPublicationSection,
} from "../lib/db/publications";
import { transitionSubmission } from "../lib/db/editorial";
import type {
  PublicationMemberRole,
  SubmissionStatus,
} from "../types/publication";
import { logAppEvent } from "../lib/observability";
import { canPerformEditorialAction } from "../lib/posts/stage-c-contracts";

export async function getPublication(slug: string) {
  return getPublicationBySlug(slug);
}

export async function getMyPublications() {
  const { user } = await requireUser();
  return listPublicationsForUser(user.id);
}

export async function createMyPublication(formData: FormData) {
  const { user } = await requireUser();
  try {
    const pub = await createPublication({
      ownerId: user.id,
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      slug: String(formData.get("slug") ?? "") || undefined,
      tagline: String(formData.get("tagline") ?? "") || undefined,
    });
    revalidatePath("/user/publications");
    revalidatePath(`/pubs/${pub.slug}`);
    return pub;
  } catch (error) {
    logAppEvent("error", "publication.create_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function updateMyPublication(
  publicationId: string,
  formData: FormData
) {
  const { user } = await requireUser();
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!canPerformEditorialAction(role, "manage_branding")) {
    throw new Error("Not allowed to update this publication");
  }

  const welcomeEnabledRaw = formData.get("welcomeEmailEnabled");
  const pub = await updatePublication(publicationId, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    tagline: String(formData.get("tagline") ?? "") || null,
    about: String(formData.get("about") ?? "") || null,
    accentColor: String(formData.get("accentColor") ?? "") || null,
    welcomeEmailSubject:
      String(formData.get("welcomeEmailSubject") ?? "") || null,
    welcomeEmailBody: String(formData.get("welcomeEmailBody") ?? "") || null,
    welcomeEmailEnabled:
      welcomeEnabledRaw === "true" || welcomeEnabledRaw === "on",
  });
  revalidatePath("/user/publications");
  revalidatePath(`/pubs/${pub.slug}`);
  return pub;
}

export async function getPublicationArchive(
  slug: string,
  page = 1,
  sectionSlug?: string
) {
  const pub = await getPublicationBySlug(slug);
  if (!pub) return null;
  const sections = await listPublicationSections(pub.id);
  const section = sectionSlug
    ? sections.find((s) => s.slug === sectionSlug)
    : undefined;
  const posts = await listPublicationPosts(pub.id, {
    page,
    sectionId: section?.id,
    includeEmailOnly: false,
  });
  return { publication: pub, sections, section, posts };
}

export async function getStudioPublication(publicationId: string) {
  const { user } = await requireUser();
  const pub = await getPublicationById(publicationId);
  if (!pub) throw new Error("Publication not found");
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!role) throw new Error("Not a member of this publication");
  const [members, sections, submissions] = await Promise.all([
    listPublicationMembers(publicationId),
    listPublicationSections(publicationId),
    listPublicationSubmissions(publicationId),
  ]);
  return { publication: pub, role, members, sections, submissions };
}

export async function savePublicationSection(
  publicationId: string,
  formData: FormData
) {
  const { user } = await requireUser();
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!canPerformEditorialAction(role, "manage_branding")) {
    throw new Error("Not allowed");
  }
  const section = await upsertPublicationSection({
    publicationId,
    id: String(formData.get("id") ?? "") || undefined,
    slug: String(formData.get("slug") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  const pub = await getPublicationById(publicationId);
  revalidatePath("/user/publications");
  if (pub) revalidatePath(`/pubs/${pub.slug}`);
  return section;
}

export async function invitePublicationMember(
  publicationId: string,
  userId: string,
  memberRole: PublicationMemberRole
) {
  const { user } = await requireUser();
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!canPerformEditorialAction(role, "manage_members")) {
    throw new Error("Not allowed to manage members");
  }
  await addPublicationMember({
    publicationId,
    userId,
    role: memberRole,
  });
  revalidatePath("/user/publications");
}

export async function revokePublicationMember(
  publicationId: string,
  userId: string
) {
  const { user } = await requireUser();
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!canPerformEditorialAction(role, "manage_members")) {
    throw new Error("Not allowed to manage members");
  }
  await removePublicationMember(publicationId, userId);
  revalidatePath("/user/publications");
}

export async function reviewSubmission(
  publicationId: string,
  postId: string,
  toStatus: SubmissionStatus,
  notes?: string,
  scheduledAt?: string
) {
  const { user } = await requireUser();
  const result = await transitionSubmission({
    publicationId,
    postId,
    actorId: user.id,
    toStatus,
    notes,
    scheduledAt,
  });
  revalidatePath("/user/publications");
  revalidatePath("/user/posts");
  return result;
}
