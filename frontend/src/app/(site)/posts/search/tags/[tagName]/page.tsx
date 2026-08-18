import PostsByTagScreen from "../../../../../../screens/general/PostByTagScreen";
import { fetchPostsByTagName } from "../../../../../../lib/api";

type TagPostsPageProps = {
  params: Promise<{ tagName: string }>;
};

export default async function TagPostsPage({ params }: TagPostsPageProps) {
  const { tagName } = await params;
  const posts = await fetchPostsByTagName(tagName);

  return <PostsByTagScreen tagName={tagName} posts={posts} />;
}
