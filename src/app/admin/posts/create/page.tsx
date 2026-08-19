"use client";

import { useRouter } from "next/navigation";
import PostForm from "../../../../components/studio/PostForm";

export default function AdminCreatePostPage() {
  const router = useRouter();
  return (
    <PostForm
      mode="create"
      redirectPath="/admin/posts"
      onSuccess={() => router.push("/admin/posts?created=1")}
    />
  );
}
