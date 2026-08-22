"use server";

import { trackAnalyticsEvent } from "./analytics";
import type { Phase2AnalyticsEventName } from "../phase-2/contracts";
import { buildPhase2AnalyticsExtra } from "../phase-2/contracts";

/** Privacy-safe Phase 2 funnel events — never pass intent or note text. */
export async function trackPhase2Event(
  eventName: Phase2AnalyticsEventName,
  input: {
    collectionId?: string;
    postId?: string;
    pathId?: string;
    spaceId?: string;
    itemCount?: number;
    sourceCount?: number;
  } = {}
) {
  return trackAnalyticsEvent({
    eventName,
    postId: input.postId ?? null,
    extra: buildPhase2AnalyticsExtra(input),
  });
}
