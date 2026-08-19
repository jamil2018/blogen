import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { Category } from "../../types/category";
import { mapCategory, type CategoryRow } from "./mappers";

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, title, created_at, updated_at")
      .order("title", { ascending: true });
    if (error) throw error;
    return (data as CategoryRow[]).map(mapCategory);
  } catch {
    return [];
  }
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  if (!id || !isSupabaseConfigured()) return undefined;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, title, created_at, updated_at")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCategory(data as CategoryRow) : undefined;
  } catch {
    return undefined;
  }
}

export async function getCategoryCount() {
  if (!isSupabaseConfigured()) return { count: 0 };
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return { count: count ?? 0 };
}

export async function listCuratedCategories() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, title, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategory);
}
