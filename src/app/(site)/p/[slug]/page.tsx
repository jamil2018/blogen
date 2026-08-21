import { redirect } from "next/navigation";
import { getPostBySlug } from "../../../../actions/posts";
import PostDetailView from "../../../../components/pages/PostDetailView";
import { fetchUserById } from "../../../../lib/api";
import type { Post } from "../../../../types";
import type { Metadata } from "next";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

function getAuthorId(post: Post | undefined): string | undefined {
  if (!post) return undefined;
  return typeof post.author === "string" ? post.author : post.author?.id;
}

export async function generateMetadata({
  params,
}: Readonly<SlugPageProps>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Blogen" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.summary,
  };
}

export default async function SlugPostPage({ params }: Readonly<SlugPageProps>) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    redirect("/");
  }

  // Old slug → current slug redirect
  if (post.slug && post.slug !== slug) {
    redirect(`/p/${post.slug}`);
  }

  const authorId = getAuthorId(post);
  const author = authorId ? await fetchUserById(authorId) : undefined;

  return <PostDetailView postId={post.id} post={post} author={author} />;
}
