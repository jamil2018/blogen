"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { Chip, Input } from "@heroui/react";
import PostCard from "../post/PostCard";
import Reveal from "../motion/Reveal";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { searchPostResults } from "../../data/postQueryFunctions";
import { SEARCH_POST_DATA_RESULTS } from "../../definitions/reactQueryConstants/queryConstants";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";

const SUGGESTED_QUERIES = ["react", "typescript", "design", "nextjs"];
const POPULAR_TOPICS = ["javascript", "web development", "tutorial", "productivity"];

function getCategoryName(post: Post) {
  return typeof post.category === "string"
    ? post.category
    : post.category?.title;
}

export default function SearchResultsView({
  searchQuery: searchQueryProp,
  results,
}: {
  searchQuery?: string;
  results?: Post[];
}) {
  const params = useParams();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuery = searchQueryProp ?? (params?.searchQuery as string);
  const [inputValue, setInputValue] = useState(initialQuery ?? "");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const hasResults = results !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: [SEARCH_POST_DATA_RESULTS, initialQuery],
    queryFn: ({ queryKey }) => searchPostResults(queryKey[1] as string),
    enabled: !hasResults && Boolean(initialQuery),
    refetchOnWindowFocus: false,
  });
  const posts = hasResults ? results : data;

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts?.forEach((post) => {
      const cat = getCategoryName(post);
      if (cat) set.add(cat);
    });
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return [];
    if (!activeCategory) return posts;
    return posts.filter((post) => getCategoryName(post) === activeCategory);
  }, [posts, activeCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (q.length >= 2) {
      router.push(`/search/${encodeURIComponent(q)}`);
    }
  };

  const clearSearch = () => {
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <>
      <Reveal>
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              ref={inputRef}
              autoFocus
              placeholder="Search articles..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-11 pr-11"
              aria-label="Search articles"
            />
            {inputValue ? (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </form>
      </Reveal>

      {initialQuery ? (
        <Reveal delay={0.04}>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Results for &ldquo;{decodeURIComponent(initialQuery)}&rdquo;
            </h1>
            {!isLoading && !isFetching ? (
              <Chip variant="soft" className="rounded-full">
                {filtered.length} {filtered.length === 1 ? "match" : "matches"}
              </Chip>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      {categories.length > 1 ? (
        <Reveal delay={0.06} className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              !activeCategory
                ? "bg-accent text-accent-foreground"
                : "border border-border text-muted hover:text-ink"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                activeCategory === cat
                  ? "bg-accent text-accent-foreground"
                  : "border border-border text-muted hover:text-ink"
              )}
            >
              {cat}
            </button>
          ))}
        </Reveal>
      ) : null}

      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !filtered.length ? (
        <EmptyState
          title="No posts found"
          description="Try a different search term or explore popular topics below."
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Suggested searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <Link key={q} href={`/search/${encodeURIComponent(q)}`}>
                    <Chip variant="soft" className="rounded-full capitalize">
                      {q}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                Popular topics
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <Link key={topic} href={`/search/${encodeURIComponent(topic)}`}>
                    <Chip variant="soft" className="rounded-full capitalize">
                      {topic}
                    </Chip>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </EmptyState>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.03}>
              <PostCard post={post} variant="featured" />
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
