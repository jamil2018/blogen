"use server";

import { headers } from "next/headers";
import { requireUser } from "../lib/db/auth";
import {
  listAnalyticsRollups,
  summarizeRollups,
  trackAnalyticsEvent,
} from "../lib/db/analytics";
import type { AnalyticsEventName } from "../lib/posts/stage-d-contracts";
import { getMyPublicationRole } from "../lib/db/publications";
import { canPerformEditorialAction } from "../lib/posts/stage-c-contracts";

export async function recordAnalyticsEvent(input: {
  eventName: AnalyticsEventName;
  postId?: string;
  publicationId?: string;
  authorId?: string;
  sessionId?: string;
  path?: string;
}) {
  const { isAnonymousAllowedEvent } = await import("../lib/posts/stage-d-contracts");
  const { getCurrentUser } = await import("../lib/db/auth");
  const user = await getCurrentUser().catch(() => null);
  if (!user && !isAnonymousAllowedEvent(input.eventName)) {
    return null;
  }

  const h = await headers();
  return trackAnalyticsEvent({
    eventName: input.eventName,
    postId: input.postId,
    publicationId: input.publicationId,
    authorId: input.authorId,
    sessionId: input.sessionId,
    referrer: h.get("referer"),
    path: input.path ?? h.get("x-pathname"),
    userAgent: h.get("user-agent"),
  });
}

export async function getCreatorAnalyticsDashboard(input?: {
  publicationId?: string;
  days?: number;
}) {
  const { user } = await requireUser();
  const days = input?.days ?? 30;

  if (input?.publicationId) {
    const role = await getMyPublicationRole(input.publicationId, user.id);
    if (!canPerformEditorialAction(role, "manage_branding")) {
      throw new Error("Not allowed to view publication analytics");
    }
    const rows = await listAnalyticsRollups({
      scopeType: "publication",
      scopeId: input.publicationId,
      days,
    });
    return { rows, summary: summarizeRollups(rows), scope: "publication" as const };
  }

  const rows = await listAnalyticsRollups({
    scopeType: "author",
    scopeId: user.id,
    days,
  });
  return { rows, summary: summarizeRollups(rows), scope: "author" as const };
}
