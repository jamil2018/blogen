"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import PostForm from "../../../../../components/studio/PostForm";

type EditPageProps = {
  params: Promise<{ editPostId: string }>;
};

export default function UserEditPostPage({ params }: EditPageProps) {
  const { editPostId } = use(params);
  const router = useRouter();
  return (
    <PostForm
      mode="edit"
      postId={editPostId}
      redirectPath="/user/posts"
      onSuccess={() => router.push("/user/posts?edited=1")}
    />
  );
}
