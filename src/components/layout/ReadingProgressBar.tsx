"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  getPostReadingProgress,
  savePostReadingProgress,
} from "../../actions/reading";
import { useCurrentUser } from "../auth/AuthProvider";

type ReadingProgressBarProps = {
  targetId?: string;
  postId?: string;
};

export default function ReadingProgressBar({
  targetId = "article-content",
  postId,
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const user = useCurrentUser();
  const lastSaved = useRef(0);
  const restored = useRef(false);

  useEffect(() => {
    if (!user || !postId || restored.current) return;
    let cancelled = false;
    (async () => {
      try {
        const saved = await getPostReadingProgress(postId);
        if (cancelled || saved == null || saved < 5) return;
        restored.current = true;
        const el = document.getElementById(targetId);
        if (!el) return;
        const start = el.offsetTop;
        const height = el.offsetHeight;
        const winHeight = window.innerHeight;
        const total = height - winHeight;
        if (total <= 0) return;
        const y = start + (saved / 100) * total;
        window.scrollTo({ top: y, behavior: "auto" });
        setProgress(saved);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, postId, targetId]);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (!el) return;

      const start = el.offsetTop;
      const height = el.offsetHeight;
      const winHeight = window.innerHeight;
      const total = height - winHeight;

      if (total <= 0) {
        setProgress(100);
        return;
      }

      const scrolled = window.scrollY;
      const next = Math.min(100, Math.max(0, ((scrolled - start) / total) * 100));
      setProgress(next);

      if (user && postId && Math.abs(next - lastSaved.current) >= 5) {
        lastSaved.current = next;
        void savePostReadingProgress(postId, next).catch(() => undefined);
      }
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [targetId, user, postId]);

  const bar = (
    <div
      className="h-full bg-gradient-to-r from-accent/70 to-accent"
      style={{ width: `${progress}%` }}
    />
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-border/50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      {prefersReducedMotion ? (
        bar
      ) : (
        <motion.div
          className="h-full bg-gradient-to-r from-accent/70 to-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
}
