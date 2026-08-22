"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Article,
  ChatCircle,
  Eye,
  Fire,
  Folder,
  PenNib,
  User,
} from "@phosphor-icons/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button, Card } from "@heroui/react";
import { AsyncSection } from "../feedback/AsyncSection";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { ChartSkeleton, KPICardSkeletonRow } from "../feedback/StudioSkeleton";
import { getMyCommentCount } from "../../data/commentQueryFunctions";
import { getMyPosts } from "../../data/postQueryFunctions";
import { POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Post } from "../../types";
import {
  calculateReadingTime,
  convertToText,
  formatData,
} from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import { cn } from "../../lib/cn";

type Period = "7d" | "30d" | "all";

const ACCENT = "oklch(0.508 0.118 175)";

function computePublishingStreak(posts: Post[]): number {
  if (!posts.length) return 0;

  const daySet = new Set(
    posts
      .filter((post) => post.createdAt)
      .map((post) => new Date(post.createdAt!).toISOString().slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  const todayKey = cursor.toISOString().slice(0, 10);
  if (!daySet.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function filterByPeriod(posts: Post[], period: Period): Post[] {
  if (period === "all") return posts;
  const days = period === "7d" ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return posts.filter(
    (post) => post.createdAt && new Date(post.createdAt).getTime() >= cutoff
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-paper px-3 py-2 shadow-md">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium text-ink">
        {payload[0].value} {payload[0].value === 1 ? "post" : "posts"}
      </p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <div className="rounded-full bg-accent/10 p-2 text-accent">{icon}</div>
      </div>
    </Card>
  );
}

export default function UserDashboardView() {
  const [period, setPeriod] = useState<Period>("30d");

  const { isLoading, isError, data: posts } = useQuery({
    queryKey: [POST_DATA, { filterByAuthor: true }],
    queryFn: getMyPosts,
  });

  const { data: commentCount = 0 } = useQuery({
    queryKey: ["author-comment-count"],
    queryFn: getMyCommentCount,
    enabled: Boolean(posts),
  });

  const filteredPosts = useMemo(
    () => filterByPeriod((posts ?? []) as Post[], period),
    [posts, period]
  );

  const chartData = useMemo(
    () => (filteredPosts.length ? formatData(filteredPosts, "createdAt") : []),
    [filteredPosts]
  );

  const stats = useMemo(() => {
    const allPosts = (posts ?? []) as Post[];
    const estimatedReads = allPosts.reduce((sum, post) => {
      const minutes = calculateReadingTime(convertToText(post.description));
      return sum + minutes * 85;
    }, 0);

    return {
      totalArticles: allPosts.length,
      totalComments: commentCount,
      estimatedReads,
      streak: computePublishingStreak(allPosts),
    };
  }, [posts, commentCount]);

  const recentStories = useMemo(() => {
    return [...((posts ?? []) as Post[])]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() -
          new Date(a.createdAt ?? 0).getTime()
      )
      .slice(0, 5);
  }, [posts]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Your writing cockpit. Track momentum and jump back into drafts.
        </p>
      </div>

      {isError ? (
        <ErrorState />
      ) : (
        <>
          <AsyncSection
            isLoading={isLoading}
            skeleton={<KPICardSkeletonRow />}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total Articles"
                value={stats.totalArticles}
                icon={<Article className="size-5" weight="duotone" />}
              />
              <KpiCard
                label="Total Comments"
                value={stats.totalComments}
                icon={<ChatCircle className="size-5" weight="duotone" />}
              />
              <KpiCard
                label="Estimated Reads"
                value={stats.estimatedReads.toLocaleString()}
                icon={<Eye className="size-5" weight="duotone" />}
              />
              <KpiCard
                label="Publishing Streak"
                value={`${stats.streak}d`}
                icon={<Fire className="size-5" weight="duotone" />}
              />
            </div>
          </AsyncSection>

          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <AsyncSection
              isLoading={isLoading}
              skeleton={<ChartSkeleton />}
            >
              <Card className="p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-medium">Engagement over time</h2>
                  <div className="flex gap-1 rounded-full border border-border p-0.5">
                    {(["7d", "30d", "all"] as Period[]).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPeriod(key)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          period === key
                            ? "bg-accent text-accent-foreground"
                            : "text-muted hover:text-ink"
                        )}
                      >
                        {key === "all" ? "All" : key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {chartData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="postsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="var(--color-border)"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                        axisLine={{ stroke: "var(--color-border)" }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={ACCENT}
                        fill="url(#postsGradient)"
                        strokeWidth={2}
                        className="dark:[&_path]:stroke-[oklch(0.777_0.152_175)]"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-16 text-center text-sm text-muted">
                    No posts in this period yet. Publish your first story to see trends.
                  </p>
                )}
              </Card>
            </AsyncSection>

            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
                  Quick Actions
                </h2>
                <div className="mt-3 space-y-2">
                  <Link href="/user/posts/create">
                    <Button
                      variant="secondary"
                      fullWidth
                      className="justify-start rounded-full"
                      size="sm"
                    >
                      <PenNib className="mr-2 size-4" />
                      Write New Post
                    </Button>
                  </Link>
                  <Link href="/user/profile">
                    <Button
                      variant="ghost"
                      fullWidth
                      className="justify-start rounded-full"
                      size="sm"
                    >
                      <User className="mr-2 size-4" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button
                      variant="ghost"
                      fullWidth
                      className="justify-start rounded-full"
                      size="sm"
                    >
                      <Folder className="mr-2 size-4" />
                      Explore Categories
                    </Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
                    Recent Stories
                  </h2>
                  <Link
                    href="/user/posts"
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <AsyncSection
                  isLoading={isLoading}
                  skeleton={<ExpandedPostSkeletonList count={5} />}
                >
                  {recentStories.length ? (
                    <ul className="space-y-3">
                      {recentStories.map((post) => (
                        <li key={post.id}>
                          <Link
                            href={`/user/posts/edit/${post.id}`}
                            className="group block rounded-lg border border-border px-3 py-2 transition-colors hover:border-accent/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            <p className="line-clamp-1 text-sm font-medium group-hover:text-accent">
                              {post.title}
                            </p>
                            {post.createdAt ? (
                              <p className="mt-0.5 text-xs text-muted">
                                {getPostFormattedDate(post.createdAt)}
                              </p>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted">No stories yet.</p>
                  )}
                </AsyncSection>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
