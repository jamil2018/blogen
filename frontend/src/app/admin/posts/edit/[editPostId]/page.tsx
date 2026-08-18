"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import PostForm from "../../../../../components/studio/PostForm";

type EditPageProps = {
  params: Promise<{ editPostId: string }>;
};

export default function AdminEditPostPage({ params }: EditPageProps) {
  const { editPostId } = use(params);
  const router = useRouter();
  return (
    <PostForm
      mode="edit"
      postId={editPostId}
      redirectPath="/admin/posts"
      onSuccess={() => router.push("/admin/posts?edited=1")}
    />
  );
}
