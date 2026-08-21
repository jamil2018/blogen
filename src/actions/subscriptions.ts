"use server";

import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "../lib/db/auth";
import {
  exportSubscribersCsv,
  importSubscribersCsv,
  listSubscriptions,
  maybeSendWelcomeEmail,
  subscribeEmail,
  unsubscribeEmail,
} from "../lib/db/subscriptions";
import { getPublicationById } from "../lib/db/publications";
import { canPerformEditorialAction } from "../lib/posts/stage-c-contracts";
import { getMyPublicationRole } from "../lib/db/publications";
import type {
  SubscriptionStatus,
  SubscriptionTargetType,
} from "../types/publication";
import { logAppEvent } from "../lib/observability";
import { isResendConfigured } from "../lib/email/resend";

export async function subscribeToTarget(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  email: string;
}) {
  const user = await getCurrentUser();
  try {
    const sub = await subscribeEmail({
      targetType: input.targetType,
      targetId: input.targetId,
      email: input.email,
      userId: user?.id,
      source: "web",
    });

    const { trackAnalyticsEvent } = await import("../lib/db/analytics");
    await trackAnalyticsEvent({
      eventName: "subscribe",
      authorId: input.targetType === "author" ? input.targetId : null,
      publicationId:
        input.targetType === "publication" ? input.targetId : null,
    });

    if (input.targetType === "publication") {
      const pub = await getPublicationById(input.targetId);
      if (pub?.welcomeEmailEnabled && pub.welcomeEmailSubject && pub.welcomeEmailBody) {
        if (!isResendConfigured()) {
          logAppEvent("warn", "subscription.welcome_skipped_no_resend", {
            publicationId: pub.id,
          });
        } else {
          await maybeSendWelcomeEmail({
            subscription: sub,
            subject: pub.welcomeEmailSubject,
            htmlBody: pub.welcomeEmailBody,
          });
        }
      }
      revalidatePath(`/pubs/${pub?.slug ?? ""}`);
    }

    return sub;
  } catch (error) {
    logAppEvent("error", "subscription.subscribe_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function unsubscribeFromTarget(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  email: string;
}) {
  await unsubscribeEmail(input);
}

export async function getAudienceDashboard(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
  status?: SubscriptionStatus;
  q?: string;
  page?: number;
}) {
  const { user } = await requireUser();
  if (input.targetType === "publication") {
    const role = await getMyPublicationRole(input.targetId, user.id);
    if (!canPerformEditorialAction(role, "manage_audience")) {
      throw new Error("Not allowed to view audience");
    }
  } else if (input.targetId !== user.id) {
    throw new Error("Not allowed to view audience");
  }
  return listSubscriptions(input);
}

export async function importAudienceCsv(formData: FormData) {
  const { user } = await requireUser();
  const targetType = String(formData.get("targetType") ?? "") as SubscriptionTargetType;
  const targetId = String(formData.get("targetId") ?? "");
  const consentAttestation = String(formData.get("consentAttestation") ?? "");
  const csvText = String(formData.get("csvText") ?? "");

  if (targetType === "publication") {
    const role = await getMyPublicationRole(targetId, user.id);
    if (!canPerformEditorialAction(role, "manage_audience")) {
      throw new Error("Not allowed to import audience");
    }
  } else if (targetId !== user.id) {
    throw new Error("Not allowed to import audience");
  }

  const result = await importSubscribersCsv({
    targetType,
    targetId,
    csvText,
    consentAttestation,
  });
  revalidatePath("/user/publications");
  return result;
}

export async function exportAudienceCsv(input: {
  targetType: SubscriptionTargetType;
  targetId: string;
}) {
  const { user } = await requireUser();
  if (input.targetType === "publication") {
    const role = await getMyPublicationRole(input.targetId, user.id);
    if (!canPerformEditorialAction(role, "manage_audience")) {
      throw new Error("Not allowed to export audience");
    }
  } else if (input.targetId !== user.id) {
    throw new Error("Not allowed to export audience");
  }

  const { data } = await listSubscriptions({
    ...input,
    limit: 5000,
  });
  return {
    filename: `subscribers-${input.targetId.slice(0, 8)}.csv`,
    csv: exportSubscribersCsv(data),
  };
}
