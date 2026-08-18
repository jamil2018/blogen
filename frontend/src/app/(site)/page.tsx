import type { Metadata } from "next";
import HomeScreen from "../../screens/general/HomeScreen";
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
    <HomeScreen
      latestPosts={latestPosts}
      paginatedPosts={paginatedPosts}
      categories={categories}
    />
  );
}
