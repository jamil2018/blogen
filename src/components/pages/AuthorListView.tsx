"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass, Star } from "@phosphor-icons/react";
import { Input } from "@heroui/react";
import AuthorCard from "../post/AuthorCard";
import PageHero from "../layout/PageHero";
import Reveal from "../motion/Reveal";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { AuthorCardSkeletonGrid } from "../feedback/PageSkeleton";
import { getAllUsers } from "../../data/userQueryFunctions";
import { getAuthorPostCounts } from "../../data/postQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { User } from "../../types";

export default function AuthorListView({ authors }: { authors?: User[] }) {
  const [query, setQuery] = useState("");
  const hasAuthors = authors !== undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getAllUsers,
    enabled: !hasAuthors,
  });
  const list = hasAuthors ? authors : data;

  const { data: counts } = useQuery({
    queryKey: ["author-post-counts"],
    queryFn: getAuthorPostCounts,
    refetchOnWindowFocus: false,
  });

  const postCounts = useMemo(() => {
    const map = new Map<string, number>();
    counts?.forEach((row) => map.set(row.authorId, row.postCount));
    return map;
  }, [counts]);

  const enriched = useMemo(() => {
    if (!list) return [];
    return list
      .map((author) => ({
        author,
        postCount: postCounts.get(author.id) ?? 0,
      }))
      .sort((a, b) => b.postCount - a.postCount);
  }, [list, postCounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(
      ({ author }) =>
        author.name.toLowerCase().includes(q) ||
        author.bio?.toLowerCase().includes(q)
    );
  }, [enriched, query]);

  const featured = enriched.find((e) => e.postCount > 0) ?? enriched[0];

  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Authors"
        description="Meet the writers shaping conversations on Blogen. Discover voices across technology, design, and beyond."
      />

      {featured && !query ? (
        <Reveal className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-ink">
            <Star className="size-4 text-accent" weight="fill" aria-hidden />
            Featured contributor
          </div>
          <div className="max-w-sm">
            <AuthorCard
              author={featured.author}
              postCount={featured.postCount}
              featured
            />
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={0.04}>
        <div className="relative mb-8 max-w-md">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            placeholder="Search authors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Search authors"
          />
        </div>
      </Reveal>

      {isLoading ? (
        <AuthorCardSkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState />
      ) : !filtered.length ? (
        <EmptyState
          title="No authors found"
          description="Try a different search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map(({ author, postCount }, index) => (
            <Reveal key={author.id} delay={index * 0.03}>
              <AuthorCard author={author} postCount={postCount} />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
