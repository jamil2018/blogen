import PostsByTagView from "../../../../../../components/pages/PostsByTagView";
import { fetchPostsByTagName } from "../../../../../../lib/api";

type TagPostsPageProps = {
  params: Promise<{ tagName: string }>;
};

export default async function TagPostsPage({ params }: TagPostsPageProps) {
  const { tagName } = await params;
  const decoded = decodeURIComponent(tagName);
  const posts = await fetchPostsByTagName(decoded);
  return <PostsByTagView tagName={decoded} posts={posts} />;
}
