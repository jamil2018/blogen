import Link from "next/link";
import { Card } from "@heroui/react";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";
import { getPostFormattedDate } from "../../utils/dateUtils";

type PostCardProps = {
  post: Post;
  variant?: "compact" | "featured";
  className?: string;
};

export default function PostCard({
  post,
  variant = "compact",
  className,
}: PostCardProps) {
  const categoryName =
    typeof post.category === "string"
      ? post.category
      : post.category?.title;

  if (variant === "featured") {
    return (
      <Link href={`/posts/${post.id}`} className={cn("block group", className)}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          {post.imageURL ? (
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={post.imageURL}
                alt={post.title}
                className="size-full object-cover transition-transform group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800" />
          )}
          <Card.Header>
            {categoryName ? (
              <span className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
                {categoryName}
              </span>
            ) : null}
            <Card.Title className="line-clamp-2">{post.title}</Card.Title>
            <Card.Description className="line-clamp-2">
              {post.summary}
            </Card.Description>
          </Card.Header>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/posts/${post.id}`} className={cn("block group", className)}>
      <article className="flex gap-4 border-b border-border py-5 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
        {post.imageURL ? (
          <img
            src={post.imageURL}
            alt=""
            className="size-20 shrink-0 rounded-lg object-cover sm:size-24"
          />
        ) : (
          <div className="size-20 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 sm:size-24" />
        )}
        <div className="min-w-0 flex-1">
          {categoryName ? (
            <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
              {categoryName}
            </span>
          ) : null}
          <h3 className="mt-0.5 line-clamp-2 font-medium text-ink group-hover:text-teal-700 dark:group-hover:text-teal-400">
            {post.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{post.summary}</p>
          {post.createdAt ? (
            <time className="mt-2 block text-xs text-muted">
              {getPostFormattedDate(post.createdAt)}
            </time>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
