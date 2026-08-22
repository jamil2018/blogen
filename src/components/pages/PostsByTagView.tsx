"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Hash } from "@phosphor-icons/react";
import { Chip } from "@heroui/react";
import PostCard from "../post/PostCard";
import PageHero from "../layout/PageHero";
import Reveal from "../motion/Reveal";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getPostByTagName } from "../../data/postQueryFunctions";
import type { Post } from "../../types";

function collectRelatedTags(posts: Post[], currentTag: string) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    post.tags?.forEach((tag) => {
      if (tag.toLowerCase() !== currentTag.toLowerCase()) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    });
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);
}

export default function PostsByTagView({
  tagName: tagNameProp,
  posts,
}: {
  tagName?: string;
  posts?: Post[];
}) {
  const params = useParams();
  const tagName = tagNameProp ?? decodeURIComponent(params?.tagName as string);

  const hasPosts = posts !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["posts-by-tag", tagName],
    queryFn: () => getPostByTagName({ tagName }),
    enabled: !hasPosts && Boolean(tagName),
    refetchOnWindowFocus: false,
  });
  const list = hasPosts ? posts : data;

  const relatedTags = useMemo(
    () => (list?.length ? collectRelatedTags(list, tagName) : []),
    [list, tagName]
  );

  return (
    <>
      <PageHero
        eyebrow="Tag"
        title={`#${tagName}`}
        description={`Articles tagged with ${tagName} across the Blogen community.`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tags", href: "/categories" },
          { label: `#${tagName}` },
        ]}
        meta={
          <Chip variant="soft" className="rounded-full">
            <Hash className="mr-1 size-3.5" aria-hidden />
            {list?.length ?? 0} {list?.length === 1 ? "article" : "articles"}
          </Chip>
        }
      />

      {relatedTags.length > 0 ? (
        <Reveal className="mb-8">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Related tags
          </p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </Reveal>
      ) : null}

      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !list?.length ? (
        <EmptyState title="No posts with this tag" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {list.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.03}>
              <PostCard post={post} variant="featured" showCollectionAction />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
