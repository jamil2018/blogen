import { Skeleton } from "@heroui/react";
import { cn } from "../../lib/cn";
import {
  ExpandedPostSkeletonList,
  PostCardSkeletonGrid,
  PostDetailSkeleton,
} from "./PageSkeleton";

export function GenericPageFallback({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-8", className)}>
      <div className="space-y-3">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-10 w-2/3 sm:h-12" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-4/5 max-w-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

function HomeHeroSkeleton() {
  return (
    <section className="full-bleed relative min-h-[85dvh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
      <div className="hero-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />
      <div className="relative flex min-h-[85dvh] flex-col justify-end px-4 pb-12 pt-24 sm:px-8 md:pb-16 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl space-y-4 md:space-y-5">
            <Skeleton className="h-4 w-20 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-full rounded-lg bg-white/20 md:h-16" />
            <Skeleton className="h-5 w-4/5 rounded-lg bg-white/20 md:h-6" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
              <Skeleton className="h-10 w-36 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePageFallback({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <HomeHeroSkeleton />
      <div className="mb-12 mt-12">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-4 w-64" />
        </div>
        <PostCardSkeletonGrid count={6} />
      </div>
    </div>
  );
}

export function PostDetailRouteFallback({
  className,
}: {
  className?: string;
}) {
  return <PostDetailSkeleton className={className} />;
}

export function SearchResultsRouteFallback({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-8", className)}>
      <div className="relative max-w-xl">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <ExpandedPostSkeletonList count={5} />
    </div>
  );
}

function AuthorProfileHeaderSkeleton() {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border">
      <div className="auth-panel-texture absolute inset-0" aria-hidden />
      <div className="auth-panel-editorial relative px-6 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Skeleton className="size-20 shrink-0 rounded-full sm:size-24" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-2/3 sm:h-12" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-4/5 max-w-xl" />
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="mx-auto h-3 w-16 sm:mx-0" />
              <Skeleton className="mx-auto h-8 w-10 sm:mx-0" />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export function AuthorProfileRouteFallback({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("space-y-10", className)}>
      <AuthorProfileHeaderSkeleton />
      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
        </div>
        <ExpandedPostSkeletonList count={5} />
      </section>
    </div>
  );
}
