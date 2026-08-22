"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react";
import { Button, Chip, Input, Label } from "@heroui/react";
import ExploreMultiComboBox from "../explore/ExploreMultiComboBox";
import ExploreSingleComboBox from "../explore/ExploreSingleComboBox";
import PageHero from "../layout/PageHero";
import PostCard from "../post/PostCard";
import Reveal from "../motion/Reveal";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getPaginatedPosts } from "../../data/postQueryFunctions";
import { EXPLORE_POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import {
  emptyExploreFilters,
  exploreFiltersEqual,
  exploreFiltersToParams,
  filtersFromSearchParams,
  hasAdvancedFilters,
  type ExploreFilters,
} from "../../lib/explore/filters";
import type { Category, PaginatedPosts, Post, User } from "../../types";
import { cn } from "../../lib/cn";

const PAGE_LIMIT = 10;
const POPULAR_TAGS = ["javascript", "typescript", "design", "tutorial", "react"];

type ExplorePageViewProps = {
  paginatedPosts?: PaginatedPosts;
  categories?: Category[];
  authors?: User[];
  tags?: string[];
  initialFilters: ExploreFilters;
};

export default function ExplorePageView({
  paginatedPosts,
  categories,
  authors,
  tags,
  initialFilters,
}: ExplorePageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const [draft, setDraft] = useState<ExploreFilters>(initialFilters);
  const [advancedOpen, setAdvancedOpen] = useState(
    () => hasAdvancedFilters(initialFilters) || Boolean(initialFilters.q),
  );

  useEffect(() => {
    setDraft(activeFilters);
  }, [activeFilters]);

  const categoryOptions = useMemo(
    () =>
      (categories ?? [])
        .map((category) => ({ id: category.title, label: category.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );

  const authorOptions = useMemo(
    () =>
      (authors ?? [])
        .map((author) => ({ id: author.id, label: author.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [authors],
  );

  const tagOptions = useMemo(
    () =>
      (tags ?? [])
        .map((tag) => ({ id: tag, label: tag }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [tags],
  );

  const popularTags = useMemo(() => {
    const available = new Set(tagOptions.map((tag) => tag.id.toLowerCase()));
    return POPULAR_TAGS.filter((tag) => available.has(tag.toLowerCase()));
  }, [tagOptions]);

  const matchesInitial = useMemo(
    () => exploreFiltersEqual(activeFilters, initialFilters),
    [activeFilters, initialFilters],
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [EXPLORE_POST_DATA, activeFilters],
    queryFn: () =>
      getPaginatedPosts({
        page: activeFilters.page,
        limit: PAGE_LIMIT,
        q: activeFilters.q,
        categories: activeFilters.categories,
        tag: activeFilters.tag,
        authors: activeFilters.authors,
        sort: activeFilters.sort,
      }),
    initialData: matchesInitial ? paginatedPosts : undefined,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const results = data ?? paginatedPosts;
  const posts = results?.data ?? [];
  const totalPages = results?.totalPages ?? 1;
  const totalCount = results?.count ?? 0;

  const applyFilters = useCallback(
    (next: ExploreFilters) => {
      const params = exploreFiltersToParams(next);
      const qs = params.toString();
      router.push(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    },
    [router],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    applyFilters({ ...draft, page: 1 });
  };

  const clearFilters = () => {
    const empty = emptyExploreFilters();
    setDraft(empty);
    router.push("/explore");
  };

  const handlePageChange = (page: number) => {
    applyFilters({ ...activeFilters, page });
    document.getElementById("explore-results")?.scrollIntoView({ behavior: "smooth" });
  };

  const activeFilterCount =
    (activeFilters.q ? 1 : 0) +
    activeFilters.categories.length +
    (activeFilters.tag ? 1 : 0) +
    activeFilters.authors.length +
    (activeFilters.sort !== "newest" ? 1 : 0);

  return (
    <>
      <PageHero
        eyebrow="Discover"
        title="Explore"
        description="Browse the full catalog of published writing. Combine keyword search with category, tag, and author filters to find what interests you."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Explore" },
        ]}
        meta={
          !isLoading && !isFetching ? (
            <Chip variant="soft" className="rounded-full">
              {totalCount} {totalCount === 1 ? "article" : "articles"}
            </Chip>
          ) : null
        }
      />

      <Reveal>
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-border bg-zinc-50/80 p-4 dark:bg-zinc-900/40 sm:p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlass
                className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <Input
                placeholder="Search articles…"
                value={draft.q ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, q: event.target.value }))
                }
                className="w-full pl-11"
                aria-label="Search posts by title, summary, or description"
              />
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="submit" className="rounded-full px-5">
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onPress={() => setAdvancedOpen((open) => !open)}
                aria-expanded={advancedOpen}
              >
                Filters
                <CaretDown
                  className={cn(
                    "size-4 transition-transform",
                    advancedOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </Button>
            </div>
          </div>

          {advancedOpen ? (
            <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <ExploreMultiComboBox
                label="Categories"
                placeholder="Search categories…"
                items={categoryOptions}
                selectedKeys={draft.categories}
                onSelectedKeysChange={(categories) =>
                  setDraft((current) => ({ ...current, categories }))
                }
              />

              <ExploreMultiComboBox
                label="Authors"
                placeholder="Search authors…"
                items={authorOptions}
                selectedKeys={draft.authors}
                onSelectedKeysChange={(authors) =>
                  setDraft((current) => ({ ...current, authors }))
                }
              />

              <ExploreSingleComboBox
                label="Tag"
                placeholder="Search tags…"
                emptyLabel="All tags"
                items={tagOptions}
                selectedKey={draft.tag}
                onSelectedKeyChange={(tag) =>
                  setDraft((current) => ({ ...current, tag }))
                }
              />

              <div>
                <Label className="mb-1.5 block text-sm font-medium text-ink">Sort</Label>
                <div className="flex gap-1 rounded-full border border-border p-0.5">
                  {(["newest", "oldest"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDraft((current) => ({ ...current, sort: option }))}
                      className={cn(
                        "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        draft.sort === option
                          ? "bg-ink text-paper"
                          : "text-muted hover:text-ink",
                      )}
                    >
                      {option === "newest" ? "Newest" : "Oldest"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {advancedOpen ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-xs font-medium uppercase tracking-wide text-muted">
                Popular tags
              </span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, tag }))}
                  className="rounded-full"
                >
                  <Chip
                    variant={draft.tag === tag ? "primary" : "soft"}
                    className="cursor-pointer rounded-full"
                  >
                    {tag}
                  </Chip>
                </button>
              ))}
            </div>
          ) : null}

          {activeFilterCount > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-sm text-muted">Active filters:</span>
              {activeFilters.q ? (
                <Chip variant="soft" className="rounded-full">
                  &ldquo;{activeFilters.q}&rdquo;
                </Chip>
              ) : null}
              {activeFilters.categories.map((category) => (
                <Chip key={category} variant="soft" className="rounded-full">
                  {category}
                </Chip>
              ))}
              {activeFilters.tag ? (
                <Chip variant="soft" className="rounded-full">
                  #{activeFilters.tag}
                </Chip>
              ) : null}
              {activeFilters.authors.map((authorId) => (
                <Chip key={authorId} variant="soft" className="rounded-full">
                  {authors?.find((author) => author.id === authorId)?.name ?? "Author"}
                </Chip>
              ))}
              {activeFilters.sort !== "newest" ? (
                <Chip variant="soft" className="rounded-full">
                  Oldest first
                </Chip>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onPress={clearFilters}
              >
                <X className="mr-1 size-3.5" aria-hidden />
                Clear all
              </Button>
            </div>
          ) : null}
        </form>
      </Reveal>

      <Reveal delay={0.04}>
        <section id="explore-results">
          {isLoading || isFetching ? (
            <ExpandedPostSkeletonList count={5} />
          ) : isError ? (
            <ErrorState />
          ) : posts.length ? (
            <>
              <div>
                {posts.map((post: Post) => (
                  <PostCard key={post.id} post={post} showCollectionAction />
                ))}
              </div>
              {totalPages > 1 ? (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="active:scale-[0.98]"
                    isDisabled={activeFilters.page <= 1}
                    onPress={() => handlePageChange(activeFilters.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted">
                    Page {results?.page ?? activeFilters.page} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="active:scale-[0.98]"
                    isDisabled={activeFilters.page >= totalPages}
                    onPress={() => handlePageChange(activeFilters.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              title="No articles match your filters"
              description="Try broadening your search, clearing a filter, or browse by category."
              actionHref="/categories"
              actionLabel="Browse categories"
            />
          )}
        </section>
      </Reveal>
    </>
  );
}
