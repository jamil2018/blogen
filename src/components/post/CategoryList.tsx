import Link from "next/link";
import { Tag } from "@heroui/react";
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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {categories.map((cat) => (
        <Link
          key={cat._id}
          href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
        >
          <Tag variant="surface" className="cursor-pointer capitalize">
            {cat.title}
          </Tag>
        </Link>
      ))}
    </div>
  );
}
