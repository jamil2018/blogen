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
import { getPostById, getAllPostsByAuthorId } from "../../data/postQueryFunctions";
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
import type { Post, User } from "../../types";
import DeleteCommentForm from "../post/DeleteCommentForm";
import EditCommentForm from "../post/EditCommentForm";

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

  const { data: authorPosts } = useQuery({
    queryKey: ["author-posts", authorId],
    queryFn: () => getAllPostsByAuthorId(authorId as string),
    enabled: Boolean(authorId),
    refetchOnWindowFocus: false,
  });

  const relatedPosts = useMemo(
    () =>
      authorPosts
        ?.filter((p) => p.id !== postId)
        .slice(0, 2) ?? [],
    [authorPosts, postId]
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
      <ReadingProgressBar targetId="article-content" />
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

        <div id="article-content">
          <PostProse html={data.description} className="mt-8" />
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
              More from {authorObj.name}
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
