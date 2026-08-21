"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@heroui/react";
import PostCard from "../post/PostCard";
import PageHero from "../layout/PageHero";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import FollowButton from "../follow/FollowButton";
import { getFollowingFeed, getMyFollows } from "../../actions/follows";
import { getLatestUsers } from "../../data/userQueryFunctions";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import type { Category, Post, User } from "../../types";

export default function FollowingPageView() {
  const {
    data: feed,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["following-feed"],
    queryFn: () => getFollowingFeed(1, 30),
  });

  const { data: follows } = useQuery({
    queryKey: ["my-follows"],
    queryFn: getMyFollows,
  });

  const { data: suggestedAuthors } = useQuery({
    queryKey: ["following-suggested-authors"],
    queryFn: getLatestUsers,
    enabled: !follows?.length,
  });

  const { data: suggestedCategories } = useQuery({
    queryKey: ["following-suggested-categories"],
    queryFn: getAllCategories,
    enabled: !follows?.length,
  });

  const posts = (feed?.data ?? []) as Post[];
  const empty = !isLoading && !isError && posts.length === 0;

  return (
    <>
      <PageHero
        eyebrow="Your feed"
        title="Following"
        description="Chronological posts from authors and topics you follow. No fabricated activity."
      />

      {isLoading ? (
        <ExpandedPostSkeletonList count={4} />
      ) : isError ? (
        <div className="space-y-3">
          <ErrorState message="Could not load your Following feed" />
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
      ) : empty ? (
        <EmptyState
          title="Nothing in your feed yet"
          description="Follow authors and topics to build a chronological home. Suggestions below are real people and categories — not fake activity."
        >
          <div className="mx-auto mt-8 max-w-2xl space-y-8 text-left">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                Authors to follow
              </h2>
              <ul className="space-y-3">
                {((suggestedAuthors ?? []) as User[]).slice(0, 6).map((author) => (
                  <li
                    key={author.id}
                    className="flex items-center justify-between gap-3 border-b border-border py-2"
                  >
                    <Link
                      href={`/authors/${author.id}`}
                      className="font-medium hover:text-accent"
                    >
                      {author.name}
                    </Link>
                    <FollowButton targetType="author" targetId={author.id} />
                  </li>
                ))}
              </ul>
              <Link href="/authors" className="mt-3 inline-block text-sm text-accent">
                Browse all authors
              </Link>
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                Topics to follow
              </h2>
              <ul className="space-y-3">
                {((suggestedCategories ?? []) as Category[])
                  .slice(0, 6)
                  .map((cat) => (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between gap-3 border-b border-border py-2"
                    >
                      <Link
                        href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
                        className="font-medium hover:text-accent"
                      >
                        {cat.title}
                      </Link>
                      <FollowButton targetType="category" targetId={cat.id} />
                    </li>
                  ))}
              </ul>
              <div className="mt-4">
                <Link href="/categories">
                  <Button variant="secondary" className="rounded-full">
                    Explore categories
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} variant="featured" />
          ))}
        </div>
      )}
    </>
  );
}
