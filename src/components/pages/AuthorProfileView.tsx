"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Article,
  ChatCircle,
  FacebookLogo,
  LinkedinLogo,
  MagnifyingGlass,
  Tag,
  TwitterLogo,
} from "@phosphor-icons/react";
import { Avatar, Button, Input, Skeleton } from "@heroui/react";
import PostCard from "../post/PostCard";
import Reveal from "../motion/Reveal";
import ErrorState from "../feedback/ErrorState";
import EmptyState from "../feedback/EmptyState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getAllPostsByAuthorId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import {
  POST_DATA,
  SINGLE_AUTHOR_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import type { Post, User } from "../../types";
import FollowButton from "../follow/FollowButton";

export default function AuthorProfileView({
  authorId: authorIdProp,
  author,
  posts,
}: {
  authorId?: string;
  author?: User;
  posts?: Post[];
}) {
  const params = useParams();
  const authorId = authorIdProp ?? (params?.authorId as string);
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasAuthor = author !== undefined;
  const {
    data: queriedAuthor,
    isLoading: authorLoading,
    isError: authorError,
  } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, authorId],
    queryFn: ({ queryKey }) => getUserById(queryKey[1] as string),
    enabled: !hasAuthor && Boolean(authorId),
  });
  const authorData = hasAuthor ? author : queriedAuthor;

  const hasPosts = posts !== undefined;
  const {
    data: queriedPosts,
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: [POST_DATA, authorId],
    queryFn: ({ queryKey }) => getAllPostsByAuthorId(queryKey[1] as string),
    enabled: !hasPosts && Boolean(authorId),
  });
  const postList = hasPosts ? posts : queriedPosts;

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !postList) return postList ?? [];
    return postList.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.summary?.toLowerCase().includes(q)
    );
  }, [postList, search]);

  const stats = useMemo(() => {
    const articles = postList?.length ?? 0;
    const comments =
      postList?.reduce((sum, post) => sum + (post.comments?.length ?? 0), 0) ?? 0;
    const topics = new Set<string>();
    postList?.forEach((post) => {
      const cat =
        typeof post.category === "string"
          ? post.category
          : post.category?.title;
      if (cat) topics.add(cat);
      post.tags?.forEach((tag) => topics.add(tag));
    });
    return { articles, comments, topics: topics.size };
  }, [postList]);

  if (authorLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <ExpandedPostSkeletonList count={5} />
      </div>
    );
  }

  if (authorError || !authorData) return <ErrorState />;

  const initials = getAuthorNameInitials(authorData.name).filter(Boolean).join("");

  return (
    <div className="space-y-10">
      <Reveal>
        <header className="relative overflow-hidden rounded-2xl border border-border">
          <div className="auth-panel-texture absolute inset-0" aria-hidden />
          <div className="auth-panel-editorial relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar size="lg" className="size-20 shrink-0 sm:size-24">
                {authorData.imageURL ? (
                  <Avatar.Image src={authorData.imageURL} alt={authorData.name} />
                ) : (
                  <Avatar.Fallback className="text-lg">{initials}</Avatar.Fallback>
                )}
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Author profile
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tighter text-ink sm:text-4xl">
                  {authorData.name}
                </h1>
                {authorData.bio ? (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                    {authorData.bio}
                  </p>
                ) : null}
                {authorData.expertiseTopics?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {authorData.expertiseTopics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-muted dark:bg-zinc-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <FollowButton targetType="author" targetId={authorData.id} />
                  {(authorData.websiteUrl ||
                    authorData.facebookId ||
                    authorData.twitterId ||
                    authorData.linkedinId) && (
                    <Button size="sm" variant="ghost" className="rounded-full" isDisabled>
                      Contact via public links
                    </Button>
                  )}
                  {authorData.websiteUrl ? (
                    <a
                      href={authorData.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Website"
                    >
                      <Button isIconOnly variant="ghost" size="sm" aria-label="Website">
                        <Article className="size-4" />
                      </Button>
                    </a>
                  ) : null}
                  {authorData.facebookId ? (
                    <a
                      href={`https://www.facebook.com/${authorData.facebookId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Facebook"
                    >
                      <Button isIconOnly variant="ghost" size="sm" aria-label="Facebook">
                        <FacebookLogo className="size-4" />
                      </Button>
                    </a>
                  ) : null}
                  {authorData.twitterId ? (
                    <a
                      href={`https://twitter.com/${authorData.twitterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Twitter"
                    >
                      <Button isIconOnly variant="ghost" size="sm" aria-label="Twitter">
                        <TwitterLogo className="size-4" />
                      </Button>
                    </a>
                  ) : null}
                  {authorData.linkedinId ? (
                    <a
                      href={`https://www.linkedin.com/in/${authorData.linkedinId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                    >
                      <Button isIconOnly variant="ghost" size="sm" aria-label="LinkedIn">
                        <LinkedinLogo className="size-4" />
                      </Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-1.5 text-muted sm:justify-start">
                  <Article className="size-4" aria-hidden />
                  <span className="text-xs uppercase tracking-wide">Articles</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-ink">{stats.articles}</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-1.5 text-muted sm:justify-start">
                  <ChatCircle className="size-4" aria-hidden />
                  <span className="text-xs uppercase tracking-wide">Comments</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-ink">{stats.comments}</p>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center gap-1.5 text-muted sm:justify-start">
                  <Tag className="size-4" aria-hidden />
                  <span className="text-xs uppercase tracking-wide">Topics</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-ink">{stats.topics}</p>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Published articles
          </h2>
          <div className="relative max-w-xs flex-1">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              aria-label="Search author articles"
            />
          </div>
        </div>

        {postsLoading ? (
          <ExpandedPostSkeletonList count={5} />
        ) : postsError ? (
          <ErrorState />
        ) : !filteredPosts.length ? (
          <EmptyState
            title={search ? "No matching articles" : "No articles yet"}
            description={
              search
                ? "Try a different search term."
                : "This author has not published any stories yet."
            }
          >
            {!search ? (
              <Link href="/register">
                <Button variant="primary" className="rounded-full">
                  Start writing
                </Button>
              </Link>
            ) : null}
          </EmptyState>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {filteredPosts.map((post: Post, index) => (
              <Reveal key={post.id} delay={index * 0.03}>
                <PostCard post={post} variant="featured" />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
