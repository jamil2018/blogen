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
    <div className={cn("flex gap-4 border-b border-border py-5", className)}>
      <Skeleton className="size-24 shrink-0 rounded-xl sm:size-28" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-20" />
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
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "space-y-3 rounded-xl border border-border p-5",
            i === 0 && "sm:col-span-2 lg:row-span-2"
          )}
        >
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AuthorCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-3 rounded-xl border border-border p-5",
        className
      )}
    >
      <Skeleton className="size-16 rounded-full" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-36" />
      <Skeleton className="h-5 w-20 rounded-full" />
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
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-10 w-4/5" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
      <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
