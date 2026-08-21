import { describe, expect, it } from "vitest";
import { sanitizePostHtml } from "../../src/lib/sanitize-html";
import { injectHeadingAnchors } from "../../src/lib/posts/contracts";

describe("preview sanitizer parity", () => {
  it("strips scripts and keeps safe markup for preview/public", () => {
    const dirty =
      '<h2>Safe</h2><p>Hello<script>alert(1)</script></p><img src="x" onerror="alert(1)" />';
    const clean = sanitizePostHtml(dirty);
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("<h2>");
  });

  it("injects anchors after sanitize", () => {
    const html = sanitizePostHtml("<h2>Intro</h2><p>Body</p>");
    expect(injectHeadingAnchors(html)).toContain('id="intro"');
  });
});
