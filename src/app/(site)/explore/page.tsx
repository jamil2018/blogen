import type { Metadata } from "next";
import { Suspense } from "react";
import ExplorePageView from "../../../components/pages/ExplorePageView";
import { SearchResultsRouteFallback } from "../../../components/feedback/PublicRouteFallbacks";
import {
  fetchAllCategories,
  fetchAllUsers,
  fetchAuthorPostCounts,
  fetchExplorePosts,
  fetchPublicTags,
} from "../../../lib/api";
import { clampPage, computeTotalPages } from "../../../lib/posts/contracts";
import {
  filtersFromRecord,
  listFiltersFromExplore,
} from "../../../lib/explore/filters";

export const metadata: Metadata = {
  title: "Explore | Blogen",
  description:
    "Browse and filter published articles on Blogen — search by keyword, category, tag, or author.",
};

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const filters = filtersFromRecord(params);
  const limit = 10;
  const listFilters = listFiltersFromExplore(filters);

  const [firstPage, categories, users, authorCounts, tags] = await Promise.all([
    fetchExplorePosts(1, limit, listFilters),
    fetchAllCategories(),
    fetchAllUsers(),
    fetchAuthorPostCounts(),
    fetchPublicTags(),
  ]);

  const totalPages = computeTotalPages(firstPage?.count ?? 0, limit);
  const page = clampPage(filters.page, totalPages);
  const paginatedPosts =
    page === 1 ? firstPage : await fetchExplorePosts(page, limit, listFilters);

  const authorsWithPosts = new Set(
    (authorCounts ?? [])
      .filter((row) => row.postCount > 0)
      .map((row) => row.authorId),
  );
  const authors = (users ?? [])
    .filter((user) => authorsWithPosts.has(user.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const resolvedFilters = { ...filters, page };

  return (
    <Suspense fallback={<SearchResultsRouteFallback />}>
      <ExplorePageView
        paginatedPosts={paginatedPosts}
        categories={categories}
        authors={authors}
        tags={tags}
        initialFilters={resolvedFilters}
      />
    </Suspense>
  );
}
