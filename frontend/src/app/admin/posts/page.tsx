import { Suspense } from "react";
import { Spinner } from "@heroui/react";
import PostsTableView from "../../../components/studio/PostsTableView";

export const dynamic = "force-dynamic";

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <PostsTableView basePath="/admin/posts" requireAdmin />
    </Suspense>
  );
}
