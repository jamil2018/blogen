import Link from "next/link";
import { Button } from "@heroui/react";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";

type FeaturedPostProps = {
  post?: Post;
  className?: string;
};

export default function FeaturedPost({ post, className }: FeaturedPostProps) {
  return (
    <section
      className={cn(
        "grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16",
        className
      )}
    >
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Blogen is a place where creative minds grow
        </h1>
        <p className="text-lg text-muted">
          Share your knowledge and get inspired
        </p>
        <div>
          <Link href="/register">
            <Button className="rounded-full px-6" variant="primary">
              Start Sharing
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl">
        {post?.imageURL ? (
          <Link href={`/posts/${post.id}`} className="block">
            <img
              src={post.imageURL}
              alt={post.title}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-sm font-medium text-white/80">Featured</p>
              <p className="mt-1 text-lg font-semibold text-white line-clamp-2">
                {post.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />
        )}
      </div>
    </section>
  );
}
