import type { Metadata } from "next";
import { Suspense } from "react";
import HomePageView from "../../components/pages/HomePageView";
import {
  fetchAllCategories,
  fetchLatestPosts,
  fetchPaginatedPosts,
} from "../../lib/api";
import { clampPage, computeTotalPages } from "../../lib/posts/contracts";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Explore | Blogen",
    description:
      "Discover published writing on Blogen — a knowledge-oriented publishing community.",
  };
}

type HomePageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1") || 1;
  const limit = 5;

  const [latestPosts, firstPage, categories] = await Promise.all([
    fetchLatestPosts(),
    fetchPaginatedPosts(1, limit),
    fetchAllCategories(),
  ]);

  const totalPages = computeTotalPages(firstPage?.count ?? 0, limit);
  const page = clampPage(requestedPage, totalPages);
  const paginatedPosts =
    page === 1 ? firstPage : await fetchPaginatedPosts(page, limit);

  return (
    <Suspense fallback={null}>
      <HomePageView
        latestPosts={latestPosts}
        paginatedPosts={paginatedPosts}
        categories={categories}
        initialPage={page}
      />
    </Suspense>
  );
}
