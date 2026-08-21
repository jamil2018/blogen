"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  isPostSaved,
  listLibraryPosts,
  migrateLocalBookmarks,
  removeLibraryItem,
  saveLibraryItem,
} from "../lib/db/library";
import { logAppEvent } from "../lib/observability";

export async function getLibraryPosts() {
  const { user } = await requireUser();
  return listLibraryPosts(user.id);
}

export async function getIsPostSaved(postId: string) {
  try {
    const { user } = await requireUser();
    return isPostSaved(user.id, postId);
  } catch {
    return false;
  }
}

export async function toggleLibrarySave(postId: string) {
  const { user } = await requireUser();
  try {
    const saved = await isPostSaved(user.id, postId);
    if (saved) {
      await removeLibraryItem(user.id, postId);
    } else {
      await saveLibraryItem(user.id, postId);
    }
    revalidatePath("/library");
    revalidatePath(`/posts/${postId}`);
    return { saved: !saved };
  } catch (error) {
    logAppEvent("error", "library.toggle_failed", {
      postId,
      message: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }
}

export async function mergeLocalLibraryBookmarks(postIds: string[]) {
  const { user } = await requireUser();
  const result = await migrateLocalBookmarks(user.id, postIds);
  revalidatePath("/library");
  return result;
}
