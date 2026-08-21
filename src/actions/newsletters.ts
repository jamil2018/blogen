"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  buildNewsletterFromPost,
  createNewsletterDraft,
  listNewslettersForPublication,
  markNewsletterPreview,
  scheduleNewsletter,
  sendNewsletter,
} from "../lib/db/newsletters";
import { getMyPublicationRole } from "../lib/db/publications";
import { canPerformEditorialAction } from "../lib/posts/stage-c-contracts";
import type { DistributionMode } from "../types/publication";
import { logAppEvent } from "../lib/observability";
import { isResendConfigured } from "../lib/email/resend";

export async function getPublicationNewsletters(publicationId: string) {
  const { user } = await requireUser();
  const role = await getMyPublicationRole(publicationId, user.id);
  if (!canPerformEditorialAction(role, "send_newsletter")) {
    throw new Error("Not allowed");
  }
  return listNewslettersForPublication(publicationId);
}

export async function createNewsletter(formData: FormData) {
  const { user } = await requireUser();
  const publicationId = String(formData.get("publicationId") ?? "") || undefined;
  const newsletter = await createNewsletterDraft({
    userId: user.id,
    publicationId,
    authorId: publicationId ? undefined : user.id,
    postId: String(formData.get("postId") ?? "") || undefined,
    subject: String(formData.get("subject") ?? ""),
    previewText: String(formData.get("previewText") ?? "") || undefined,
    htmlBody: String(formData.get("htmlBody") ?? ""),
    distributionMode: (String(formData.get("distributionMode") ?? "web_and_email") ||
      "web_and_email") as DistributionMode,
  });
  revalidatePath("/user/publications");
  return newsletter;
}

export async function createNewsletterFromPost(
  publicationId: string,
  postId: string
) {
  const { user } = await requireUser();
  const newsletter = await buildNewsletterFromPost({
    userId: user.id,
    publicationId,
    postId,
  });
  revalidatePath("/user/publications");
  return newsletter;
}

export async function previewNewsletter(newsletterId: string) {
  const { user } = await requireUser();
  return markNewsletterPreview(newsletterId, user.id);
}

export async function scheduleNewsletterSend(
  newsletterId: string,
  scheduledAt: string
) {
  const { user } = await requireUser();
  return scheduleNewsletter({
    newsletterId,
    userId: user.id,
    scheduledAt,
  });
}

export async function sendNewsletterNow(newsletterId: string) {
  const { user } = await requireUser();
  if (!isResendConfigured()) {
    throw new Error(
      "Resend is not provisioned. Set RESEND_API_KEY and RESEND_FROM_EMAIL before sending."
    );
  }
  try {
    const result = await sendNewsletter({
      newsletterId,
      userId: user.id,
    });
    revalidatePath("/user/publications");
    return result;
  } catch (error) {
    logAppEvent("error", "newsletter.send_failed", {
      newsletterId,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function getResendProvisionStatus() {
  return {
    configured: isResendConfigured(),
    hasApiKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    hasFromEmail: Boolean(process.env.RESEND_FROM_EMAIL?.trim()),
    hasWebhookSecret: Boolean(process.env.RESEND_WEBHOOK_SECRET?.trim()),
  };
}
