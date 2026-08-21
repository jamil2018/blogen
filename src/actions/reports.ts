"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "../lib/db/auth";
import { createClient } from "../lib/supabase/server";
import type { Enums, TablesUpdate } from "../lib/supabase/database.types";

export async function createReport(input: {
  targetType: Enums<"report_target_type">;
  targetId: string;
  reason: string;
  details?: string;
}) {
  const { user } = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: input.details ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/moderation");
  return { ok: true };
}

export async function listOpenReports() {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateReportStatus(
  reportId: string,
  status: Enums<"report_status">,
  notes?: string
) {
  const { user } = await requireAdmin();
  const supabase = await createClient();
  const updates: TablesUpdate<"reports"> = { status };
  const { error } = await supabase
    .from("reports")
    .update(updates)
    .eq("id", reportId);
  if (error) throw new Error(error.message);

  await supabase.from("moderation_audit_log").insert({
    actor_id: user.id,
    report_id: reportId,
    action: `status:${status}`,
    notes: notes ?? null,
  });

  revalidatePath("/admin/moderation");
  return { ok: true };
}
