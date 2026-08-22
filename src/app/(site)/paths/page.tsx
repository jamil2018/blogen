"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react";
import { Card } from "@heroui/react";
import PageHero from "../../../components/layout/PageHero";
import EmptyState from "../../../components/feedback/EmptyState";
import { ExpandedPostSkeletonList } from "../../../components/feedback/PageSkeleton";
import { getReadingPaths } from "../../../actions/phase2";

export default function ReadingPathsIndexPage() {
  const { data: paths = [], isLoading } = useQuery({
    queryKey: ["reading-paths"],
    queryFn: getReadingPaths,
  });

  return (
    <>
      <PageHero
        eyebrow="Discovery"
        title="Reading paths"
        description="Curated multi-post sequences with explicit relationships — introduces, extends, applies, or challenges."
      />
      {isLoading ? (
        <ExpandedPostSkeletonList count={3} />
      ) : paths.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {paths.map((path) => (
            <Link key={path.id} href={`/paths/${path.slug}`}>
              <Card className="h-full p-4 transition-shadow hover:shadow-md">
                <Card.Header>
                  <Card.Title>{path.title}</Card.Title>
                  <Card.Description>{path.purpose}</Card.Description>
                </Card.Header>
                <div className="mt-2 flex gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    ~{path.estimatedMinutes} min
                  </span>
                  <span>{path.itemCount} posts</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No reading paths yet"
          description="Published paths will appear here as editors curate them."
          actionHref="/explore"
          actionLabel="Explore posts"
        />
      )}
    </>
  );
}
