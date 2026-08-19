"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

type ReadingProgressBarProps = {
  targetId?: string;
};

export default function ReadingProgressBar({
  targetId = "article-content",
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
      {prefersReducedMotion ? bar : (
        <motion.div
          className="h-full bg-gradient-to-r from-accent/70 to-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </div>
  );
}
