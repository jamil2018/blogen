/**
 * Pure helpers for public list/pagination contracts (Stage A).
 * Used by DB layer and unit/contract tests.
 */

export type PostStatus = "draft" | "scheduled" | "published" | "archived";

export function isPubliclyVisibleStatus(status: PostStatus | string | null | undefined) {
  return status === "published";
}

export function clampPage(page: number, totalPages: number): number {
  const safeTotal = Math.max(1, totalPages);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), safeTotal);
}

export function computeTotalPages(count: number, limit: number): number {
  const safeLimit = Math.max(1, limit);
  return Math.max(1, Math.ceil(Math.max(0, count) / safeLimit));
}

export function paginationRange(page: number, limit: number) {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const safeLimit = Math.max(1, Math.floor(limit) || 1);
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
  return { from, to, page: safePage, limit: safeLimit };
}

export function slugifyTitle(title: string, idHint?: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const suffix = idHint ? idHint.slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${base || "post"}-${suffix}`;
}

export function extractHeadingToc(html: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const re = /<h([2-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  const seen = new Map<string, number>();

  while ((match = re.exec(html)) !== null) {
    const level = Number(match[1]);
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;
    let id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    headings.push({ id, text, level });
  }

  return headings;
}

export function injectHeadingAnchors(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_full, level, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    let id = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    const cleanAttrs = String(attrs).replace(/\s+id=(["']).*?\1/i, "");
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
  });
}
