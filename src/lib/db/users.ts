import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { User } from "../../types/user";
import { mapUser, PROFILE_COLUMNS, type ProfileRow } from "./mappers";

export async function listUsers(): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ProfileRow[]).map(mapUser);
  } catch {
    return [];
  }
}

export async function listLatestUsers(limit = 9): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("is_admin", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as ProfileRow[]).map(mapUser);
  } catch {
    return [];
  }
}

export async function listCuratedUsers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    email: (row.email as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}
