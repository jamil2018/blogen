/**
 * Pure helpers for Stage B contracts (follows, scheduling, portability).
 */

export type FollowTargetType = "author" | "category" | "publication";

/** @deprecated Prefer isFollowableInStageC — publications are live in Stage C */
export function isFollowableInStageB(targetType: FollowTargetType): boolean {
  return (
    targetType === "author" ||
    targetType === "category" ||
    targetType === "publication"
  );
}

export function isFutureSchedule(iso: string, nowMs = Date.now()): boolean {
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t > nowMs;
}

export function classifyImportDuplicate(opts: {
  existingBySlug: boolean;
  existingByHash: boolean;
}): "skip-slug" | "skip-hash" | "map" {
  if (opts.existingBySlug) return "skip-slug";
  if (opts.existingByHash) return "skip-hash";
  return "map";
}

export function archivePreservesId(status: string): boolean {
  return status === "archived";
}
