"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock } from "@phosphor-icons/react";
import {
  Avatar,
  Chip,
  Modal,
  Separator,
} from "@heroui/react";
import PostProse from "../post/PostProse";
import PostTags from "../post/PostTags";
import CommentThread from "../post/CommentThread";
import PostCard from "../post/PostCard";
import AuthorBioCard from "../post/AuthorBioCard";
import ReadingProgressBar from "../layout/ReadingProgressBar";
import ShareBar from "../layout/ShareBar";
import Reveal from "../motion/Reveal";
import ErrorState from "../feedback/ErrorState";
import { PostDetailSkeleton } from "../feedback/PageSkeleton";
import { getPostById, getAllPostsByAuthorId, getRelatedPostsForId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import { getCommentsByPostId } from "../../data/commentQueryFunctions";
import {
  COMMENT_DATA,
  SINGLE_AUTHOR_DATA,
  SINGLE_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import {
  calculateReadingTime,
  convertToText,
  getAuthorNameInitials,
} from "../../utils/dataFormat";
import { getPostFormattedDate } from "../../utils/dateUtils";
import { extractHeadingToc } from "../../lib/posts/contracts";
import type { Post, User } from "../../types";
import DeleteCommentForm from "../post/DeleteCommentForm";
import EditCommentForm from "../post/EditCommentForm";
import FollowButton from "../follow/FollowButton";
import PostAnalyticsBeacon from "../post/PostAnalyticsBeacon";

type PostDetailViewProps = {
  postId?: string;
  post?: Post;
  author?: User;
};

export default function PostDetailView({
  postId: postIdProp,
  post,
  author,
}: PostDetailViewProps) {
  const params = useParams();
  const postId = postIdProp ?? (params?.postId as string);

  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [editCommentId, setEditCommentId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasPost = post !== undefined;
  const { isLoading: postLoading, data: queriedPost } = useQuery({
    queryKey: [SINGLE_POST_DATA, postId],
    queryFn: ({ queryKey }) => getPostById(queryKey[1] as string),
    enabled: !hasPost && Boolean(postId),
    refetchOnWindowFocus: false,
  });
  const data = hasPost ? post : queriedPost;

  const authorId =
    typeof data?.author === "string" ? data.author : data?.author?.id;
  const hasAuthor = author !== undefined;
  const { isLoading: authorLoading, data: queriedAuthor } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, authorId],
    queryFn: ({ queryKey }) => getUserById(queryKey[1] as string),
    enabled: !hasAuthor && Boolean(authorId),
    refetchOnWindowFocus: false,
  });
  const authorData = hasAuthor ? author : queriedAuthor;

  const {
    isLoading: commentsLoading,
    isFetching: commentsFetching,
    data: comments,
  } = useQuery({
    queryKey: [COMMENT_DATA, postId],
    queryFn: ({ queryKey }) => getCommentsByPostId(queryKey[1] as string),
    enabled: Boolean(postId),
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: relatedFromApi } = useQuery({
    queryKey: ["related-posts", postId],
    queryFn: () => getRelatedPostsForId(postId),
    enabled: Boolean(postId),
    refetchOnWindowFocus: false,
  });

  const { data: authorPosts } = useQuery({
    queryKey: ["author-posts", authorId],
    queryFn: () => getAllPostsByAuthorId(authorId as string),
    enabled: Boolean(authorId) && !relatedFromApi?.length,
    refetchOnWindowFocus: false,
  });

  const relatedPosts = useMemo(() => {
    if (relatedFromApi?.length) return relatedFromApi.slice(0, 3);
    return (
      authorPosts?.filter((p) => p.id !== postId).slice(0, 2) ?? []
    );
  }, [relatedFromApi, authorPosts, postId]);

  const toc = useMemo(
    () => (data ? extractHeadingToc(data.description) : []),
    [data]
  );

  if (postLoading || authorLoading) {
    return <PostDetailSkeleton />;
  }

  if (!data || !authorData) {
    return <ErrorState message="Post not found" />;
  }

  const authorObj =
    typeof data.author === "object" ? data.author : authorData;
  const initials = getAuthorNameInitials(authorObj.name ?? "")
    .filter(Boolean)
    .join("");
  const categoryName =
    typeof data.category === "string"
      ? data.category
      : data.category?.title;
  const categoryHref = categoryName
    ? `/posts/search/categories/${encodeURIComponent(categoryName)}`
    : undefined;
  const readingTime = calculateReadingTime(convertToText(data.description));

  return (
    <>
      <ReadingProgressBar targetId="article-content" postId={postId} />
      <PostAnalyticsBeacon
        postId={postId}
        authorId={authorObj?.id}
        publicationId={data.publicationId}
      />
      <ShareBar
        key={postId}
        postId={postId}
        title={data.title}
        commentCount={comments?.length ?? 0}
      />

      <article className="relative mx-auto max-w-3xl">
        <Reveal>
          <header className="space-y-5">
            {categoryName && categoryHref ? (
              <Link href={categoryHref}>
                <Chip
                  variant="soft"
                  className="rounded-full border border-border bg-zinc-100 capitalize dark:bg-zinc-800"
                >
                  {categoryName}
                </Chip>
              </Link>
            ) : null}

            <h1 className="text-3xl font-semibold tracking-tighter text-ink sm:text-4xl md:text-5xl">
              {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/authors/${authorObj.id}`}
                className="flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <Avatar size="sm">
                  {authorData.imageURL ? (
                    <Avatar.Image src={authorData.imageURL} alt={authorData.name} />
                  ) : (
                    <Avatar.Fallback>{initials}</Avatar.Fallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium text-ink">{authorObj.name}</span>
              </Link>
              <FollowButton targetType="author" targetId={authorObj.id} />
              {typeof data.category !== "string" && data.category?.id ? (
                <FollowButton
                  targetType="category"
                  targetId={data.category.id}
                  label="Follow topic"
                />
              ) : null}
              <span className="text-muted">·</span>
              {data.createdAt ? (
                <time className="text-sm text-muted" dateTime={data.createdAt}>
                  {getPostFormattedDate(data.createdAt)}
                </time>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
                <Clock className="size-3.5" aria-hidden />
                {readingTime} min read
              </span>
            </div>
          </header>
        </Reveal>

        {data.imageURL ? (
          <Reveal delay={0.06}>
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img
                src={data.imageURL}
                alt={data.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </Reveal>
        ) : null}

        <div id="article-content" className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_12rem]">
          <div>
            <PostProse html={data.description} />
            {data.accessGranted === false ? (
              <div className="mt-8 rounded-xl border border-border bg-paper/80 p-6 text-center">
                <p className="text-sm font-medium text-ink">
                  This post is for members
                </p>
                <p className="mt-2 text-sm text-muted">
                  Subscribe to unlock the full article. Entitlements are checked
                  server-side on every request.
                </p>
                <Link
                  href="/user/memberships"
                  className="mt-4 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  View memberships
                </Link>
              </div>
            ) : null}
          </div>
          {toc.length >= 2 ? (
            <nav
              aria-label="Table of contents"
              className="hidden lg:block lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                On this page
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? "pl-3" : undefined}>
                    <a
                      href={`#${item.id}`}
                      className="text-muted transition-colors hover:text-accent"
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <PostTags tags={data.tags} className="mt-8" />

        <Separator className="my-10" />

        <Reveal>
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-ink">
            Discussion
          </h2>
        </Reveal>

        <CommentThread
          postId={postId}
          comments={comments}
          isLoading={commentsLoading || commentsFetching}
          onDelete={(id) => setDeleteCommentId(id)}
          onEdit={(id) => setEditCommentId(id)}
        />

        <Separator className="my-10" />

        <Reveal>
          <AuthorBioCard author={authorData} />
        </Reveal>

        {relatedPosts.length > 0 ? (
          <Reveal delay={0.06} className="mt-10">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">
              Related reading
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} variant="featured" />
              ))}
            </div>
          </Reveal>
        ) : null}
      </article>

      <Modal
        isOpen={Boolean(deleteCommentId)}
        onOpenChange={(open) => !open && setDeleteCommentId(null)}
      >
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Delete comment</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {deleteCommentId ? (
                  <DeleteCommentForm
                    commentId={deleteCommentId}
                    postId={postId}
                    onClose={() => setDeleteCommentId(null)}
                  />
                ) : null}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal
        isOpen={Boolean(editCommentId)}
        onOpenChange={(open) => !open && setEditCommentId(null)}
      >
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Edit comment</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {editCommentId ? (
                  <EditCommentForm
                    commentId={editCommentId}
                    postId={postId}
                    onClose={() => setEditCommentId(null)}
                  />
                ) : null}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
