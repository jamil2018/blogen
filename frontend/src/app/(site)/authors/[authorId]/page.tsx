import AuthorProfileView from "../../../../components/pages/AuthorProfileView";
import {
  fetchPostsByAuthorId,
  fetchUserById,
} from "../../../../lib/api";

type AuthorPageProps = {
  params: Promise<{ authorId: string }>;
};

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const { authorId } = await params;
  const [author, posts] = await Promise.all([
    fetchUserById(authorId),
    fetchPostsByAuthorId(authorId),
  ]);

  return (
    <AuthorProfileView authorId={authorId} author={author} posts={posts} />
  );
}
