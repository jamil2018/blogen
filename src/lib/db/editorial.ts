import { createClient } from "../supabase/server";
import {
  canPerformEditorialAction,
  canTransitionSubmission,
  type EditorialAction,
} from "../posts/stage-c-contracts";
import type { Json, TablesUpdate } from "../supabase/database.types";
import type {
  PublicationMemberRole,
  SubmissionStatus,
} from "../../types/publication";
import { getMyPublicationRole } from "./publications";

export async function assertPublicationPermission(
  publicationId: string,
  userId: string,
  action: EditorialAction
): Promise<PublicationMemberRole> {
  const role = await getMyPublicationRole(publicationId, userId);
  if (!canPerformEditorialAction(role, action)) {
    throw new Error(`Not allowed to ${action} for this publication`);
  }
  return role!;
}

export async function writePublicationAudit(input: {
  publicationId: string;
  actorId: string;
  postId?: string;
  action: string;
  fromStatus?: SubmissionStatus | null;
  toStatus?: SubmissionStatus | null;
  notes?: string;
  metadata?: Json;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("publication_audit_log").insert({
    publication_id: input.publicationId,
    actor_id: input.actorId,
    post_id: input.postId ?? null,
    action: input.action,
    from_status: input.fromStatus ?? null,
    to_status: input.toStatus ?? null,
    notes: input.notes ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) throw new Error(error.message);
}

export async function createNotification(input: {
  userId: string;
  kind: string;
  title: string;
  body?: string;
  linkPath?: string;
  publicationId?: string;
  postId?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body ?? "",
    link_path: input.linkPath ?? null,
    publication_id: input.publicationId ?? null,
    post_id: input.postId ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function transitionSubmission(input: {
  postId: string;
  publicationId: string;
  actorId: string;
  toStatus: SubmissionStatus;
  notes?: string;
  scheduledAt?: string | null;
}) {
  const actionMap: Partial<Record<SubmissionStatus, EditorialAction>> = {
    submitted: "submit",
    changes_requested: "request_changes",
    accepted: "accept",
    rejected: "reject",
    scheduled: "schedule",
    published: "publish",
  };
  const action = actionMap[input.toStatus];
  if (!action) throw new Error("Invalid submission status");

  await assertPublicationPermission(input.publicationId, input.actorId, action);

  const supabase = await createClient();
  const { data: post, error: fetchErr } = await supabase
    .from("posts")
    .select("id, author_id, publication_id, submission_status, status, title")
    .eq("id", input.postId)
    .eq("publication_id", input.publicationId)
    .maybeSingle();

  if (fetchErr || !post) {
    throw new Error(fetchErr?.message ?? "Post not found in publication");
  }

  const fromStatus = post.submission_status as SubmissionStatus | null;
  if (!canTransitionSubmission(fromStatus, input.toStatus)) {
    throw new Error(
      `Cannot transition from ${fromStatus ?? "none"} to ${input.toStatus}`
    );
  }

  // Contributors may only submit their own posts
  if (input.toStatus === "submitted") {
    const role = await getMyPublicationRole(input.publicationId, input.actorId);
    if (role === "contributor" && post.author_id !== input.actorId) {
      throw new Error("Contributors may only submit their own posts");
    }
  }

  const updates: TablesUpdate<"posts"> = {
    submission_status: input.toStatus,
  };

  if (input.toStatus === "scheduled") {
    if (!input.scheduledAt) {
      throw new Error("scheduledAt is required");
    }
    const when = new Date(input.scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new Error("Schedule time must be in the future");
    }
    updates.status = "scheduled";
    updates.scheduled_at = when.toISOString();
    updates.published_at = null;
  }

  if (input.toStatus === "published") {
    updates.status = "published";
    updates.published_at = new Date().toISOString();
    updates.scheduled_at = null;
  }

  if (input.toStatus === "rejected") {
    updates.status = "draft";
    updates.scheduled_at = null;
  }

  const { error: updateErr } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", input.postId);
  if (updateErr) throw new Error(updateErr.message);

  await writePublicationAudit({
    publicationId: input.publicationId,
    actorId: input.actorId,
    postId: input.postId,
    action: `submission.${input.toStatus}`,
    fromStatus,
    toStatus: input.toStatus,
    notes: input.notes,
  });

  // Notify author (and editors on submit)
  if (post.author_id && post.author_id !== input.actorId) {
    await createNotification({
      userId: post.author_id,
      kind: `submission.${input.toStatus}`,
      title: `Submission ${input.toStatus.replace(/_/g, " ")}`,
      body: input.notes || `"${post.title}" is now ${input.toStatus}.`,
      linkPath: `/user/publications`,
      publicationId: input.publicationId,
      postId: input.postId,
    });
  }

  if (input.toStatus === "submitted") {
    const { data: editors } = await supabase
      .from("publication_members")
      .select("user_id")
      .eq("publication_id", input.publicationId)
      .in("role", ["owner", "editor"]);
    for (const editor of editors ?? []) {
      if (editor.user_id === input.actorId) continue;
      await createNotification({
        userId: editor.user_id,
        kind: "submission.submitted",
        title: "New submission",
        body: `"${post.title}" was submitted for review.`,
        linkPath: `/user/publications`,
        publicationId: input.publicationId,
        postId: input.postId,
      });
    }
  }

  return { fromStatus, toStatus: input.toStatus };
}
