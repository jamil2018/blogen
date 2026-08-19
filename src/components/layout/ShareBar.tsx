"use client";

import { useCallback, useState } from "react";
import {
  BookmarkSimple,
  ChatCircle,
  Copy,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";
import { Button, toast } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";

type ShareBarProps = {
  postId: string;
  title: string;
  commentCount?: number;
  className?: string;
};

const BOOKMARK_KEY = "blogen-bookmarks";

function readBookmarks(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(ids: string[]) {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
}

export default function ShareBar({
  postId,
  title,
  commentCount = 0,
  className,
}: ShareBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [bookmarked, setBookmarked] = useState(
    () => typeof window !== "undefined" && readBookmarks().includes(postId)
  );

  const getShareUrl = useCallback(
    () => (typeof window !== "undefined" ? window.location.href : ""),
    []
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast("Link copied to clipboard", { variant: "success" });
    } catch {
      toast("Could not copy link", { variant: "danger" });
    }
  }, [getShareUrl]);

  const toggleBookmark = useCallback(() => {
    const current = readBookmarks();
    const next = current.includes(postId)
      ? current.filter((id) => id !== postId)
      : [...current, postId];
    writeBookmarks(next);
    setBookmarked(next.includes(postId));
    toast(next.includes(postId) ? "Saved to bookmarks" : "Removed from bookmarks", {
      variant: "success",
    });
  }, [postId]);

  const shareTwitter = useCallback(() => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [title, getShareUrl]);

  const shareLinkedIn = useCallback(() => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl]);

  const jumpToComments = useCallback(() => {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const actions = (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-paper/95 p-1 shadow-lg backdrop-blur-sm">
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Copy link"
        onPress={copyLink}
      >
        <Copy className="size-4" />
      </Button>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Share on Twitter"
        onPress={shareTwitter}
      >
        <TwitterLogo className="size-4" />
      </Button>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Share on LinkedIn"
        onPress={shareLinkedIn}
      >
        <LinkedinLogo className="size-4" />
      </Button>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
        onPress={toggleBookmark}
        className={bookmarked ? "text-accent" : undefined}
      >
        <BookmarkSimple className="size-4" weight={bookmarked ? "fill" : "regular"} />
      </Button>
      <Button
        isIconOnly
        variant="ghost"
        size="sm"
        aria-label="Jump to comments"
        onPress={jumpToComments}
        className="relative"
      >
        <ChatCircle className="size-4" />
        {commentCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
            {commentCount > 99 ? "99+" : commentCount}
          </span>
        ) : null}
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        "fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 xl:block",
        className
      )}
    >
      {prefersReducedMotion ? (
        actions
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
