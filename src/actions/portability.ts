"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "../lib/db/auth";
import {
  buildAuthorExportZip,
  importAuthorContent,
  type ImportReport,
} from "../lib/db/portability";

export async function exportMyPostsZip(): Promise<{
  base64: string;
  filename: string;
}> {
  const { user } = await requireUser();
  const blob = await buildAuthorExportZip(user.id);
  const buffer = Buffer.from(await blob.arrayBuffer());
  return {
    base64: buffer.toString("base64"),
    filename: `blogen-export-${user.id.slice(0, 8)}.zip`,
  };
}

export async function importMyPostsZip(
  formData: FormData
): Promise<ImportReport> {
  const { user, supabase } = await requireUser();
  const file = formData.get("file");
  const categoryId = String(formData.get("categoryId") ?? "");

  if (!(file instanceof File) || !file.size) {
    throw new Error("Zip file is required");
  }
  if (!categoryId) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .order("title", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!cat) throw new Error("No category available for import");
    const buffer = await file.arrayBuffer();
    const report = await importAuthorContent(user.id, cat.id, buffer);
    revalidatePath("/user/posts");
    return report;
  }

  const buffer = await file.arrayBuffer();
  const report = await importAuthorContent(user.id, categoryId, buffer);
  revalidatePath("/user/posts");
  return report;
}
