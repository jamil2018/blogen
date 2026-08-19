"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  EnvelopeSimple,
  FacebookLogo,
  LinkedinLogo,
  TwitterLogo,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Modal,
  Separator,
} from "@heroui/react";
import PostProse from "../post/PostProse";
import PostTags from "../post/PostTags";
import CommentThread from "../post/CommentThread";
import ErrorState from "../feedback/ErrorState";
import { PostDetailSkeleton } from "../feedback/PageSkeleton";
import { getPostById } from "../../data/postQueryFunctions";
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

  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {data.title}
      </h1>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {authorData.imageURL ? (
              <Avatar.Image src={authorData.imageURL} alt={authorData.name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar>
          <div>
            <Link
              href={`/authors/${authorObj.id}`}
              className="text-sm font-medium text-teal-700 dark:text-teal-400"
            >
              {authorObj.name}
            </Link>
            <p className="text-xs text-muted">
              {data.createdAt
                ? getPostFormattedDate(data.createdAt)
                : null}{" "}
              · {calculateReadingTime(convertToText(data.description))} min read
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            aria-label="Email author"
            onPress={() => window.open(`mailto:${authorData.email}`)}
          >
            <EnvelopeSimple className="size-4" />
          </Button>
          {authorData.facebookId ? (
            <a
              href={`https://www.facebook.com/${authorData.facebookId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
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
              className="inline-flex"
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
              className="inline-flex"
            >
              <Button isIconOnly variant="ghost" size="sm" aria-label="LinkedIn">
                <LinkedinLogo className="size-4" />
              </Button>
            </a>
          ) : null}
        </div>
      </div>

      {data.imageURL ? (
        <img
          src={data.imageURL}
          alt={data.title}
          className="mt-8 w-full rounded-xl object-cover"
        />
      ) : null}

      <PostProse html={data.description} className="mt-8" />

      <PostTags tags={data.tags} className="mt-8" />

      <Separator className="my-8" />

      <h2 className="mb-4 text-lg font-medium">
        See what others say about this post
      </h2>

      <CommentThread
        postId={postId}
        comments={comments}
        isLoading={commentsLoading || commentsFetching}
        onDelete={(id) => setDeleteCommentId(id)}
        onEdit={(id) => setEditCommentId(id)}
      />

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
    </article>
  );
}
