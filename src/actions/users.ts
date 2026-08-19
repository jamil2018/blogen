"use server";

import { revalidatePath } from "next/cache";
import { getProfileById, requireAdmin, requireUser } from "../lib/db/auth";
import { listCuratedUsers, listLatestUsers, listUsers } from "../lib/db/users";
import { createAdminClient } from "../lib/supabase/admin";
import { deleteStorageObject, uploadPublicFile } from "../lib/storage";
import { mapUser, PROFILE_COLUMNS, type ProfileRow } from "../lib/db/mappers";
import type { TablesUpdate } from "../lib/supabase/database.types";
import type { User } from "../types/user";

export type ProfileInput = {
  name?: string;
  email?: string;
  bio?: string;
  facebookId?: string;
  linkedinId?: string;
  twitterId?: string;
  isAdmin?: boolean;
  image?: File | null;
};

export async function getAllUsers() {
  return listUsers();
}

export async function getLatestUsers() {
  return listLatestUsers();
}

export async function getUserById(userId: string): Promise<User> {
  if (!userId) return {} as User;
  const user = await getProfileById(userId);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getCuratedUsers() {
  return listCuratedUsers();
}

async function applyProfileUpdates(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  actorId: string,
  targetId: string,
  input: ProfileInput,
  allowAdminFlag: boolean
) {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", targetId)
    .maybeSingle();

  if (existingError || !existing) throw new Error("User not found");

  const updates: TablesUpdate<"profiles"> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.email !== undefined) updates.email = input.email;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.facebookId !== undefined) updates.facebook_id = input.facebookId;
  if (input.linkedinId !== undefined) updates.linkedin_id = input.linkedinId;
  if (input.twitterId !== undefined) updates.twitter_id = input.twitterId;
  if (allowAdminFlag && input.isAdmin !== undefined) {
    updates.is_admin = input.isAdmin;
  }

  if (input.image) {
    const uploaded = await uploadPublicFile(
      supabase,
      "avatars",
      targetId,
      input.image
    );
    updates.avatar_url = uploaded.url;
    updates.avatar_path = uploaded.path;
    await deleteStorageObject(supabase, "avatars", existing.avatar_path);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", targetId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !data) throw new Error(error?.message ?? "User not found");
  void actorId;
  return mapUser(data as ProfileRow);
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const { supabase, user } = await requireUser();
  const updated = await applyProfileUpdates(
    supabase,
    user.id,
    user.id,
    input,
    false
  );
  revalidatePath("/", "layout");
  revalidatePath("/user/profile");
  revalidatePath("/admin/profile");
  return updated;
}

export async function updateUserById({
  userId,
  values,
}: {
  userId: string;
  values: ProfileInput;
}): Promise<User> {
  const { supabase, user } = await requireAdmin();
  const updated = await applyProfileUpdates(
    supabase,
    user.id,
    userId,
    values,
    true
  );
  revalidatePath("/admin/users");
  revalidatePath(`/authors/${userId}`);
  return updated;
}

export async function deleteUsersByIds(ids: string[]) {
  const { user } = await requireAdmin();
  const filtered = ids.filter((id) => id !== user.id);
  if (filtered.length === 0) {
    throw new Error("No users matched the query");
  }

  const { supabase } = await requireAdmin();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, avatar_path")
    .in("id", filtered);

  for (const profile of profiles ?? []) {
    await deleteStorageObject(supabase, "avatars", profile.avatar_path);
  }

  const admin = createAdminClient();
  for (const id of filtered) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/users");
  revalidatePath("/authors");
  return { message: "All users have been deleted" };
}
