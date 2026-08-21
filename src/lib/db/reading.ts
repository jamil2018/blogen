import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";

export type UserPreferences = {
  readingProgressEnabled: boolean;
  notifyEmail: boolean;
};

const DEFAULT_PREFS: UserPreferences = {
  readingProgressEnabled: true,
  notifyEmail: true,
};

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  if (!userId) return DEFAULT_PREFS;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("user_preferences")
      .select("reading_progress_enabled, notify_email")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return DEFAULT_PREFS;
    return {
      readingProgressEnabled: data.reading_progress_enabled,
      notifyEmail: data.notify_email,
    };
  });
  return result ?? DEFAULT_PREFS;
}

export async function upsertUserPreferences(
  userId: string,
  prefs: Partial<UserPreferences>
) {
  const supabase = await createClient();
  const current = await getUserPreferences(userId);
  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: userId,
      reading_progress_enabled:
        prefs.readingProgressEnabled ?? current.readingProgressEnabled,
      notify_email: prefs.notifyEmail ?? current.notifyEmail,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
  return getUserPreferences(userId);
}

export async function getReadingProgress(
  userId: string,
  postId: string
): Promise<number | null> {
  if (!userId || !postId) return null;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reading_progress")
      .select("position")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();
    if (error) throw error;
    return data ? Number(data.position) : null;
  });
  return result ?? null;
}

export async function setReadingProgress(
  userId: string,
  postId: string,
  position: number
) {
  const clamped = Math.min(100, Math.max(0, position));
  const supabase = await createClient();
  const { error } = await supabase.from("reading_progress").upsert(
    {
      user_id: userId,
      post_id: postId,
      position: clamped,
    },
    { onConflict: "user_id,post_id" }
  );
  if (error) throw new Error(error.message);
  return clamped;
}

export async function clearReadingProgress(userId: string, postId?: string) {
  const supabase = await createClient();
  let query = supabase.from("reading_progress").delete().eq("user_id", userId);
  if (postId) query = query.eq("post_id", postId);
  const { error } = await query;
  if (error) throw new Error(error.message);
}
