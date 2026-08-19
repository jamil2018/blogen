"use client";

import { useQuery } from "@tanstack/react-query";
import { Separator } from "@heroui/react";
import AuthorCard from "../post/AuthorCard";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { AuthorCardSkeletonGrid } from "../feedback/PageSkeleton";
import { getAllUsers } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { User } from "../../types";

export default function AuthorListView({ authors }: { authors?: User[] }) {
  const hasAuthors = authors !== undefined;
  const { data, isLoading, isError } = useQuery({
    queryKey: [USER_DATA],
    queryFn: getAllUsers,
    enabled: !hasAuthors,
  });
  const list = hasAuthors ? authors : data;

  return (
    <>
      <h1 className="text-2xl font-semibold">All authors</h1>
      <Separator className="my-4" />
      {isLoading ? (
        <AuthorCardSkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState />
      ) : !list?.length ? (
        <EmptyState title="No authors found" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {list.map((author: User) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}
    </>
  );
}
