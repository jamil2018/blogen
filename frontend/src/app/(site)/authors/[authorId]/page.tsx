import AuthorProfileScreen from "../../../../screens/general/AuthorProfileScreen";
import { fetchPostsByAuthorId, fetchUserById } from "../../../../lib/api";

type AuthorPageProps = {
  params: Promise<{ authorId: string }>;
};

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorId } = await params;
  const [author, posts] = await Promise.all([
    fetchUserById(authorId),
    fetchPostsByAuthorId(authorId),
  ]);

  return (
    <AuthorProfileScreen authorId={authorId} author={author} posts={posts} />
  );
}
