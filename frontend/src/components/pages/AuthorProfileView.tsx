"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  EnvelopeSimple,
  FacebookLogo,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";
import { Avatar, Button, Separator, Skeleton } from "@heroui/react";
import PostCard from "../post/PostCard";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getAllPostsByAuthorId } from "../../data/postQueryFunctions";
import { getUserById } from "../../data/userQueryFunctions";
import {
  POST_DATA,
  SINGLE_AUTHOR_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import type { Post, User } from "../../types";

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

  if (authorLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <ExpandedPostSkeletonList count={5} />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (authorError || !authorData) return <ErrorState />;

  const initials = getAuthorNameInitials(authorData.name).filter(Boolean).join("");

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-semibold">{authorData.name}</h1>
        <Separator className="my-4" />
        {postsLoading ? (
          <ExpandedPostSkeletonList count={5} />
        ) : postsError ? (
          <ErrorState />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {postList?.map((post: Post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
      <aside className="rounded-xl border border-border p-6 lg:sticky lg:top-24 lg:self-start">
        <Avatar size="lg">
          {authorData.imageURL ? (
            <Avatar.Image src={authorData.imageURL} alt={authorData.name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar>
        <h2 className="mt-4 font-medium">{authorData.name}</h2>
        {authorData.bio ? (
          <p className="mt-2 text-sm text-muted">{authorData.bio}</p>
        ) : null}
        <div className="mt-4 flex gap-1">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            onPress={() => window.open(`mailto:${authorData.email}`)}
          >
            <EnvelopeSimple className="size-4" />
          </Button>
          {authorData.facebookId ? (
            <a
              href={`https://www.facebook.com/${authorData.facebookId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button isIconOnly variant="ghost" size="sm">
                <FacebookLogo className="size-4" />
              </Button>
            </a>
          ) : null}
          {authorData.twitterId ? (
            <a
              href={`https://twitter.com/${authorData.twitterId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button isIconOnly variant="ghost" size="sm">
                <TwitterLogo className="size-4" />
              </Button>
            </a>
          ) : null}
          {authorData.linkedinId ? (
            <a
              href={`https://www.linkedin.com/in/${authorData.linkedinId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button isIconOnly variant="ghost" size="sm">
                <LinkedinLogo className="size-4" />
              </Button>
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
