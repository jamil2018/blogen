import PostsByCategoryView from "../../../../../../components/pages/PostsByCategoryView";
import { fetchPostsByCategoryName } from "../../../../../../lib/api";

type CategoryPostsPageProps = {
  params: Promise<{ categoryName: string }>;
};

export default async function CategoryPostsPage({
  params,
}: CategoryPostsPageProps) {
  const { categoryName } = await params;
  const posts = await fetchPostsByCategoryName(
    decodeURIComponent(categoryName)
  );
  return (
    <PostsByCategoryView
      categoryName={decodeURIComponent(categoryName)}
      posts={posts}
    />
  );
}
