import { createClient } from "../supabase/server";
import { isSupabaseConfigured } from "../supabase/env";
import {
  mapPublication,
  mapPublicationMember,
  mapPublicationSection,
  PUBLICATION_SELECT,
  type PublicationMemberRow,
  type PublicationRow,
  type PublicationSectionRow,
} from "./publication-mappers";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import type { Post } from "../../types/post";
import type {
  Publication,
  PublicationMember,
  PublicationMemberRole,
  PublicationSection,
} from "../../types/publication";
import {
  isValidPublicationSlug,
  slugifyPublicationName,
} from "../posts/stage-c-contracts";
import { PROFILE_COLUMNS, mapUser, type ProfileRow } from "./mappers";
import type { TablesUpdate } from "../supabase/database.types";

async function safeQuery<T>(fn: () => Promise<T | undefined>): Promise<T | undefined> {
  if (!isSupabaseConfigured()) return undefined;
  try {
    return await fn();
  } catch {
    return undefined;
  }
}

export async function getPublicationBySlug(
  slug: string
): Promise<Publication | null> {
  if (!slug) return null;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publications")
      .select(PUBLICATION_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPublication(data as PublicationRow) : null;
  });
  return result ?? null;
}

export async function getPublicationById(
  id: string
): Promise<Publication | null> {
  if (!id) return null;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publications")
      .select(PUBLICATION_SELECT)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPublication(data as PublicationRow) : null;
  });
  return result ?? null;
}

export async function listPublicationsForUser(
  userId: string
): Promise<Publication[]> {
  if (!userId) return [];
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data: memberships, error: memErr } = await supabase
      .from("publication_members")
      .select("publication_id")
      .eq("user_id", userId);
    if (memErr) throw memErr;
    const ids = (memberships ?? []).map((m) => m.publication_id as string);
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from("publications")
      .select(PUBLICATION_SELECT)
      .in("id", ids)
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => mapPublication(row as PublicationRow));
  });
  return result ?? [];
}

export async function createPublication(input: {
  ownerId: string;
  name: string;
  description?: string;
  slug?: string;
  tagline?: string;
}): Promise<Publication> {
  const name = input.name.trim();
  if (!name) throw new Error("Publication name is required");
  const slug = (input.slug?.trim() || slugifyPublicationName(name)).toLowerCase();
  if (!isValidPublicationSlug(slug)) {
    throw new Error("Invalid publication slug");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("publications")
    .insert({
      name,
      slug,
      description: input.description?.trim() ?? "",
      tagline: input.tagline?.trim() || null,
      owner_id: input.ownerId,
    })
    .select(PUBLICATION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create publication");
  }
  return mapPublication(data as PublicationRow);
}

export async function updatePublication(
  publicationId: string,
  updates: Partial<{
    name: string;
    description: string;
    tagline: string | null;
    about: string | null;
    accentColor: string | null;
    welcomeEmailSubject: string | null;
    welcomeEmailBody: string | null;
    welcomeEmailEnabled: boolean;
  }>
): Promise<Publication> {
  const supabase = await createClient();
  const payload: TablesUpdate<"publications"> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.description !== undefined)
    payload.description = updates.description.trim();
  if (updates.tagline !== undefined) payload.tagline = updates.tagline;
  if (updates.about !== undefined) payload.about = updates.about;
  if (updates.accentColor !== undefined)
    payload.accent_color = updates.accentColor;
  if (updates.welcomeEmailSubject !== undefined)
    payload.welcome_email_subject = updates.welcomeEmailSubject;
  if (updates.welcomeEmailBody !== undefined)
    payload.welcome_email_body = updates.welcomeEmailBody;
  if (updates.welcomeEmailEnabled !== undefined)
    payload.welcome_email_enabled = updates.welcomeEmailEnabled;

  const { data, error } = await supabase
    .from("publications")
    .update(payload)
    .eq("id", publicationId)
    .select(PUBLICATION_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not update publication");
  }
  return mapPublication(data as PublicationRow);
}

export async function listPublicationSections(
  publicationId: string
): Promise<PublicationSection[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publication_sections")
      .select(
        "id, publication_id, slug, name, description, sort_order, created_at, updated_at"
      )
      .eq("publication_id", publicationId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) =>
      mapPublicationSection(row as PublicationSectionRow)
    );
  });
  return result ?? [];
}

export async function upsertPublicationSection(input: {
  publicationId: string;
  slug: string;
  name: string;
  description?: string;
  sortOrder?: number;
  id?: string;
}): Promise<PublicationSection> {
  const slug = input.slug.trim().toLowerCase();
  if (!isValidPublicationSlug(slug)) throw new Error("Invalid section slug");
  const supabase = await createClient();
  const row = {
    publication_id: input.publicationId,
    slug,
    name: input.name.trim(),
    description: input.description?.trim() ?? "",
    sort_order: input.sortOrder ?? 0,
  };

  const query = input.id
    ? supabase
        .from("publication_sections")
        .update(row)
        .eq("id", input.id)
        .select(
          "id, publication_id, slug, name, description, sort_order, created_at, updated_at"
        )
        .single()
    : supabase
        .from("publication_sections")
        .insert(row)
        .select(
          "id, publication_id, slug, name, description, sort_order, created_at, updated_at"
        )
        .single();

  const { data, error } = await query;
  if (error || !data) {
    throw new Error(error?.message ?? "Could not save section");
  }
  return mapPublicationSection(data as PublicationSectionRow);
}

export async function listPublicationMembers(
  publicationId: string
): Promise<PublicationMember[]> {
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publication_members")
      .select("publication_id, user_id, role, created_at")
      .eq("publication_id", publicationId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    const rows = (data ?? []) as PublicationMemberRow[];
    const userIds = rows.map((r) => r.user_id);
    const profilesById = new Map<string, ProfileRow>();
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .in("id", userIds);
      for (const profile of profiles ?? []) {
        profilesById.set(profile.id, profile as ProfileRow);
      }
    }
    return rows.map((row) => {
      const user = profilesById.get(row.user_id);
      const mapped = mapPublicationMember(row);
      if (user) {
        const u = mapUser(user);
        mapped.userName = u.name;
        mapped.userEmail = u.email;
      }
      return mapped;
    });
  });
  return result ?? [];
}

export async function getMyPublicationRole(
  publicationId: string,
  userId: string
): Promise<PublicationMemberRole | null> {
  if (!publicationId || !userId) return null;
  const result = await safeQuery(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("publication_members")
      .select("role")
      .eq("publication_id", publicationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return (data?.role as PublicationMemberRole | undefined) ?? null;
  });
  return result ?? null;
}

export async function addPublicationMember(input: {
  publicationId: string;
  userId: string;
  role: PublicationMemberRole;
}): Promise<void> {
  if (input.role === "owner") {
    throw new Error("Use ownership transfer to set owner");
  }
  const supabase = await createClient();
  const { error } = await supabase.from("publication_members").upsert(
    {
      publication_id: input.publicationId,
      user_id: input.userId,
      role: input.role,
    },
    { onConflict: "publication_id,user_id" }
  );
  if (error) throw new Error(error.message);
}

export async function removePublicationMember(
  publicationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("publication_members")
    .select("role")
    .eq("publication_id", publicationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (member?.role === "owner") {
    throw new Error("Cannot remove the publication owner");
  }
  const { error } = await supabase
    .from("publication_members")
    .delete()
    .eq("publication_id", publicationId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function listPublicationPosts(
  publicationId: string,
  {
    page = 1,
    limit = 20,
    sectionId,
    includeEmailOnly = false,
  }: {
    page?: number;
    limit?: number;
    sectionId?: string;
    /** When false (public archive), hide email_only posts */
    includeEmailOnly?: boolean;
  } = {}
): Promise<{ data: Post[]; count: number; page: number; totalPages: number }> {
  const supabase = await createClient();
  const from = (Math.max(1, page) - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("posts")
    .select(POST_LIST_SELECT, { count: "exact" })
    .eq("publication_id", publicationId)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (sectionId) {
    query = query.eq("section_id", sectionId);
  }
  if (!includeEmailOnly) {
    query = query.neq("distribution_mode", "email_only");
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map((row) => mapPost(row as PostRow)),
    count: total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function listPublicationSubmissions(
  publicationId: string
): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("publication_id", publicationId)
    .not("submission_status", "is", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapPost(row as PostRow));
}
