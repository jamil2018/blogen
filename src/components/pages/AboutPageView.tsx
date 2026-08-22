"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Skeleton } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import AuthorCard from "../post/AuthorCard";
import Reveal from "../motion/Reveal";
import ErrorState from "../feedback/ErrorState";
import { AuthorCardSkeletonGrid } from "../feedback/PageSkeleton";
import { getLatestUsers } from "../../data/userQueryFunctions";
import { getPlatformStats } from "../../data/postQueryFunctions";
import { DETAILED_USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { User } from "../../types";

const PHILOSOPHY = [
  {
    title: "Clarity of Thought",
    description:
      "Every article should help readers understand something new. We prioritize clear writing over clever phrasing.",
  },
  {
    title: "Community-Driven",
    description:
      "Blogen grows through the voices of its writers. Share knowledge, respond to ideas, and build conversations together.",
  },
  {
    title: "Open Knowledge",
    description:
      "Ideas deserve an audience. We make it simple for anyone to publish, discover, and learn from thoughtful content.",
  },
];

export default function AboutPageView({ users }: { users?: User[] }) {
  const prefersReducedMotion = useReducedMotion();
  const hasUsers = users !== undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: [DETAILED_USER_DATA],
    queryFn: getLatestUsers,
    enabled: !hasUsers,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const userList = hasUsers ? users : data;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: getPlatformStats,
    refetchOnWindowFocus: false,
  });

  const metrics = [
    {
      label: "Community of Writers",
      value: stats?.authorsWithPosts,
    },
    {
      label: "Articles Published",
      value: stats?.publishedPosts,
    },
    {
      label: "Topics Covered",
      value: stats?.categoriesWithPosts,
    },
  ];

  const heroContent = (
    <div className="grid items-end gap-10 lg:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Our manifesto
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tighter text-ink sm:text-5xl lg:text-6xl">
          Where durable knowledge finds its audience
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted md:text-lg">
          Blogen is a knowledge-oriented publishing community. Write with clarity,
          connect ideas across topics, and grow a body of work readers can trust.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border bg-paper p-4 text-center"
          >
            <p className="text-2xl font-semibold text-accent sm:text-3xl">
              {statsLoading ? (
                <Skeleton className="mx-auto h-8 w-12 sm:h-9" />
              ) : (
                metric.value ?? 0
              )}
            </p>
            <p className="mt-1 text-xs text-muted">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <section className="full-bleed auth-panel-editorial relative mb-16 px-4 py-16 sm:px-8 lg:px-12">
        <div className="auth-panel-texture absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          {prefersReducedMotion ? (
            heroContent
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {heroContent}
            </motion.div>
          )}
        </div>
      </section>

      <Reveal>
        <section className="mb-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            The Blogen philosophy
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Three principles guide everything we build.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PHILOSOPHY.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-border p-6 transition-shadow hover:shadow-sm">
                  <span className="text-sm font-mono text-accent">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.06}>
        <section className="relative mb-16 overflow-hidden rounded-2xl border border-border p-8 text-center sm:p-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.508 0.118 175 / 0.15), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Ready to share your perspective?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-muted">
              Join writers who publish thoughtful articles on Blogen every week.
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <Button variant="primary" size="lg" className="rounded-full px-8">
                Start Writing
              </Button>
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Meet the community
          </h2>
          <p className="mt-2 text-muted">
            Active contributors shaping conversations on Blogen.
          </p>
          <div className="mt-8">
            {isLoading ? (
              <AuthorCardSkeletonGrid count={6} />
            ) : isError ? (
              <ErrorState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {userList?.map((user: User, index) => (
                  <Reveal key={user.id} delay={index * 0.03}>
                    <AuthorCard author={user} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>
    </>
  );
}
