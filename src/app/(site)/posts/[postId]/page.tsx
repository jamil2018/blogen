import type { Metadata } from "next";
import PostDetailView from "../../../../components/pages/PostDetailView";
import { fetchPostById, fetchUserById } from "../../../../lib/api";
import type { Post } from "../../../../types";

type PostPageProps = {
  params: Promise<{ postId: string }>;
};

function getAuthorId(post: Post | undefined): string | undefined {
  if (!post) return undefined;
  return typeof post.author === "string" ? post.author : post.author?._id;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;
  const post = await fetchPostById(postId);
  if (!post) return { title: "Blogen" };
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;
  const post = await fetchPostById(postId);
  const authorId = getAuthorId(post);
  const author = authorId ? await fetchUserById(authorId) : undefined;

  return <PostDetailView postId={postId} post={post} author={author} />;
}
