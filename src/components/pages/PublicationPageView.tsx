"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Input, Label, TextField, toast } from "@heroui/react";
import PageHero from "../layout/PageHero";
import PostCard from "../post/PostCard";
import EmptyState from "../feedback/EmptyState";
import FollowButton from "../follow/FollowButton";
import { subscribeToTarget } from "../../actions/subscriptions";
import type { Post } from "../../types/post";
import type {
  Publication,
  PublicationSection,
} from "../../types/publication";

export default function PublicationPageView({
  publication,
  sections,
  activeSection,
  posts,
  page,
  totalPages,
}: {
  publication: Publication;
  sections: PublicationSection[];
  activeSection?: PublicationSection;
  posts: Post[];
  page: number;
  totalPages: number;
}) {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const onSubscribe = async () => {
    setSubscribing(true);
    try {
      await subscribeToTarget({
        targetType: "publication",
        targetId: publication.id,
        email,
      });
      toast("Subscribed", { variant: "success" });
      setEmail("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Subscribe failed", {
        variant: "danger",
      });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Publication"
        title={publication.name}
        description={
          publication.tagline ||
          publication.description ||
          "Stories from this publication."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: publication.name },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <FollowButton
          targetType="publication"
          targetId={publication.id}
          label="Follow"
        />
        <span className="text-sm text-muted">
          Follow for the in-app feed · Subscribe for email
        </span>
      </div>

      <form
        className="mb-10 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubscribe();
        }}
      >
        <TextField name="email" className="flex-1" isRequired>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </TextField>
        <Button type="submit" isDisabled={subscribing || !email}>
          {subscribing ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>

      {sections.length > 0 ? (
        <nav className="mb-8 flex flex-wrap gap-2" aria-label="Sections">
          <Link
            href={`/pubs/${publication.slug}`}
            className={
              !activeSection
                ? "text-sm font-semibold text-ink"
                : "text-sm text-muted hover:text-ink"
            }
          >
            All
          </Link>
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/pubs/${publication.slug}?section=${section.slug}`}
              className={
                activeSection?.id === section.id
                  ? "text-sm font-semibold text-ink"
                  : "text-sm text-muted hover:text-ink"
              }
            >
              {section.name}
            </Link>
          ))}
          <Link
            href={`/pubs/${publication.slug}`}
            className="ml-auto text-sm text-muted underline"
          >
            Archive
          </Link>
        </nav>
      ) : null}

      {posts.length === 0 ? (
        <EmptyState
          title="No published stories yet"
          description="This publication’s archive is empty. Email-only issues never appear here."
        />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showCollectionAction />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex justify-center gap-4">
          {page > 1 ? (
            <Link
              href={`/pubs/${publication.slug}?page=${page - 1}${
                activeSection ? `&section=${activeSection.slug}` : ""
              }`}
              className="text-sm text-accent underline"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/pubs/${publication.slug}?page=${page + 1}${
                activeSection ? `&section=${activeSection.slug}` : ""
              }`}
              className="text-sm text-accent underline"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
