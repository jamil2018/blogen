"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Clock, Path } from "@phosphor-icons/react";
import PageHero from "../layout/PageHero";
import PostCard from "../post/PostCard";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getReadingPath, recordReadingPathStarted } from "../../actions/phase2";
import { relationshipLabel } from "../../lib/phase-2/contracts";
import AddToCollectionMenu from "../collections/AddToCollectionMenu";
import SavePathToCollectionMenu from "../collections/SavePathToCollectionMenu";

type ReadingPathPageViewProps = {
  slug: string;
};

export default function ReadingPathPageView({ slug }: ReadingPathPageViewProps) {
  const { data: path, isLoading, isError } = useQuery({
    queryKey: ["reading-path", slug],
    queryFn: () => getReadingPath(slug),
  });

  useEffect(() => {
    if (path) {
      void recordReadingPathStarted(slug);
    }
  }, [path, slug]);

  if (isLoading) return <ExpandedPostSkeletonList count={3} />;
  if (isError || !path) return <ErrorState message="Reading path not found" />;

  return (
    <>
      <PageHero
        eyebrow="Reading path"
        title={path.title}
        description={path.purpose}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" />
            ~{path.estimatedMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Path className="size-4" />
            {path.itemCount} posts
          </span>
        </div>
        <SavePathToCollectionMenu pathSlug={slug} />
      </div>

      <ol className="space-y-6">
        {path.items.map((item, index) => (
          <li key={item.id} className="rounded-2xl border border-border p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-accent">
                Step {index + 1}
              </span>
              {item.relationshipLabel ? (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {relationshipLabel(item.relationshipLabel)}
                </span>
              ) : null}
            </div>
            {item.transitionNote ? (
              <p className="mb-3 text-sm text-muted">{item.transitionNote}</p>
            ) : null}
            {item.post ? (
              <div className="flex items-start justify-between gap-2">
                <PostCard post={item.post} variant="compact" />
                <AddToCollectionMenu postId={item.boundPostId} variant="button" />
              </div>
            ) : (
              <p className="text-sm text-muted">This source is unavailable.</p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 text-center">
        <Link
          href="/paths"
          className="inline-flex rounded-full border border-border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          Browse more paths
        </Link>
      </div>
    </>
  );
}
