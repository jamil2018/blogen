"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Folder, BookmarkSimple } from "@phosphor-icons/react";
import { Button, Card } from "@heroui/react";
import PostCard from "../post/PostCard";
import PageHero from "../layout/PageHero";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import {
  CategorySkeletonGrid,
  ExpandedPostSkeletonList,
} from "../feedback/PageSkeleton";
import {
  getLibraryPosts,
  mergeLocalLibraryBookmarks,
} from "../../actions/library";
import { getUserCollections } from "../../actions/collections";
import { getUserKnowledgeSpaces } from "../../actions/phase2";
import type { Post } from "../../types";

const BOOKMARK_KEY = "blogen-bookmarks";
const MIGRATED_KEY = "blogen-bookmarks-migrated";

function readLocalBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

type Tab = "saved" | "collections" | "spaces";

export default function LibraryPageView() {
  const router = useRouter();
  const [migrating, setMigrating] = useState(true);
  const [tab, setTab] = useState<Tab>("saved");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!localStorage.getItem(MIGRATED_KEY)) {
          const ids = readLocalBookmarks();
          if (ids.length) {
            await mergeLocalLibraryBookmarks(ids);
          }
          localStorage.setItem(MIGRATED_KEY, "1");
          localStorage.removeItem(BOOKMARK_KEY);
        }
      } catch {
        // Keep local bookmarks if merge fails; user can retry on next visit.
      } finally {
        if (!cancelled) setMigrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: savedPosts, isLoading, isError, refetch } = useQuery({
    queryKey: ["library-posts"],
    queryFn: getLibraryPosts,
    enabled: !migrating && tab === "saved",
  });

  const {
    data: collections = [],
    isLoading: collectionsLoading,
    isFetching: collectionsFetching,
  } = useQuery({
    queryKey: ["user-collections"],
    queryFn: getUserCollections,
    enabled: !migrating && tab === "collections",
  });

  const {
    data: spaces = [],
    isLoading: spacesLoading,
    isFetching: spacesFetching,
  } = useQuery({
    queryKey: ["user-spaces"],
    queryFn: getUserKnowledgeSpaces,
    enabled: !migrating && tab === "spaces",
  });

  return (
    <>
      <PageHero
        eyebrow="Reading list"
        title="Library"
        description="Saved posts, collections, and private knowledge spaces — revision-pinned and organized around your intent."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["saved", "Saved posts", BookmarkSimple],
            ["collections", "Collections", Folder],
            ["spaces", "Knowledge spaces", Folder],
          ] as const
        ).map(([key, label, Icon]) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "primary" : "ghost"}
            onPress={() => setTab(key)}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      {tab === "saved" && (migrating || isLoading) ? (
        <ExpandedPostSkeletonList count={4} />
      ) : tab === "saved" && isError ? (
        <div className="space-y-3">
          <ErrorState message="Could not load your Library" />
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-accent underline"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : tab === "saved" ? (
        savedPosts?.length ? (
          <div>
            {savedPosts.map((post: Post) => (
              <PostCard key={post.id} post={post} showCollectionAction />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your Library is empty"
            description="Save published posts while reading to build your list."
            actionHref="/"
            actionLabel="Explore posts"
          />
        )
      ) : tab === "collections" && (collectionsLoading || collectionsFetching) ? (
        <CategorySkeletonGrid count={4} className="sm:grid-cols-2 lg:grid-cols-2" />
      ) : tab === "collections" ? (
        collections.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/library/collections/${collection.id}`}>
                <Card className="h-full p-4 transition-shadow hover:shadow-md">
                  <Card.Header>
                    <Card.Title>{collection.name}</Card.Title>
                    <Card.Description>
                      {collection.itemCount} source{collection.itemCount === 1 ? "" : "s"}
                      {collection.intent ? ` · ${collection.intent.slice(0, 60)}` : ""}
                    </Card.Description>
                  </Card.Header>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No collections yet"
            description="Use Add to collection on any post to create your first source set."
            actionHref="/"
            actionLabel="Find sources"
          />
        )
      ) : tab === "spaces" && (spacesLoading || spacesFetching) ? (
        <CategorySkeletonGrid count={4} className="sm:grid-cols-2 lg:grid-cols-2" />
      ) : spaces.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {spaces.map((space) => (
            <Link key={space.id} href={`/library/spaces/${space.collectionId}`}>
              <Card className="h-full p-4 transition-shadow hover:shadow-md">
                <Card.Header>
                  <Card.Title>{space.name}</Card.Title>
                  <Card.Description>
                    {space.intent?.slice(0, 80) ?? "Private review workspace"}
                  </Card.Description>
                </Card.Header>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No knowledge spaces yet"
          description="Promote a collection with an intent to open a private workspace."
        >
          <Button size="sm" variant="secondary" onPress={() => setTab("collections")}>
            View collections
          </Button>
        </EmptyState>
      )}

      {tab === "collections" ? (
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            onPress={() => router.push("/library/collections/new")}
          >
            Create collection
          </Button>
        </div>
      ) : null}

      <p className="mt-8 text-center text-xs text-muted">
        Curated reading paths are available on{" "}
        <Link href="/paths" className="text-accent hover:underline">
          Reading paths
        </Link>
        .
      </p>
    </>
  );
}
