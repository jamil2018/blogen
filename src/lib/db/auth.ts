import type { User } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import { mapUser, PROFILE_COLUMNS, type ProfileRow } from "./mappers";
import type { User as AppUser } from "../../types/user";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("You must be signed in");
  }
  return { supabase, user: data.user };
}

export async function getProfileById(id: string): Promise<AppUser | undefined> {
  if (!id) return undefined;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapUser(data as ProfileRow);
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const profile = await getProfileById(data.user.id);
  if (profile) {
    return {
      ...profile,
      email: profile.email || data.user.email || "",
    };
  }
  return {
    id: data.user.id,
    name: (data.user.user_metadata?.name as string | undefined) ?? "",
    email: data.user.email ?? "",
    isAdmin: false,
  };
}

export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data?.is_admin) {
    throw new Error("Admin access required");
  }

  return { supabase, user };
}

export function authUserToStub(user: User): AppUser {
  return {
    id: user.id,
    name: (user.user_metadata?.name as string | undefined) ?? "",
    email: user.email ?? "",
    isAdmin: false,
  };
}
