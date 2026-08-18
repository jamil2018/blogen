import PostsByCategoryScreen from "../../../../../../screens/general/PostsByCategoryScreen";
import { fetchPostsByCategoryName } from "../../../../../../lib/api";

type CategoryPostsPageProps = {
  params: Promise<{ categoryName: string }>;
};

export default async function CategoryPostsPage({
  params,
}: CategoryPostsPageProps) {
  const { categoryName } = await params;
  const posts = await fetchPostsByCategoryName(categoryName);

  return (
    <PostsByCategoryScreen categoryName={categoryName} posts={posts} />
  );
}
