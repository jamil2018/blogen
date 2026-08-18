"use client";

import { useRouter } from "next/navigation";
import PostForm from "../../../../components/studio/PostForm";

export default function UserCreatePostPage() {
  const router = useRouter();
  return (
    <PostForm
      mode="create"
      redirectPath="/user/posts"
      onSuccess={() => router.push("/user/posts?created=1")}
    />
  );
}
