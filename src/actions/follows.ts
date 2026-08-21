"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  followTarget,
  isFollowing,
  listFollows,
  listFollowingFeed,
  unfollowTarget,
  type FollowTargetType,
} from "../lib/db/follows";
import { logAppEvent } from "../lib/observability";

export async function getMyFollows() {
  const { user } = await requireUser();
  return listFollows(user.id);
}

export async function getIsFollowing(
  targetType: FollowTargetType,
  targetId: string
) {
  try {
    const { user } = await requireUser();
    return isFollowing(user.id, targetType, targetId);
  } catch {
    return false;
  }
}

export async function toggleFollow(
  targetType: FollowTargetType,
  targetId: string
) {
  const { user } = await requireUser();
  try {
    const following = await isFollowing(user.id, targetType, targetId);
    if (following) {
      await unfollowTarget(user.id, targetType, targetId);
    } else {
      await followTarget(user.id, targetType, targetId);
    }
    const { trackAnalyticsEvent } = await import("../lib/db/analytics");
    await trackAnalyticsEvent({
      eventName: following ? "unfollow" : "follow",
      authorId: targetType === "author" ? targetId : null,
      publicationId: targetType === "publication" ? targetId : null,
    });
    revalidatePath("/following");
    if (targetType === "author") revalidatePath(`/authors/${targetId}`);
    if (targetType === "category") {
      revalidatePath("/categories");
    }
    if (targetType === "publication") {
      revalidatePath("/pubs");
    }
    return { following: !following };
  } catch (error) {
    logAppEvent("error", "follow.toggle_failed", {
      targetType,
      targetId,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function getFollowingFeed(page = 1, limit = 20) {
  const { user } = await requireUser();
  return listFollowingFeed(user.id, { page, limit });
}
