"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkle, Trash } from "@phosphor-icons/react";
import { Button, Input, Skeleton, TextArea, toast } from "@heroui/react";
import PageHero from "../layout/PageHero";
import PostCard from "../post/PostCard";
import EmptyState from "../feedback/EmptyState";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import AddToCollectionMenu from "../collections/AddToCollectionMenu";
import {
  getCollection,
  getCollectionPosts,
  removeFromCollection,
  renameUserCollection,
  setCollectionIntent,
} from "../../actions/collections";
import { promoteToKnowledgeSpace } from "../../actions/phase2";

type CollectionDetailViewProps = {
  collectionId: string;
};

export default function CollectionDetailView({
  collectionId,
}: CollectionDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [intentDraft, setIntentDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");

  const { data: collection, isLoading: metaLoading, isError } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: () => getCollection(collectionId),
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["collection-posts", collectionId],
    queryFn: () => getCollectionPosts(collectionId),
    enabled: Boolean(collectionId),
  });

  const intentMutation = useMutation({
    mutationFn: () => setCollectionIntent(collectionId, intentDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      toast("Intent saved", { variant: "success" });
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : "Could not save intent", {
        variant: "danger",
      });
    },
  });

  const renameMutation = useMutation({
    mutationFn: () => renameUserCollection(collectionId, nameDraft),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["user-collections"] });
      toast("Collection renamed", { variant: "success" });
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : "Could not rename", {
        variant: "danger",
      });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: () => promoteToKnowledgeSpace(collectionId),
    onSuccess: () => {
      router.push(`/library/spaces/${collectionId}`);
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : "Could not create space", {
        variant: "danger",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (postId: string) => removeFromCollection(collectionId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-posts", collectionId] });
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] });
    },
  });

  if (isError || (!metaLoading && !collection)) {
    return <ErrorState message="Collection not found" />;
  }

  return (
    <>
      <div className="mb-4">
        <Link href="/library" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ArrowLeft className="size-4" />
          Back to Library
        </Link>
      </div>

      {metaLoading ? (
        <>
          <div className="mb-8 space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </div>
          <div className="mb-8 grid gap-4 rounded-2xl border border-border bg-paper p-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <ExpandedPostSkeletonList count={3} />
        </>
      ) : (
        <>
      <PageHero
        eyebrow="Collection"
        title={collection!.name}
        description={
          collection!.intent ??
          "Group related sources. Add an intent to clarify why these posts belong together."
        }
      />

      <div className="mb-8 grid gap-4 rounded-2xl border border-border bg-paper p-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="collection-name">
            Name
          </label>
          <div className="flex gap-2">
            <Input
              id="collection-name"
              defaultValue={collection!.name}
              onChange={(e) => setNameDraft(e.target.value)}
            />
            <Button
              size="sm"
              onPress={() => renameMutation.mutate()}
              isDisabled={!nameDraft.trim()}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="collection-intent">
            Intent (optional)
          </label>
          <TextArea
            id="collection-intent"
            placeholder="What question or goal connects these sources?"
            defaultValue={collection!.intent ?? ""}
            onChange={(e) => setIntentDraft(e.target.value)}
          />
          <p className="text-xs text-muted">
            The same posts can appear in different collections with different intents.
          </p>
          <Button
            size="sm"
            variant="secondary"
            onPress={() => intentMutation.mutate()}
            isDisabled={!intentDraft.trim()}
          >
            Save intent
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {!collection!.promotedToSpaceAt ? (
          <Button
            onPress={() => promoteMutation.mutate()}
            isDisabled={promoteMutation.isPending || collection!.itemCount < 1}
          >
            <Sparkle className="size-4" />
            Open knowledge space
          </Button>
        ) : (
          <Link
            href={`/library/spaces/${collectionId}`}
            className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            View knowledge space
          </Link>
        )}
      </div>

      {postsLoading ? (
        <ExpandedPostSkeletonList count={3} />
      ) : posts.length ? (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              <div className="absolute right-2 top-2 flex gap-1">
                <AddToCollectionMenu postId={post.id} />
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label="Remove from collection"
                  onPress={() => removeMutation.mutate(post.id)}
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sources yet"
          description="Add posts from reading surfaces with Add to collection."
          actionHref="/"
          actionLabel="Explore posts"
        />
      )}
        </>
      )}
    </>
  );
}
