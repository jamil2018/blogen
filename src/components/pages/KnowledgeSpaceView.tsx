"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, NotePencil } from "@phosphor-icons/react";
import { Button, TextArea, toast } from "@heroui/react";
import PageHero from "../layout/PageHero";
import PostCard from "../post/PostCard";
import ErrorState from "../feedback/ErrorState";
import { ExpandedPostSkeletonList } from "../feedback/PageSkeleton";
import {
  getCollectionPosts,
} from "../../actions/collections";
import {
  getCollectionAnnotations,
  getKnowledgeSpace,
  savePassageAnnotation,
} from "../../actions/phase2";

type KnowledgeSpaceViewProps = {
  collectionId: string;
};

export default function KnowledgeSpaceView({ collectionId }: KnowledgeSpaceViewProps) {
  const queryClient = useQueryClient();
  const [noteDraft, setNoteDraft] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const { data: space, isLoading, isError } = useQuery({
    queryKey: ["knowledge-space", collectionId],
    queryFn: () => getKnowledgeSpace(collectionId),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["collection-posts", collectionId],
    queryFn: () => getCollectionPosts(collectionId),
  });

  const { data: annotations = [] } = useQuery({
    queryKey: ["collection-annotations", collectionId],
    queryFn: () => getCollectionAnnotations(collectionId),
  });

  const annotationMutation = useMutation({
    mutationFn: () => {
      if (!selectedPostId) throw new Error("Select a source first");
      return savePassageAnnotation({
        collectionId,
        postId: selectedPostId,
        passage: { kind: "section", sectionId: "intro" },
        note: noteDraft,
      });
    },
    onSuccess: () => {
      setNoteDraft("");
      queryClient.invalidateQueries({
        queryKey: ["collection-annotations", collectionId],
      });
      queryClient.invalidateQueries({ queryKey: ["knowledge-space", collectionId] });
      toast("Note saved", { variant: "success" });
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : "Could not save note", {
        variant: "danger",
      });
    },
  });

  if (isLoading) return <ExpandedPostSkeletonList count={3} />;
  if (isError || !space) return <ErrorState message="Knowledge space not found" />;

  return (
    <>
      <div className="mb-4">
        <Link
          href={`/library/collections/${collectionId}`}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft className="size-4" />
          Back to collection
        </Link>
      </div>

      <PageHero
        eyebrow="Knowledge space"
        title={space.name}
        description={
          space.intent
            ? space.intent
            : "Review your sources, notes, and revision-pinned references. Graph generation is not available yet."
        }
      />

      <div className="mb-6 rounded-2xl border border-dashed border-border bg-zinc-50/80 p-4 text-sm text-muted dark:bg-zinc-900/40">
        This workspace preserves your collection sources and private notes. Automatic
        synthesis and graph editing will arrive in a later phase.
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-medium">Sources ({space.itemCount})</h2>
          {posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-xl border p-1 ${selectedPostId === post.id ? "border-accent" : "border-border"}`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedPostId(post.id)}
              >
                <PostCard post={post} variant="compact" />
              </button>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-medium">Private notes</h2>
          <TextArea
            aria-label="Passage note"
            placeholder="Add a private note for the selected source…"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <Button
            size="sm"
            onPress={() => annotationMutation.mutate()}
            isDisabled={!selectedPostId || !noteDraft.trim()}
          >
            <NotePencil className="size-4" />
            Save note
          </Button>

          {annotations.length ? (
            <ul className="space-y-2">
              {annotations.map((annotation) => (
                <li
                  key={annotation.id}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium">Source {annotation.boundPostId.slice(0, 8)}…</p>
                  <p className="mt-1 text-muted">{annotation.note}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No notes yet.</p>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium">Activity</h3>
            <ul className="space-y-1 text-sm text-muted">
              {space.activity.map((item) => (
                <li key={item.id}>{item.summary}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
