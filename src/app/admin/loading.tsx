import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "../../components/feedback/StudioSkeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
