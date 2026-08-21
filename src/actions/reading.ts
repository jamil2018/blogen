"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  clearReadingProgress,
  getReadingProgress,
  getUserPreferences,
  setReadingProgress,
  upsertUserPreferences,
  type UserPreferences,
} from "../lib/db/reading";
import {
  buildAccountDataExport,
  deleteAccountReaderData,
} from "../lib/db/portability";

export async function getMyPreferences() {
  const { user } = await requireUser();
  return getUserPreferences(user.id);
}

export async function updateMyPreferences(prefs: Partial<UserPreferences>) {
  const { user } = await requireUser();
  const updated = await upsertUserPreferences(user.id, prefs);
  revalidatePath("/user/profile");
  return updated;
}

export async function getPostReadingProgress(postId: string) {
  try {
    const { user } = await requireUser();
    const prefs = await getUserPreferences(user.id);
    if (!prefs.readingProgressEnabled) return null;
    return getReadingProgress(user.id, postId);
  } catch {
    return null;
  }
}

export async function savePostReadingProgress(postId: string, position: number) {
  const { user } = await requireUser();
  const prefs = await getUserPreferences(user.id);
  if (!prefs.readingProgressEnabled) return null;
  return setReadingProgress(user.id, postId, position);
}

export async function clearMyReadingProgress(postId?: string) {
  const { user } = await requireUser();
  await clearReadingProgress(user.id, postId);
  revalidatePath("/user/profile");
  return { ok: true };
}

export async function exportMyAccountData() {
  const { user } = await requireUser();
  return buildAccountDataExport(user.id);
}

export async function deleteMyReaderData() {
  const { user } = await requireUser();
  await deleteAccountReaderData(user.id);
  revalidatePath("/library");
  revalidatePath("/following");
  revalidatePath("/user/profile");
  return { ok: true };
}
