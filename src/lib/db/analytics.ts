import { createHash } from "crypto";
import { createAdminClient } from "../supabase/admin";
import { getCurrentUser } from "./auth";
import {
  buildPrivacyPayload,
  type AnalyticsEventName,
} from "../posts/stage-d-contracts";
import { logAppEvent } from "../observability";
import type { Json } from "../supabase/database.types";

export type TrackAnalyticsInput = {
  eventName: AnalyticsEventName;
  postId?: string | null;
  publicationId?: string | null;
  authorId?: string | null;
  sessionId?: string | null;
  referrer?: string | null;
  path?: string | null;
  userAgent?: string | null;
  extra?: Record<string, string | number | boolean | null>;
};

function hashSession(sessionId: string | null | undefined): string | null {
  if (!sessionId?.trim()) return null;
  return createHash("sha256").update(sessionId.trim()).digest("hex").slice(0, 32);
}

/**
 * Insert a privacy-minimized analytics event and bump daily rollups (via trigger).
 */
export async function trackAnalyticsEvent(
  input: TrackAnalyticsInput
): Promise<{ id: string } | null> {
  const user = await getCurrentUser().catch(() => null);
  const actorId = user?.id ?? null;

  const payload = {
    ...buildPrivacyPayload({
      referrer: input.referrer,
      path: input.path,
      userAgent: input.userAgent,
    }),
    ...(input.extra ?? {}),
  };

  try {
    // Prefer service role so rollup triggers always run (RLS-safe server ingest).
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analytics_events")
      .insert({
        event_name: input.eventName,
        actor_user_id: actorId,
        session_hash: hashSession(input.sessionId),
        post_id: input.postId ?? null,
        publication_id: input.publicationId ?? null,
        author_id: input.authorId ?? null,
        payload: payload as Json,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id as string };
  } catch (error) {
    logAppEvent("warn", "analytics.track_failed", {
      eventName: input.eventName,
      message: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

export type DailyRollupRow = {
  day: string;
  scopeType: string;
  scopeId: string | null;
  views: number;
  readCompletes: number;
  follows: number;
  unfollows: number;
  subscribes: number;
  unsubscribes: number;
  checkoutStarts: number;
  checkoutCompletes: number;
  emailOpens: number;
  emailClicks: number;
};

export async function listAnalyticsRollups(input: {
  scopeType: "author" | "publication" | "post";
  scopeId: string;
  days?: number;
}): Promise<DailyRollupRow[]> {
  const { createClient } = await import("../supabase/server");
  const supabase = await createClient();
  const days = input.days ?? 30;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceDay = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("analytics_daily_rollups")
    .select("*")
    .eq("scope_type", input.scopeType)
    .eq("scope_id", input.scopeId)
    .gte("day", sinceDay)
    .order("day", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    day: row.day as string,
    scopeType: row.scope_type as string,
    scopeId: (row.scope_id as string | null) ?? null,
    views: row.views as number,
    readCompletes: row.read_completes as number,
    follows: row.follows as number,
    unfollows: row.unfollows as number,
    subscribes: row.subscribes as number,
    unsubscribes: row.unsubscribes as number,
    checkoutStarts: row.checkout_starts as number,
    checkoutCompletes: row.checkout_completes as number,
    emailOpens: row.email_opens as number,
    emailClicks: row.email_clicks as number,
  }));
}

export function summarizeRollups(rows: DailyRollupRow[]) {
  return rows.reduce(
    (acc, r) => {
      acc.views += r.views;
      acc.readCompletes += r.readCompletes;
      acc.follows += r.follows;
      acc.subscribes += r.subscribes;
      acc.checkoutCompletes += r.checkoutCompletes;
      acc.emailOpens += r.emailOpens;
      return acc;
    },
    {
      views: 0,
      readCompletes: 0,
      follows: 0,
      subscribes: 0,
      checkoutCompletes: 0,
      emailOpens: 0,
    }
  );
}
