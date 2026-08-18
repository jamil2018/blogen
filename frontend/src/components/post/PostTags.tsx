import Link from "next/link";
import { Tag } from "@heroui/react";
import { cn } from "../../lib/cn";

type PostTagsProps = {
  tags: string[];
  className?: string;
};

export default function PostTags({ tags, className }: PostTagsProps) {
  if (!tags?.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Link key={tag} href={`/posts/search/tags/${encodeURIComponent(tag)}`}>
          <Tag variant="surface" className="cursor-pointer">
            {tag}
          </Tag>
        </Link>
      ))}
    </div>
  );
}
