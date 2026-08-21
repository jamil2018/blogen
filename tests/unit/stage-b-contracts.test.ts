import { describe, expect, it } from "vitest";
import {
  archivePreservesId,
  classifyImportDuplicate,
  isFollowableInStageB,
  isFutureSchedule,
} from "../../src/lib/posts/stage-b-contracts";
import {
  contentHash,
  htmlToMarkdownish,
  markdownToHtml,
} from "../../src/lib/posts/portability-format";

describe("Stage B follow contracts", () => {
  it("allows author and category in Stage B", () => {
    expect(isFollowableInStageB("author")).toBe(true);
    expect(isFollowableInStageB("category")).toBe(true);
    // Stage C unlocked publication follows; Stage B helper now aligns
    expect(isFollowableInStageB("publication")).toBe(true);
  });
});

describe("Stage B schedule contracts", () => {
  it("rejects past or invalid schedule times", () => {
    expect(isFutureSchedule("not-a-date")).toBe(false);
    expect(isFutureSchedule(new Date(Date.now() - 60_000).toISOString())).toBe(
      false
    );
    expect(isFutureSchedule(new Date(Date.now() + 60_000).toISOString())).toBe(
      true
    );
  });
});

describe("Stage B import idempotency", () => {
  it("classifies duplicate resolution", () => {
    expect(
      classifyImportDuplicate({ existingBySlug: true, existingByHash: false })
    ).toBe("skip-slug");
    expect(
      classifyImportDuplicate({ existingBySlug: false, existingByHash: true })
    ).toBe("skip-hash");
    expect(
      classifyImportDuplicate({ existingBySlug: false, existingByHash: false })
    ).toBe("map");
  });

  it("hashes content stably", () => {
    const a = contentHash({
      title: "Hello",
      summary: "Sum",
      description: "<p>Body</p>",
    });
    const b = contentHash({
      title: "Hello",
      summary: "Sum",
      description: "<p>Body</p>",
    });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it("round-trips simple markdown helpers", () => {
    const html = markdownToHtml("# Title\n\nHello world");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<p>Hello world</p>");
    const md = htmlToMarkdownish("<h2>Hi</h2><p>There</p>");
    expect(md).toContain("## Hi");
    expect(md).toContain("There");
  });
});

describe("Stage B archive URL behavior", () => {
  it("documents that archive keeps the post id for redirects", () => {
    expect(archivePreservesId("archived")).toBe(true);
    expect(archivePreservesId("published")).toBe(false);
  });
});
