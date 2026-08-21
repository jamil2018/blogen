import { describe, expect, it } from "vitest";
import {
  clampPage,
  computeTotalPages,
  extractHeadingToc,
  injectHeadingAnchors,
  isPubliclyVisibleStatus,
  paginationRange,
  slugifyTitle,
} from "../../src/lib/posts/contracts";

describe("public visibility", () => {
  it("only published is public", () => {
    expect(isPubliclyVisibleStatus("published")).toBe(true);
    expect(isPubliclyVisibleStatus("draft")).toBe(false);
    expect(isPubliclyVisibleStatus("scheduled")).toBe(false);
    expect(isPubliclyVisibleStatus("archived")).toBe(false);
  });
});

describe("pagination contract", () => {
  it("handles zero posts as one empty page", () => {
    expect(computeTotalPages(0, 5)).toBe(1);
    expect(clampPage(99, 1)).toBe(1);
  });

  it("handles single page", () => {
    expect(computeTotalPages(4, 5)).toBe(1);
    expect(clampPage(2, 1)).toBe(1);
  });

  it("handles multi-page boundaries", () => {
    expect(computeTotalPages(11, 5)).toBe(3);
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(3, 3)).toBe(3);
    expect(clampPage(99, 3)).toBe(3);
  });

  it("computes inclusive ranges", () => {
    expect(paginationRange(1, 5)).toEqual({ from: 0, to: 4, page: 1, limit: 5 });
    expect(paginationRange(2, 5)).toEqual({ from: 5, to: 9, page: 2, limit: 5 });
  });
});

describe("slug + toc helpers", () => {
  it("slugifies titles", () => {
    expect(slugifyTitle("Hello World!", "abcdef12")).toBe("hello-world-abcdef12");
  });

  it("builds toc and injects anchors", () => {
    const html = "<h2>Intro</h2><p>x</p><h3>Details</h3>";
    expect(extractHeadingToc(html)).toEqual([
      { id: "intro", text: "Intro", level: 2 },
      { id: "details", text: "Details", level: 3 },
    ]);
    expect(injectHeadingAnchors(html)).toContain('id="intro"');
    expect(injectHeadingAnchors(html)).toContain('id="details"');
  });
});
