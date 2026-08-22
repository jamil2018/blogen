"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button, Separator } from "@heroui/react";
import HomeHero from "../home/HomeHero";
import PostCard from "../post/PostCard";
import CategoryList from "../post/CategoryList";
import Reveal from "../motion/Reveal";
import ErrorState from "../feedback/ErrorState";
import EmptyState from "../feedback/EmptyState";
import {
  PostCardSkeletonGrid,
  ExpandedPostSkeletonList,
  CategorySkeletonGrid,
} from "../feedback/PageSkeleton";
import {
  CATEGORY_DATA,
  LATEST_POST_DATA,
  PAGINATED_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import {
  getLatestPosts,
  getPaginatedPosts,
} from "../../data/postQueryFunctions";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import type { Category, PaginatedPosts, Post } from "../../types";

type HomePageViewProps = {
  latestPosts?: Post[];
  paginatedPosts?: PaginatedPosts;
  categories?: Category[];
  initialPage?: number;
};

const LATEST_LIMIT = 6;
const PAGE_LIMIT = 5;

export default function HomePageView({
  latestPosts,
  paginatedPosts,
  categories,
  initialPage = 1,
}: HomePageViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? initialPage) || 1;

  const hasLatestPosts = latestPosts !== undefined;
  const {
    data: queriedLatest,
    isLoading: latestLoading,
    isFetching: latestFetching,
    isError: latestError,
  } = useQuery({
    queryKey: [LATEST_POST_DATA],
    queryFn: getLatestPosts,
    enabled: !hasLatestPosts,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const latest = hasLatestPosts ? latestPosts : queriedLatest;

  const usePrefetchedPage =
    paginatedPosts !== undefined && currentPage === (paginatedPosts.page ?? 1);
  const {
    data: queriedPaginated,
    isLoading: paginatedLoading,
    isFetching: paginatedFetching,
    isError: paginatedError,
  } = useQuery({
    queryKey: [PAGINATED_POST_DATA, { page: currentPage, limit: PAGE_LIMIT }],
    queryFn: () => getPaginatedPosts({ page: currentPage, limit: PAGE_LIMIT }),
    enabled: !usePrefetchedPage,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  const paginated = usePrefetchedPage ? paginatedPosts : queriedPaginated;

  const hasCategories = categories !== undefined;
  const {
    data: queriedCategories,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
    isError: categoriesError,
  } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
    enabled: !hasCategories,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const categoryList = hasCategories ? categories : queriedCategories;

  const latestIds = useMemo(
    () => new Set((latest ?? []).slice(0, LATEST_LIMIT).map((p) => p.id)),
    [latest]
  );

  const archivePosts = useMemo(() => {
    const rows = paginated?.data ?? [];
    // Prefer non-overlapping inventory when Latest and All would duplicate.
    const filtered = rows.filter((p) => !latestIds.has(p.id));
    return filtered.length ? filtered : rows;
  }, [paginated?.data, latestIds]);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) params.delete("page");
      else params.set("page", String(page));
      const qs = params.toString();
      router.push(qs ? `/?${qs}` : "/", { scroll: false });
      document
        .getElementById("all-posts")
        ?.scrollIntoView({ behavior: "smooth" });
    },
    [router, searchParams]
  );

  const featuredPost = latest?.[0];

  return (
    <>
      <HomeHero post={featuredPost} />

      <Reveal className="mb-12 mt-12">
        <section>
          <div className="mb-6 space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Latest articles
            </h2>
            <p className="text-sm text-muted">
              Fresh published writing from across Blogen.
            </p>
          </div>
          {latestLoading || latestFetching ? (
            <PostCardSkeletonGrid count={6} />
          ) : latestError ? (
            <ErrorState />
          ) : latest?.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((post: Post, index: number) => (
                <PostCard
                  key={post.id}
                  post={post}
                  variant={index === 0 ? "lead" : "featured"}
                  showCollectionAction
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No published articles yet"
              description="Be the first to share durable knowledge with the community."
              actionHref="/user/posts/create"
              actionLabel="Create a draft"
            />
          )}
        </section>
      </Reveal>

      <Separator className="my-8" />

      <Reveal delay={0.06}>
        <section id="all-posts">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Explore the archive
            </h2>
            <p className="text-sm text-muted">
              Browse the full published catalog — separate from the latest strip above.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {paginatedLoading || paginatedFetching ? (
                <ExpandedPostSkeletonList count={5} />
              ) : paginatedError ? (
                <ErrorState />
              ) : archivePosts.length ? (
                <>
                  <div>
                    {archivePosts.map((post: Post) => (
                      <PostCard key={post.id} post={post} showCollectionAction />
                    ))}
                  </div>
                  {paginated && paginated.totalPages > 1 ? (
                    <div className="mt-8 flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="active:scale-[0.98]"
                        isDisabled={currentPage <= 1}
                        onPress={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted">
                        Page {paginated.page} of {paginated.totalPages}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="active:scale-[0.98]"
                        isDisabled={currentPage >= paginated.totalPages}
                        onPress={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title="Nothing on this page"
                  description="Try the previous page or browse categories."
                  actionHref="/categories"
                  actionLabel="Browse categories"
                />
              )}
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              {categoriesLoading || categoriesFetching ? (
                <CategorySkeletonGrid count={8} />
              ) : categoriesError ? (
                <ErrorState />
              ) : categoryList ? (
                <CategoryList categories={categoryList} />
              ) : null}
            </aside>
          </div>
        </section>
      </Reveal>
    </>
  );
}
