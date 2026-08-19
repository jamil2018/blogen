import { Tag, TagGroup } from "@heroui/react";
import type { Category } from "../../types";
import { cn } from "../../lib/cn";

type CategoryListProps = {
  categories: Category[];
  className?: string;
};

export default function CategoryList({
  categories,
  className,
}: CategoryListProps) {
  return (
    <TagGroup variant="surface" aria-label="Categories">
      <TagGroup.List className={cn("flex flex-wrap gap-2", className)}>
        {categories.map((cat) => (
          <Tag
            key={cat.id}
            id={cat.id}
            href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
            className="rounded-full border border-border bg-zinc-100 px-3 py-1 capitalize text-ink transition-colors hover:border-teal-700/30 hover:bg-teal-50 dark:bg-zinc-800 dark:hover:border-teal-400/30 dark:hover:bg-teal-950/40"
          >
            {cat.title}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup>
  );
}
