import Link from "next/link";
import { Card } from "@heroui/react";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";
import { getPostFormattedDate } from "../../utils/dateUtils";
import AddToCollectionMenu from "../collections/AddToCollectionMenu";

type PostCardProps = {
  post: Post;
  variant?: "compact" | "featured" | "lead";
  className?: string;
  showCollectionAction?: boolean;
};

function CollectionAction({ postId, enabled }: { postId: string; enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="absolute right-2 top-2 z-10">
      <AddToCollectionMenu postId={postId} />
    </div>
  );
}

export default function PostCard({
  post,
  variant = "compact",
  className,
  showCollectionAction = false,
}: PostCardProps) {
  const categoryName =
    typeof post.category === "string"
      ? post.category
      : post.category?.title;

  if (variant === "lead") {
    return (
      <div className={cn("group relative lg:col-span-2 lg:row-span-2", className)}>
        <CollectionAction postId={post.id} enabled={showCollectionAction} />
        <Link href={`/posts/${post.id}`} className="block">
          <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
            {post.imageURL ? (
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={post.imageURL}
                  alt={post.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-800" />
            )}
            <Card.Header>
              {categoryName ? (
                <span className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
                  {categoryName}
                </span>
              ) : null}
              <Card.Title className="line-clamp-2 text-2xl transition-colors group-hover:text-accent">
                {post.title}
              </Card.Title>
              <Card.Description className="line-clamp-3">
                {post.summary}
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className={cn("group relative block", className)}>
        <CollectionAction postId={post.id} enabled={showCollectionAction} />
        <Link href={`/posts/${post.id}`} className="block">
          <Card className="overflow-hidden transition-shadow hover:shadow-md">
            {post.imageURL ? (
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.imageURL}
                  alt={post.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
              <Card.Title className="line-clamp-2 transition-colors group-hover:text-accent">
                {post.title}
              </Card.Title>
              <Card.Description className="line-clamp-2">
                {post.summary}
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
      </div>
    );
  }

  return (
    <div className={cn("group relative block", className)}>
      <CollectionAction postId={post.id} enabled={showCollectionAction} />
      <Link href={`/posts/${post.id}`} className="block">
        <article className="flex gap-4 border-b border-border py-5 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
          {post.imageURL ? (
            <img
              src={post.imageURL}
              alt=""
              className="size-24 shrink-0 rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:size-28"
            />
          ) : (
            <div className="size-24 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:size-28" />
          )}
          <div className="min-w-0 flex-1">
            {categoryName ? (
              <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
                {categoryName}
              </span>
            ) : null}
            <h3 className="mt-0.5 line-clamp-2 font-medium text-ink transition-colors group-hover:text-accent">
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
    </div>
  );
}
