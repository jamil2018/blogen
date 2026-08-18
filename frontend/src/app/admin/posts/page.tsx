import { Suspense } from "react";
import AdminPosts from "../../../screens/admin/posts/AdminPosts";

export default function AdminPostsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPosts />
    </Suspense>
  );
}
