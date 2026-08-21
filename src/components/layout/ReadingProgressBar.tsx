"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type ReadingProgressBarProps = {
  targetId?: string;
  postId?: string;
};

export default function ReadingProgressBar({
  targetId = "article-content",
  postId: _postId,
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

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
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [targetId]);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <motion.div
        className="h-full origin-left bg-accent"
        style={{ scaleX: progress / 100 }}
        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 30 }}
      />
    </div>
  );
}
