import { createClient } from "../supabase/server";
import {
  mapNewsletter,
  type NewsletterRow,
} from "./publication-mappers";
import type {
  DistributionMode,
  Newsletter,
  NewsletterStatus,
} from "../../types/publication";
import {
  allowsEmailDistribution,
  allowsWebDistribution,
} from "../posts/stage-c-contracts";
import { assertPublicationPermission } from "./editorial";
import { listActiveSendableEmails } from "./subscriptions";
import {
  isResendConfigured,
  sendResendEmail,
} from "../email/resend";
import { getPublicationById } from "./publications";

export async function createNewsletterDraft(input: {
  userId: string;
  publicationId?: string;
  authorId?: string;
  postId?: string;
  subject: string;
  previewText?: string;
  htmlBody: string;
  distributionMode?: DistributionMode;
}): Promise<Newsletter> {
  if (!input.publicationId && !input.authorId) {
    throw new Error("publicationId or authorId is required");
  }
  if (input.publicationId) {
    await assertPublicationPermission(
      input.publicationId,
      input.userId,
      "send_newsletter"
    );
  }

  const mode = input.distributionMode ?? "web_and_email";
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      publication_id: input.publicationId ?? null,
      author_id: input.authorId ?? null,
      post_id: input.postId ?? null,
      subject: input.subject.trim(),
      preview_text: input.previewText?.trim() || null,
      html_body: input.htmlBody,
      distribution_mode: mode,
      status: "draft" satisfies NewsletterStatus,
      created_by: input.userId,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create newsletter");
  }
  return mapNewsletter(data as NewsletterRow);
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapNewsletter(data as NewsletterRow) : null;
}

export async function listNewslettersForPublication(
  publicationId: string
): Promise<Newsletter[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .select("*")
    .eq("publication_id", publicationId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapNewsletter(row as NewsletterRow));
}

export async function markNewsletterPreview(
  newsletterId: string,
  userId: string
): Promise<Newsletter> {
  const newsletter = await getNewsletter(newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");
  if (newsletter.publicationId) {
    await assertPublicationPermission(
      newsletter.publicationId,
      userId,
      "send_newsletter"
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .update({ status: "preview" })
    .eq("id", newsletterId)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Preview failed");
  return mapNewsletter(data as NewsletterRow);
}

export async function scheduleNewsletter(input: {
  newsletterId: string;
  userId: string;
  scheduledAt: string;
}): Promise<Newsletter> {
  const newsletter = await getNewsletter(input.newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");
  if (newsletter.publicationId) {
    await assertPublicationPermission(
      newsletter.publicationId,
      input.userId,
      "send_newsletter"
    );
  }
  const when = new Date(input.scheduledAt);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
    throw new Error("Schedule time must be in the future");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletters")
    .update({
      status: "scheduled",
      scheduled_at: when.toISOString(),
    })
    .eq("id", input.newsletterId)
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Schedule failed");
  return mapNewsletter(data as NewsletterRow);
}

/**
 * Send newsletter to active subscribers.
 * Requires Resend env — never reports success without a real API response.
 * Honors distribution_mode: email_only / web_and_email send email;
 * web_only skips email and only marks sent for audit (web archive is separate).
 */
export async function sendNewsletter(input: {
  newsletterId: string;
  userId: string;
}): Promise<{
  sent: number;
  failed: number;
  skippedEmail: boolean;
  messageIds: string[];
}> {
  const newsletter = await getNewsletter(input.newsletterId);
  if (!newsletter) throw new Error("Newsletter not found");
  if (newsletter.publicationId) {
    await assertPublicationPermission(
      newsletter.publicationId,
      input.userId,
      "send_newsletter"
    );
  }

  const wantsEmail = allowsEmailDistribution(newsletter.distributionMode);
  if (!wantsEmail) {
    const supabase = await createClient();
    await supabase
      .from("newsletters")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", input.newsletterId);
    return { sent: 0, failed: 0, skippedEmail: true, messageIds: [] };
  }

  if (!isResendConfigured()) {
    throw new Error(
      "Cannot send newsletter: RESEND_API_KEY / RESEND_FROM_EMAIL are not configured"
    );
  }

  const targetType = newsletter.publicationId ? "publication" : "author";
  const targetId = newsletter.publicationId ?? newsletter.authorId;
  if (!targetId) throw new Error("Newsletter has no target audience");

  const subscribers = await listActiveSendableEmails({
    targetType,
    targetId,
  });

  const supabase = await createClient();
  await supabase
    .from("newsletters")
    .update({ status: "sending" })
    .eq("id", input.newsletterId);

  let sent = 0;
  let failed = 0;
  const messageIds: string[] = [];

  for (const sub of subscribers) {
    try {
      const result = await sendResendEmail({
        to: sub.email,
        subject: newsletter.subject,
        html: newsletter.htmlBody,
        tags: [
          { name: "newsletter_id", value: newsletter.id },
          { name: "subscription_id", value: sub.id },
        ],
      });
      messageIds.push(result.id);
      await supabase.from("newsletter_deliveries").insert({
        newsletter_id: newsletter.id,
        subscription_id: sub.id,
        email: sub.email,
        resend_message_id: result.id,
        status: "sent",
        sent_at: new Date().toISOString(),
      });
      sent += 1;
    } catch (err) {
      failed += 1;
      await supabase.from("newsletter_deliveries").insert({
        newsletter_id: newsletter.id,
        subscription_id: sub.id,
        email: sub.email,
        status: "failed",
        error: err instanceof Error ? err.message : "send failed",
      });
    }
  }

  await supabase
    .from("newsletters")
    .update({
      status: failed && !sent ? "failed" : "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", input.newsletterId);

  return { sent, failed, skippedEmail: false, messageIds };
}

/** Ensure email_only content is not exposed on public web surfaces. */
export function assertModeAllowsWebArchive(mode: DistributionMode): boolean {
  return allowsWebDistribution(mode);
}

export async function buildNewsletterFromPost(input: {
  userId: string;
  postId: string;
  publicationId: string;
}): Promise<Newsletter> {
  const pub = await getPublicationById(input.publicationId);
  if (!pub) throw new Error("Publication not found");

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, summary, description, distribution_mode, publication_id")
    .eq("id", input.postId)
    .eq("publication_id", input.publicationId)
    .maybeSingle();
  if (error || !post) throw new Error(error?.message ?? "Post not found");

  const mode = (post.distribution_mode as DistributionMode) ?? "web_and_email";
  return createNewsletterDraft({
    userId: input.userId,
    publicationId: input.publicationId,
    postId: post.id,
    subject: post.title,
    previewText: post.summary,
    htmlBody: post.description,
    distributionMode: mode,
  });
}
