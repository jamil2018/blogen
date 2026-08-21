import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostProse from "../../../../../components/post/PostProse";
import { getPostById } from "../../../../../actions/posts";
import { requireUser } from "../../../../../lib/db/auth";
import { createClient } from "../../../../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Preview | Blogen",
};

type PreviewPageProps = {
  params: Promise<{ postId: string }>;
};

export default async function PreviewPostPage({ params }: PreviewPageProps) {
  const { postId } = await params;
  const { user } = await requireUser();

  let post;
  try {
    post = await getPostById(postId);
  } catch {
    notFound();
  }

  const authorId =
    typeof post.author === "string" ? post.author : post.author.id;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (authorId !== user.id && !profile?.is_admin) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-amber-700">
        Preview · {post.status ?? "draft"} — not a public URL unless published
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {post.title || "Untitled"}
      </h1>
      <p className="mt-3 text-muted">{post.summary}</p>
      <PostProse html={post.description || "<p></p>"} className="mt-8" />
    </div>
  );
}
