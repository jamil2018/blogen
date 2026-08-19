"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "../lib/supabase/server";
import { getCurrentUser } from "../lib/db/auth";
import { mapUser, PROFILE_COLUMNS, type ProfileRow } from "../lib/db/mappers";
import type { User } from "../types/user";

function authError(message: string, status = 400) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type SignUpResult =
  | { status: "authenticated"; user: User }
  | { status: "confirm_email"; email: string };

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name },
    },
  });

  if (error) throw authError(error.message, 400);
  if (!data.user) throw authError("Registration failed", 400);

  if (!data.session) {
    return { status: "confirm_email", email: input.email };
  }

  const user = await getCurrentUser();
  if (!user) throw authError("Registration failed", 400);
  revalidatePath("/", "layout");
  return { status: "authenticated", user };
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.message.toLowerCase().includes("confirm")
      ? "Confirm your email before signing in."
      : "Invalid email or password";
    throw authError(message, 401);
  }
  const user = await getCurrentUser();
  if (!user) throw authError("Invalid email or password", 401);
  revalidatePath("/", "layout");
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}

export async function getSessionUser(): Promise<User | null> {
  return getCurrentUser();
}

export async function fetchProfile(userId: string): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) throw new Error("User not found");
  return mapUser(data as ProfileRow);
}
