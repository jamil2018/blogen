"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import PostCard from "../post/PostCard";
import PageHero from "../layout/PageHero";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import {
  getLibraryPosts,
  mergeLocalLibraryBookmarks,
} from "../../actions/library";
import type { Post } from "../../types";

const BOOKMARK_KEY = "blogen-bookmarks";
const MIGRATED_KEY = "blogen-bookmarks-migrated";

function readLocalBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function LibraryPageView() {
  const [migrating, setMigrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!localStorage.getItem(MIGRATED_KEY)) {
          const ids = readLocalBookmarks();
          if (ids.length) {
            await mergeLocalLibraryBookmarks(ids);
          }
          localStorage.setItem(MIGRATED_KEY, "1");
          localStorage.removeItem(BOOKMARK_KEY);
        }
      } catch {
        // Keep local bookmarks if merge fails; user can retry on next visit.
      } finally {
        if (!cancelled) setMigrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["library-posts"],
    queryFn: getLibraryPosts,
    enabled: !migrating,
  });

  return (
    <>
      <PageHero
        eyebrow="Reading list"
        title="Library"
        description="Posts you have saved for later. Syncs to your account across devices."
      />
      {migrating || isLoading ? (
        <ExpandedPostSkeletonList count={4} />
      ) : isError ? (
        <div className="space-y-3">
          <ErrorState message="Could not load your Library" />
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-accent underline"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : data?.length ? (
        <div>
          {data.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your Library is empty"
          description="Save published posts while reading to build your list."
          actionHref="/"
          actionLabel="Explore posts"
        />
      )}
      <p className="mt-8 text-center text-xs text-muted">
        Looking for something specific?{" "}
        <Link href="/search/a" className="text-accent hover:underline">
          Search
        </Link>
      </p>
    </>
  );
}
