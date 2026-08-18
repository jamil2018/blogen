import { cn } from "../../lib/cn";
import { sanitizePostHtml } from "../../lib/sanitize-html";

type PostProseProps = {
  html: string;
  className?: string;
};

export default function PostProse({ html, className }: PostProseProps) {
  const sanitized = sanitizePostHtml(html);

  return (
    <article
      className={cn(
        "prose prose-zinc dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-a:text-teal-700 dark:prose-a:text-teal-400",
        "prose-pre:bg-zinc-900 prose-pre:text-zinc-100",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
