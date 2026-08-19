import { Tag, TagGroup } from "@heroui/react";

type PostTagsProps = {
  tags: string[];
  className?: string;
};

export default function PostTags({ tags, className }: PostTagsProps) {
  if (!tags?.length) return null;

  return (
    <TagGroup variant="surface" aria-label="Tags" className={className}>
      <TagGroup.List>
        {tags.map((tag) => (
          <Tag
            key={tag}
            id={tag}
            href={`/posts/search/tags/${encodeURIComponent(tag)}`}
          >
            {tag}
          </Tag>
        ))}
      </TagGroup.List>
    </TagGroup>
  );
}
