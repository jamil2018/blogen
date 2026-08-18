"use client";

import { useQuery } from "@tanstack/react-query";
import { Separator } from "@heroui/react";
import CategoryList from "../post/CategoryList";
import ErrorState from "../feedback/ErrorState";
import { CategorySkeletonGrid } from "../feedback/PageSkeleton";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import { CATEGORY_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { Category } from "../../types";

export default function CategoryListView({
  categories,
}: {
  categories?: Category[];
}) {
  const hasCategories = categories !== undefined;
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
    enabled: !hasCategories,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const list = hasCategories ? categories : data;

  return (
    <>
      <h1 className="text-2xl font-semibold">All categories</h1>
      <Separator className="my-4" />
      {isLoading || isFetching ? (
        <CategorySkeletonGrid count={8} />
      ) : isError ? (
        <ErrorState />
      ) : list ? (
        <CategoryList categories={list} className="justify-center" />
      ) : null}
    </>
  );
}
