import { Tag, TagGroup } from "@heroui/react";
import type { Category } from "../../types";

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
      <TagGroup.List className={className}>
        {categories.map((cat) => (
          <Tag
            key={cat.id}
            id={cat.id}
            href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
            className="capitalize"
          >
            {cat.title}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup>
  );
}
