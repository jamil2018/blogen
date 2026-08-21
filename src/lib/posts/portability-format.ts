import { createHash } from "crypto";

export function contentHash(input: {
  title: string;
  description: string;
  summary: string;
}): string {
  return createHash("sha256")
    .update(`${input.title}\n${input.summary}\n${input.description}`)
    .digest("hex");
}

export function htmlToMarkdownish(html: string): string {
  return html
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownToHtml(md: string): string {
  const lines = md.split(/\r?\n/);
  const parts: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    parts.push(`<p>${para.join(" ")}</p>`);
    para = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushPara();
      parts.push(`<h3>${trimmed.slice(4)}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      flushPara();
      parts.push(`<h2>${trimmed.slice(3)}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      flushPara();
      parts.push(`<h1>${trimmed.slice(2)}</h1>`);
    } else if (trimmed.startsWith("- ")) {
      flushPara();
      parts.push(`<ul><li>${trimmed.slice(2)}</li></ul>`);
    } else {
      para.push(trimmed);
    }
  }
  flushPara();
  return parts.join("\n") || `<p>${md}</p>`;
}

export function parseFrontMatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end < 0) return { meta: {}, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trim();
  const meta: Record<string, string> = {};
  for (const line of fm.split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body };
}
