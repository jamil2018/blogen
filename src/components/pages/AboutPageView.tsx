"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Separator, Spinner } from "@heroui/react";
import AuthorCard from "../post/AuthorCard";
import ErrorState from "../feedback/ErrorState";
import Logo from "../../assets/appIcon.svg";
import { getLatestUsers } from "../../data/userQueryFunctions";
import { DETAILED_USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import type { User } from "../../types";

export default function AboutPageView({ users }: { users?: User[] }) {
  const hasUsers = users !== undefined;
  const { data, isLoading, isError } = useQuery({
    queryKey: [DETAILED_USER_DATA],
    queryFn: getLatestUsers,
    enabled: !hasUsers,
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000,
  });
  const userList = hasUsers ? users : data;

  return (
    <>
      <h1 className="text-3xl font-semibold sm:text-4xl">
        Everyone needs a <span className="font-bold">blog</span>
      </h1>
      <Separator className="my-6" />

      <div className="grid items-center gap-10 lg:grid-cols-2">
        <p className="text-justify leading-relaxed text-muted">
          Our thoughts define ourselves. Blogen is where those our thoughts get
          to meet reality, flow, and create insightful conversations. We&apos;re
          a sharing platform where readers can come to find insightful and
          dynamic thinking of other inquisitive minds.
        </p>
        <div className="flex justify-center">
          <img src={Logo} alt="Blogen logo" className="w-1/2 max-w-xs" />
        </div>
      </div>

      <section className="mt-12 rounded-xl bg-teal-700 p-8 text-white dark:bg-teal-900">
        <h2 className="text-center text-2xl font-semibold">
          A Hive of Curious Minds
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-teal-50">
          Anyone can write on Blogen. Thinkers, experts, people with a unique
          perspective share their thoughts and ideas here.
        </p>
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center">
              <Spinner />
            </div>
          ) : isError ? (
            <ErrorState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {userList?.map((user: User) => (
                <AuthorCard key={user._id} author={user} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 rounded-xl bg-zinc-900 p-8 text-white">
        <h2 className="text-center text-2xl font-semibold">
          Make Blogen the place for your thoughts to take off
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-zinc-300">
          An empty page is also the starting point of a great idea. Blogen is the
          place where you can walk through it.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/register">
            <Button variant="secondary" size="lg" className="rounded-full">
              Write on Blogen
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
