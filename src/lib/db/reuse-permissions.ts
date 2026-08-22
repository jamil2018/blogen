import type { TablesUpdate } from "../supabase/database.types";
import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import type { PostReusePermissions, ReuseAction } from "../phase-2/contracts";
import { DEFAULT_REUSE_PERMISSIONS, reuseDenialReason } from "../phase-2/contracts";

export async function getPostReusePermissions(
  postId: string
): Promise<PostReusePermissions> {
  if (!isSupabaseConfigured()) return DEFAULT_REUSE_PERMISSIONS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "reuse_private_spaces, reuse_public_lineage, reuse_quotation, reuse_synthesis"
    )
    .eq("id", postId)
    .maybeSingle();

  if (!data) return DEFAULT_REUSE_PERMISSIONS;

  return {
    privateSpaces: data.reuse_private_spaces ?? true,
    publicLineage: data.reuse_public_lineage ?? true,
    quotation: data.reuse_quotation ?? true,
    synthesis: data.reuse_synthesis ?? false,
  };
}

export async function updatePostReusePermissions(
  userId: string,
  postId: string,
  permissions: Partial<PostReusePermissions>
) {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.author_id !== userId) {
    throw new Error("Only the author can update reuse permissions.");
  }

  const updates: TablesUpdate<"posts"> = {};
  if (permissions.privateSpaces !== undefined) {
    updates.reuse_private_spaces = permissions.privateSpaces;
  }
  if (permissions.publicLineage !== undefined) {
    updates.reuse_public_lineage = permissions.publicLineage;
  }
  if (permissions.quotation !== undefined) {
    updates.reuse_quotation = permissions.quotation;
  }
  if (permissions.synthesis !== undefined) {
    updates.reuse_synthesis = permissions.synthesis;
  }

  const { error } = await supabase.from("posts").update(updates).eq("id", postId);
  if (error) throw new Error(error.message);
}

export async function assertReuseAllowed(postId: string, action: ReuseAction) {
  const permissions = await getPostReusePermissions(postId);
  const reason = reuseDenialReason(permissions, action);
  if (reason) {
    const error = new Error(reason);
    (error as Error & { code: string }).code = "REUSE_DENIED";
    throw error;
  }
}
