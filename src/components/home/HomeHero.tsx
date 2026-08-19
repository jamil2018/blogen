"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";

type HomeHeroProps = {
  post?: Post;
  className?: string;
};

const revealEase = [0.16, 1, 0.3, 1] as const;

function revealTransition(index: number) {
  return {
    delay: 0.15 + index * 0.08,
    duration: 0.6,
    ease: revealEase,
  };
}

export default function HomeHero({ post, className }: HomeHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  const categoryName = post
    ? typeof post.category === "string"
      ? post.category
      : post.category?.title
    : undefined;

  return (
    <section
      className={cn("full-bleed relative min-h-[85dvh] overflow-hidden", className)}
    >
      {post?.imageURL ? (
        prefersReducedMotion ? (
          <Image
            src={post.imageURL}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: revealEase }}
          >
            <Image
              src={post.imageURL}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        )
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900" />
      )}

      <div className="hero-scrim-top pointer-events-none absolute inset-x-0 top-0 h-32" />
      <div className="hero-scrim-bottom pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />

      <div className="relative flex min-h-[85dvh] flex-col justify-end px-4 pb-12 pt-24 sm:px-8 md:pb-16 lg:px-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl space-y-4 md:space-y-5">
            {categoryName ? (
              prefersReducedMotion ? (
                <p className="text-sm font-medium text-white/80">{categoryName}</p>
              ) : (
                <motion.p
                  className="text-sm font-medium text-white/80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={revealTransition(0)}
                >
                  {categoryName}
                </motion.p>
              )
            ) : null}

            {prefersReducedMotion ? (
              <h1 className="text-4xl font-semibold tracking-tighter text-white md:text-6xl">
                Blogen is a place where creative minds grow
              </h1>
            ) : (
              <motion.h1
                className="text-4xl font-semibold tracking-tighter text-white md:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={revealTransition(1)}
              >
                Blogen is a place where creative minds grow
              </motion.h1>
            )}

            {prefersReducedMotion ? (
              <p className="text-base text-white/85 md:text-lg">
                Share your knowledge and get inspired.{" "}
                {post ? (
                  <Link
                    href={`/posts/${post.id}`}
                    className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    {post.title}
                  </Link>
                ) : null}
              </p>
            ) : (
              <motion.p
                className="text-base text-white/85 md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={revealTransition(2)}
              >
                Share your knowledge and get inspired.{" "}
                {post ? (
                  <Link
                    href={`/posts/${post.id}`}
                    className="font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white"
                  >
                    {post.title}
                  </Link>
                ) : null}
              </motion.p>
            )}

            {prefersReducedMotion ? (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/register">
                  <Button className="rounded-full px-6" variant="primary">
                    Start Sharing
                  </Button>
                </Link>
                {post ? (
                  <Link href={`/posts/${post.id}`}>
                    <Button
                      className="rounded-full border-white/40 px-6 text-white"
                      variant="ghost"
                    >
                      Read the latest
                    </Button>
                  </Link>
                ) : null}
              </div>
            ) : (
              <motion.div
                className="flex flex-wrap items-center gap-3 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={revealTransition(3)}
              >
                <Link href="/register">
                  <Button className="rounded-full px-6" variant="primary">
                    Start Sharing
                  </Button>
                </Link>
                {post ? (
                  <Link href={`/posts/${post.id}`}>
                    <Button
                      className="rounded-full border-white/40 px-6 text-white"
                      variant="ghost"
                    >
                      Read the latest
                    </Button>
                  </Link>
                ) : null}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
