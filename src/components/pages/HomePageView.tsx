"use client";

import { useCallback, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Books, ArrowsClockwise } from "@phosphor-icons/react";
import { Button, Separator } from "@heroui/react";
import FeaturedPost from "../post/FeaturedPost";
import PostCard from "../post/PostCard";
import CategoryList from "../post/CategoryList";
import ErrorState from "../feedback/ErrorState";
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
};

export default function HomePageView({
  latestPosts,
  paginatedPosts,
  categories,
}: HomePageViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const allPostsRef = useRef<HTMLDivElement>(null);

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

  const usePrefetchedPage = paginatedPosts !== undefined && currentPage === 1;
  const {
    data: queriedPaginated,
    isLoading: paginatedLoading,
    isFetching: paginatedFetching,
    isError: paginatedError,
  } = useQuery({
    queryKey: [PAGINATED_POST_DATA, { page: currentPage, limit: 5 }],
    queryFn: () => getPaginatedPosts({ page: currentPage, limit: 5 }),
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

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    allPostsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const featuredPost = latest?.[0];

  return (
    <>
      <FeaturedPost post={featuredPost} />

      <Separator className="my-8" />

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <ArrowsClockwise className="size-4 text-teal-700 dark:text-teal-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Latest articles
          </h2>
        </div>
        {latestLoading || latestFetching ? (
          <PostCardSkeletonGrid count={6} />
        ) : latestError ? (
          <ErrorState />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest?.map((post: Post) => (
              <PostCard key={post.id} post={post} variant="featured" />
            ))}
          </div>
        )}
      </section>

      <Separator className="my-8" />

      <section ref={allPostsRef}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-2">
            <Books className="size-4 text-teal-700 dark:text-teal-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              All posts
            </h2>
          </div>
          <p className="hidden text-sm text-muted sm:block">
            Discover more of what matters to you
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {paginatedLoading || paginatedFetching ? (
              <ExpandedPostSkeletonList count={5} />
            ) : paginatedError ? (
              <ErrorState />
            ) : (
              <>
                <div>
                  {paginated?.data.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {paginated && paginated.totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={currentPage <= 1}
                      onPress={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted">
                      Page {currentPage} of {paginated.totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      isDisabled={currentPage >= paginated.totalPages}
                      onPress={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
          <aside>
            <p className="mb-4 text-sm text-muted sm:hidden">
              Discover more of what matters to you
            </p>
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
    </>
  );
}
