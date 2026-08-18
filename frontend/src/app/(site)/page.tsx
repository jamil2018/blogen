import type { Metadata } from "next";
import HomePageView from "../../components/pages/HomePageView";
import {
  fetchAllCategories,
  fetchLatestPosts,
  fetchPaginatedPosts,
} from "../../lib/api";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blogen",
    description:
      "Blogen is a place where creative minds grow. Share your knowledge and get inspired.",
  };
}

export default async function HomePage() {
  const [latestPosts, paginatedPosts, categories] = await Promise.all([
    fetchLatestPosts(),
    fetchPaginatedPosts(1, 5),
    fetchAllCategories(),
  ]);

  return (
    <HomePageView
      latestPosts={latestPosts}
      paginatedPosts={paginatedPosts}
      categories={categories}
    />
  );
}
