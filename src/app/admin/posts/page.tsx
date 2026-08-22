import { Suspense } from "react";
import { TableSkeleton } from "../../../components/feedback/StudioSkeleton";
import PostsTableView from "../../../components/studio/PostsTableView";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={<TableSkeleton />}
    >
      <PostsTableView basePath="/admin/posts" requireAdmin />
    </Suspense>
  );
}
