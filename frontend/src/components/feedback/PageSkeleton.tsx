import { Skeleton } from "@heroui/react";
import { cn } from "../../lib/cn";

export function PostCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function PostCardSkeletonGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ExpandedPostSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4 border-b border-border py-6", className)}>
      <Skeleton className="size-24 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ExpandedPostSkeletonList({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ExpandedPostSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategorySkeletonGrid({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-lg" />
      ))}
    </div>
  );
}

export function AuthorCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center space-y-3 p-4", className)}>
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function AuthorCardSkeletonGrid({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 md:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <AuthorCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PostDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-6 py-8", className)}>
      <Skeleton className="h-10 w-4/5" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
