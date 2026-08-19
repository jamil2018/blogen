"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Separator } from "@heroui/react";
import PostCard from "../post/PostCard";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import { searchPostResults } from "../../data/postQueryFunctions";
import { SEARCH_POST_DATA_RESULTS } from "../../definitions/reactQueryConstants/queryConstants";
import type { Post } from "../../types";
import notFoundImage from "../../assets/notFound.svg";

export default function SearchResultsView({
  searchQuery: searchQueryProp,
  results,
}: {
  searchQuery?: string;
  results?: Post[];
}) {
  const params = useParams();
  const searchQuery = searchQueryProp ?? (params?.searchQuery as string);

  const hasResults = results !== undefined;
  const { isLoading, isFetching, isError, data } = useQuery({
    queryKey: [SEARCH_POST_DATA_RESULTS, searchQuery],
    queryFn: ({ queryKey }) => searchPostResults(queryKey[1] as string),
    enabled: !hasResults && Boolean(searchQuery),
    refetchOnWindowFocus: false,
  });
  const posts = hasResults ? results : data;

  return (
    <>
      <h1 className="text-2xl font-semibold capitalize">Search result</h1>
      <Separator className="my-4" />
      {isLoading || isFetching ? (
        <ExpandedPostSkeletonList count={5} />
      ) : isError ? (
        <ErrorState />
      ) : !posts?.length ? (
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <img src={notFoundImage} alt="" className="h-64 w-full object-contain" />
          <EmptyState title="No posts found under the search query" />
        </div>
      ) : (
        <div>
          {posts.map((post: Post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
