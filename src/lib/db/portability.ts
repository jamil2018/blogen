import JSZip from "jszip";
import { createClient } from "../supabase/server";
import { mapPost, POST_LIST_SELECT, type PostRow } from "./mappers";
import { slugifyTitle } from "../posts/contracts";
import {
  contentHash,
  htmlToMarkdownish,
  markdownToHtml,
  parseFrontMatter,
} from "../posts/portability-format";
import type { TablesInsert } from "../supabase/database.types";

export type ImportReportItem = {
  path: string;
  status: "mapped" | "skipped" | "failed";
  reason?: string;
  postId?: string;
};

export type ImportReport = {
  mapped: ImportReportItem[];
  skipped: ImportReportItem[];
  failed: ImportReportItem[];
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function buildAuthorExportZip(authorId: string): Promise<Blob> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_LIST_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const posts = (data ?? []).map((row) => mapPost(row as PostRow));
  const zip = new JSZip();
  const metadata = {
    exportedAt: new Date().toISOString(),
    authorId,
    postCount: posts.length,
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      status: p.status,
      slug: p.slug,
      tags: p.tags,
      category:
        typeof p.category === "string" ? p.category : p.category?.id,
      publishedAt: p.publishedAt,
      scheduledAt: p.scheduledAt,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      canonicalUrl: p.canonicalUrl,
      contentHash: p.contentHash ?? contentHash(p),
      coverUrl: p.imageURL,
    })),
  };

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));
  const mdFolder = zip.folder("markdown");
  const htmlFolder = zip.folder("html");

  for (const post of posts) {
    const base = (post.slug || slugifyTitle(post.title, post.id)).replace(
      /[^a-z0-9-_]/gi,
      "-"
    );
    mdFolder?.file(
      `${base}.md`,
      `---\ntitle: ${JSON.stringify(post.title)}\nslug: ${post.slug ?? ""}\nstatus: ${post.status ?? "draft"}\n---\n\n${htmlToMarkdownish(post.description)}\n`
    );
    htmlFolder?.file(
      `${base}.html`,
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(post.title)}</title></head><body><h1>${escapeHtml(post.title)}</h1>${post.description}</body></html>`
    );
  }

  return zip.generateAsync({ type: "blob" });
}

type ParsedImport = {
  path: string;
  title: string;
  description: string;
  summary: string;
  slug?: string;
  tags: string[];
};

async function parseImportZip(buffer: ArrayBuffer): Promise<ParsedImport[]> {
  const zip = await JSZip.loadAsync(buffer);
  const items: ParsedImport[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const lower = path.toLowerCase();
    if (!lower.endsWith(".md") && !lower.endsWith(".html") && !lower.endsWith(".htm")) {
      continue;
    }
    const raw = await file.async("string");
    if (lower.endsWith(".md")) {
      const { meta, body } = parseFrontMatter(raw);
      const title =
        meta.title || path.split("/").pop()?.replace(/\.md$/i, "") || "Untitled";
      const description = markdownToHtml(body);
      items.push({
        path,
        title,
        description,
        summary: (
          meta.summary || body.replace(/[#>*`\[\]]/g, "").slice(0, 280)
        ).trim(),
        slug: meta.slug || undefined,
        tags: meta.tags
          ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });
    } else {
      const titleMatch = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title =
        titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() ||
        path.split("/").pop()?.replace(/\.html?$/i, "") ||
        "Untitled";
      const body = raw
        .replace(/<!DOCTYPE[\s\S]*?>/i, "")
        .replace(/<\/?html[^>]*>/gi, "")
        .replace(/<\/?head[\s\S]*?<\/head>/gi, "")
        .replace(/<\/?body[^>]*>/gi, "")
        .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "")
        .trim();
      items.push({
        path,
        title,
        description: body || `<p>${title}</p>`,
        summary: body.replace(/<[^>]+>/g, "").slice(0, 280).trim() || title,
        tags: [],
      });
    }
  }

  return items;
}

export async function importAuthorContent(
  authorId: string,
  categoryId: string,
  zipBuffer: ArrayBuffer
): Promise<ImportReport> {
  const items = await parseImportZip(zipBuffer);
  const report: ImportReport = { mapped: [], skipped: [], failed: [] };
  const supabase = await createClient();

  for (const item of items) {
    try {
      const hash = contentHash(item);
      const slug =
        item.slug?.trim() || slugifyTitle(item.title, crypto.randomUUID());

      if (item.slug) {
        const { data: bySlug } = await supabase
          .from("posts")
          .select("id")
          .eq("author_id", authorId)
          .eq("slug", item.slug)
          .maybeSingle();
        if (bySlug) {
          report.skipped.push({
            path: item.path,
            status: "skipped",
            reason: "Duplicate slug",
            postId: bySlug.id,
          });
          continue;
        }
      }

      const { data: byHash } = await supabase
        .from("posts")
        .select("id")
        .eq("author_id", authorId)
        .eq("content_hash", hash)
        .maybeSingle();
      if (byHash) {
        report.skipped.push({
          path: item.path,
          status: "skipped",
          reason: "Duplicate content hash",
          postId: byHash.id,
        });
        continue;
      }

      const insert: TablesInsert<"posts"> = {
        title: item.title,
        description: item.description,
        summary: item.summary.slice(0, 300) || item.title,
        category_id: categoryId,
        tags: item.tags,
        author_id: authorId,
        status: "draft",
        slug,
        content_hash: hash,
        distribute_web: true,
        distribute_followers: true,
        distribute_email: false,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(insert)
        .select("id")
        .single();

      if (error || !data) {
        report.failed.push({
          path: item.path,
          status: "failed",
          reason: error?.message ?? "Insert failed",
        });
        continue;
      }

      report.mapped.push({
        path: item.path,
        status: "mapped",
        postId: data.id,
      });
    } catch (err) {
      report.failed.push({
        path: item.path,
        status: "failed",
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return report;
}

export type AccountExportPayload = {
  exportedAt: string;
  profile: Record<string, unknown>;
  preferences: Record<string, unknown>;
  libraryPostIds: string[];
  follows: { targetType: string; targetId: string; createdAt: string }[];
  readingProgress: {
    postId: string;
    position: number;
    updatedAt: string;
  }[];
};

export async function buildAccountDataExport(
  userId: string
): Promise<AccountExportPayload> {
  const supabase = await createClient();

  const [
    { data: profile },
    { data: prefs },
    { data: library },
    { data: follows },
    { data: progress },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("library_items").select("post_id").eq("user_id", userId),
    supabase
      .from("follows")
      .select("target_type, target_id, created_at")
      .eq("follower_id", userId),
    supabase
      .from("reading_progress")
      .select("post_id, position, updated_at")
      .eq("user_id", userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: (profile as Record<string, unknown>) ?? {},
    preferences: (prefs as Record<string, unknown>) ?? {},
    libraryPostIds: (library ?? []).map((r) => r.post_id),
    follows: (follows ?? []).map((f) => ({
      targetType: f.target_type,
      targetId: f.target_id,
      createdAt: f.created_at,
    })),
    readingProgress: (progress ?? []).map((p) => ({
      postId: p.post_id,
      position: Number(p.position),
      updatedAt: p.updated_at,
    })),
  };
}

export async function deleteAccountReaderData(userId: string) {
  const supabase = await createClient();
  await Promise.all([
    supabase.from("library_items").delete().eq("user_id", userId),
    supabase.from("follows").delete().eq("follower_id", userId),
    supabase.from("reading_progress").delete().eq("user_id", userId),
    supabase.from("user_preferences").delete().eq("user_id", userId),
  ]);
}
