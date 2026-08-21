"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { MagnifyingGlass, TrendUp } from "@phosphor-icons/react";
import { Card, Chip, Input } from "@heroui/react";
import PageHero from "../layout/PageHero";
import Reveal from "../motion/Reveal";
import ErrorState from "../feedback/ErrorState";
import { CategorySkeletonGrid } from "../feedback/PageSkeleton";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { getCategoryPostCounts } from "../../data/postQueryFunctions";
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Category } from "../../types";
import { cn } from "../../lib/cn";
import FollowButton from "../follow/FollowButton";

export default function CategoryListView({
  categories,
}: {
  categories?: Category[];
}) {
  const [query, setQuery] = useState("");
  const hasCategories = categories !== undefined;

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
    enabled: !hasCategories,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const list = hasCategories ? categories : data;

  const { data: counts } = useQuery({
    queryKey: ["category-post-counts"],
    queryFn: getCategoryPostCounts,
    refetchOnWindowFocus: false,
  });

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    counts?.forEach((row) => map.set(row.categoryId, row.postCount));
    return map;
  }, [counts]);

  const enriched = useMemo(() => {
    if (!list) return [];
    return list
      .map((cat) => ({
        ...cat,
        postCount: countMap.get(cat.id) ?? 0,
      }))
      .sort((a, b) => b.postCount - a.postCount);
  }, [list, countMap]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((cat) => cat.title.toLowerCase().includes(q));
  }, [enriched, query]);

  const trending = enriched.filter((c) => c.postCount > 0).slice(0, 3);

  const bentoSpans = [
    "sm:col-span-2 sm:row-span-2",
    "sm:col-span-1",
    "sm:col-span-1",
    "",
    "sm:col-span-2",
    "",
  ];

  return (
    <>
      <PageHero
        eyebrow="Explore"
        title="Categories"
        description="Browse topics across the Blogen community. Find the conversations that matter to you."
      />

      {trending.length > 0 ? (
        <Reveal className="mb-10">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <TrendUp className="size-4 text-accent" aria-hidden />
            Trending topics
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {trending.map((cat) => (
              <Link
                key={cat.id}
                href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
              >
                <Chip variant="soft" className="rounded-full capitalize">
                  {cat.title}
                  <span className="ml-1 text-muted">({cat.postCount})</span>
                </Chip>
              </Link>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={0.04}>
        <div className="relative mb-8 max-w-md">
          <MagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            placeholder="Search categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Search categories"
          />
        </div>
      </Reveal>

      {isLoading || isFetching ? (
        <CategorySkeletonGrid count={8} />
      ) : isError ? (
        <ErrorState />
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat, index) => (
            <Reveal key={cat.id} delay={index * 0.03}>
              <div
                className={cn(
                  "group relative h-full",
                  bentoSpans[index % bentoSpans.length]
                )}
              >
                <Link
                  href={`/posts/search/categories/${encodeURIComponent(cat.title)}`}
                  className="block h-full"
                >
                  <Card className="flex h-full flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                        {cat.postCount}{" "}
                        {cat.postCount === 1 ? "article" : "articles"}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold capitalize tracking-tight text-ink transition-colors group-hover:text-accent">
                        {cat.title}
                      </h2>
                    </div>
                  </Card>
                </Link>
                <div className="absolute bottom-4 right-4">
                  <FollowButton targetType="category" targetId={cat.id} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-muted">
          No categories match your search.
        </p>
      )}
    </>
  );
}
