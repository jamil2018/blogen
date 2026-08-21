"use client";

import { useEffect, useRef } from "react";
import { toast } from "@heroui/react";
import { cn } from "../../lib/cn";
import { sanitizePostHtml } from "../../lib/sanitize-html";
import { injectHeadingAnchors } from "../../lib/posts/contracts";

type PostProseProps = {
  html: string;
  className?: string;
};

export default function PostProse({ html, className }: PostProseProps) {
  const containerRef = useRef<HTMLElement>(null);
  const sanitized = injectHeadingAnchors(sanitizePostHtml(html));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const blocks = container.querySelectorAll("pre");
    const cleanups: (() => void)[] = [];

    blocks.forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper group relative my-6";

      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "absolute right-3 top-3 flex size-8 items-center justify-center rounded-lg border border-border bg-paper/90 text-muted opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100";
      button.setAttribute("aria-label", "Copy code");
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>';

      const copy = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          toast("Code copied", { variant: "success" });
        } catch {
          toast("Could not copy code", { variant: "danger" });
        }
      };

      button.addEventListener("click", copy);
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(button);

      cleanups.push(() => {
        button.removeEventListener("click", copy);
        if (wrapper.parentNode) {
          wrapper.parentNode.insertBefore(pre, wrapper);
          wrapper.remove();
        }
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [sanitized]);

  return (
    <article
      ref={containerRef}
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-zinc-50 prose-blockquote:py-1 prose-blockquote:not-italic dark:prose-blockquote:bg-zinc-900/50",
        "prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-zinc-800",
        "prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-zinc-950 prose-pre:p-4 prose-pre:text-zinc-100",
        "prose-img:rounded-xl",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
