import { Card, Skeleton } from "@heroui/react";
import { cn } from "../../lib/cn";
import { ExpandedPostSkeletonList } from "./PageSkeleton";

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-8 w-48 max-w-full rounded-lg" />
      <Skeleton className="h-4 w-72 max-w-full rounded-md" />
    </div>
  );
}

export function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        <Skeleton className="size-9 shrink-0 rounded-full" />
      </div>
    </Card>
  );
}

export function KPICardSkeletonRow({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4 md:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-8 w-[7.5rem] rounded-full" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </Card>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border",
        className
      )}
    >
      <div
        className="grid gap-3 border-b border-border bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full max-w-24 rounded-full" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid items-center gap-3 px-4 py-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) =>
              colIndex === 0 ? (
                <div key={colIndex} className="flex min-w-0 items-center gap-3">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full max-w-[12rem] rounded-md" />
                    <Skeleton className="h-3 w-full max-w-[8rem] rounded-md" />
                  </div>
                </div>
              ) : (
                <Skeleton
                  key={colIndex}
                  className={cn(
                    "h-4 rounded-md",
                    colIndex === columns - 1 ? "w-20" : "w-full max-w-28"
                  )}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({
  fields = 6,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-8 lg:grid-cols-[320px_1fr]", className)}>
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50">
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <div className="space-y-4 p-6 text-center">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-5 w-32 rounded-md" />
          <Skeleton className="mx-auto h-3 w-full max-w-[14rem] rounded-md" />
          <Skeleton className="mx-auto h-3 w-full max-w-[12rem] rounded-md" />
          <div className="flex justify-center gap-2 pt-1">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>
      </Card>

      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function PublicationPanelSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <Skeleton className="h-6 w-40 rounded-lg" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton
            className={cn(
              "w-full rounded-lg",
              i >= fields - 2 ? "h-24" : "h-10"
            )}
          />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-full" />
    </section>
  );
}

function StudioSidePanelSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-4", className)}>
      <Skeleton className="h-3 w-28 rounded-full" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-9 w-full rounded-full" />
        <Skeleton className="h-9 w-full rounded-full" />
        <Skeleton className="h-9 w-full rounded-full" />
      </div>
    </Card>
  );
}

export function StudioPageFallback({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <PageHeaderSkeleton />
      <KPICardSkeletonRow />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <ChartSkeleton />
        <div className="space-y-4">
          <StudioSidePanelSkeleton />
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
            <ExpandedPostSkeletonList count={3} />
          </Card>
        </div>
      </div>
    </div>
  );
}
