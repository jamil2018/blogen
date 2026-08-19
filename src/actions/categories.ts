"use server";

import { revalidatePath } from "next/cache";
import {
  getCategoryById as getCategoryByIdQuery,
  getCategoryCount as getCategoryCountQuery,
  listCategories,
  listCuratedCategories,
} from "../lib/db/categories";
import { requireAdmin } from "../lib/db/auth";
import { mapCategory, type CategoryRow } from "../lib/db/mappers";

export async function getAllCategories() {
  return listCategories();
}

export async function getCategoryById(id: string) {
  const category = await getCategoryByIdQuery(id);
  if (!category) throw new Error("Invalid category id");
  return category;
}

export async function getCategoryCount() {
  await requireAdmin();
  return getCategoryCountQuery();
}

export async function getCuratedCategories() {
  await requireAdmin();
  return listCuratedCategories();
}

export async function createCategory(categoryData: { title: string }) {
  const { supabase } = await requireAdmin();
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("title", categoryData.title)
    .maybeSingle();
  if (existing) throw new Error("Category already exists");

  const { data, error } = await supabase
    .from("categories")
    .insert({ title: categoryData.title })
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Invalid category data");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return mapCategory(data as CategoryRow);
}

export async function updateCategory(id: string, values: { title: string }) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("categories")
    .update({ title: values.title })
    .eq("id", id)
    .select("id, title, created_at, updated_at")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Category not found");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return mapCategory(data as CategoryRow);
}

export async function deleteCategory(id: string) {
  return deleteCategoriesByIds([id]);
}

export async function deleteCategoriesByIds(ids: string[]) {
  const { supabase } = await requireAdmin();
  const { error, count } = await supabase
    .from("categories")
    .delete({ count: "exact" })
    .in("id", ids);

  if (error) throw new Error(error.message);
  if (!count) throw new Error("No categories matched the query");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return { message: "All categories have been deleted" };
}
