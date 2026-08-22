"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Chip } from "@heroui/react";
import PostCard from "../post/PostCard";
import PageHero from "../layout/PageHero";
import Reveal from "../motion/Reveal";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getPostByCategoryName } from "../../data/postQueryFunctions";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";

type SortOption = "latest" | "discussed";

function sortPosts(posts: Post[], sort: SortOption) {
  const copy = [...posts];
  if (sort === "discussed") {
    return copy.sort(
      (a, b) => (b.comments?.length ?? 0) - (a.comments?.length ?? 0)
    );
  }
  return copy.sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
}

function collectRelatedTags(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    post.tags?.forEach((tag) => {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    });
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

export default function PostsByCategoryView({
  categoryName: categoryNameProp,
  posts,
}: {
  categoryName?: string;
  posts?: Post[];
}) {
  const params = useParams();
  const categoryName =
    categoryNameProp ?? decodeURIComponent(params?.categoryName as string);
  const [sort, setSort] = useState<SortOption>("latest");

  const hasPosts = posts !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["posts-by-category", categoryName],
    queryFn: () => getPostByCategoryName({ categoryName }),
    enabled: !hasPosts && Boolean(categoryName),
    refetchOnWindowFocus: false,
  });
  const list = hasPosts ? posts : data;

  const sorted = useMemo(
    () => (list?.length ? sortPosts(list, sort) : []),
    [list, sort]
  );
  const [lead, ...rest] = sorted;
  const relatedTags = useMemo(
    () => (list?.length ? collectRelatedTags(list) : []),
    [list]
  );

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={categoryName}
        description={`Explore ${sorted.length} ${sorted.length === 1 ? "article" : "articles"} in this topic.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: categoryName },
        ]}
        meta={
          <>
            <Chip variant="soft" className="rounded-full">
              {sorted.length} {sorted.length === 1 ? "article" : "articles"}
            </Chip>
            <div className="flex gap-1 rounded-full border border-border p-0.5">
              {(["latest", "discussed"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSort(option)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    sort === option
                      ? "bg-accent text-accent-foreground"
                      : "text-muted hover:text-ink"
                  )}
                >
                  {option === "latest" ? "Latest" : "Most Discussed"}
                </button>
              ))}
            </div>
          </>
        }
      />

      {relatedTags.length > 0 ? (
        <Reveal className="mb-8 flex flex-wrap gap-2">
          {relatedTags.map((tag) => (
            <Link
              key={tag}
              href={`/posts/search/tags/${encodeURIComponent(tag)}`}
            >
              <Chip variant="soft" className="rounded-full">
                #{tag}
              </Chip>
            </Link>
          ))}
        </Reveal>
      ) : null}

      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !sorted.length ? (
        <EmptyState title="No posts in this category" />
      ) : (
        <>
          {lead ? (
            <Reveal>
              <PostCard post={lead} variant="lead" className="mb-8" showCollectionAction />
            </Reveal>
          ) : null}
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.03}>
                <PostCard post={post} variant="featured" showCollectionAction />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </>
  );
}
