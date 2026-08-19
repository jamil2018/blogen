"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Separator } from "@heroui/react";
import PostCard from "../post/PostCard";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getPostByTagName } from "../../data/postQueryFunctions";
import type { Post } from "../../types";

export default function PostsByTagView({
  tagName: tagNameProp,
  posts,
}: {
  tagName?: string;
  posts?: Post[];
}) {
  const params = useParams();
  const tagName = tagNameProp ?? decodeURIComponent(params?.tagName as string);

  const hasPosts = posts !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["posts-by-tag", tagName],
    queryFn: () => getPostByTagName({ tagName }),
    enabled: !hasPosts && Boolean(tagName),
    refetchOnWindowFocus: false,
  });
  const list = hasPosts ? posts : data;

  return (
    <>
      <h1 className="text-2xl font-semibold capitalize">#{tagName}</h1>
      <Separator className="my-4" />
      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !list?.length ? (
        <EmptyState title="No posts with this tag" />
      ) : (
        <div>
          {list.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
