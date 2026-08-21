"use client";

import { useEffect } from "react";
import { recordAnalyticsEvent } from "../../actions/analytics";

const SESSION_KEY = "blogen-analytics-session";

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/**
 * Fire-and-forget view (+ optional read_complete near bottom).
 * Privacy-minimized server-side; no IP or email in payload.
 */
export default function PostAnalyticsBeacon({
  postId,
  authorId,
  publicationId,
}: {
  postId: string;
  authorId?: string;
  publicationId?: string;
}) {
  useEffect(() => {
    const sessionId = getSessionId();
    void recordAnalyticsEvent({
      eventName: "view",
      postId,
      authorId,
      publicationId,
      sessionId,
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
    });

    let sentComplete = false;
    const onScroll = () => {
      if (sentComplete) return;
      const doc = document.documentElement;
      const scrolled =
        (window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1);
      if (scrolled >= 0.85) {
        sentComplete = true;
        void recordAnalyticsEvent({
          eventName: "read_complete",
          postId,
          authorId,
          publicationId,
          sessionId,
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [postId, authorId, publicationId]);

  return null;
}
