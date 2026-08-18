"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Separator } from "@heroui/react";
import PostCard from "../post/PostCard";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { getPostByCategoryName } from "../../data/postQueryFunctions";
import type { Post } from "../../types";

export default function PostsByCategoryView({
  categoryName: categoryNameProp,
  posts,
}: {
  categoryName?: string;
  posts?: Post[];
}) {
  const params = useParams();
  const categoryName =
    categoryNameProp ?? decodeURIComponent(params?.categoryName as string);

  const hasPosts = posts !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: ["posts-by-category", categoryName],
    queryFn: () => getPostByCategoryName({ categoryName }),
    enabled: !hasPosts && Boolean(categoryName),
    refetchOnWindowFocus: false,
  });
  const list = hasPosts ? posts : data;

  return (
    <>
      <h1 className="text-2xl font-semibold capitalize">{categoryName}</h1>
      <Separator className="my-4" />
      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !list?.length ? (
        <EmptyState title="No posts in this category" />
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
