import { Suspense } from "react";
import UserPosts from "../../../screens/user/posts/UserPosts";

export default function UserPostsPage() {
  return (
    <Suspense fallback={null}>
      <UserPosts />
    </Suspense>
  );
}
