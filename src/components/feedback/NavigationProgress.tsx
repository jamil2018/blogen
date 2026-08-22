"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";

const LOADING_WIDTH = 90;
const RESET_DELAY_MS = 200;

function isInternalNavigationLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return false;
    }

    const { pathname, search, hash } = window.location;
    if (url.pathname === pathname && url.search === search && url.hash) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export default function NavigationProgress() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const activeRef = useRef(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || !isInternalNavigationLink(anchor)) return;

      setActive(true);
      setWidth(0);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  useEffect(() => {
    if (!active) return;

    const frame = requestAnimationFrame(() => {
      setWidth(LOADING_WIDTH);
    });

    return () => cancelAnimationFrame(frame);
  }, [active]);

  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    if (!activeRef.current) return;

    setWidth(100);
  }, [pathname]);

  useEffect(() => {
    if (!active || width < 100) return;

    const timer = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, RESET_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [active, width]);

  useEffect(() => {
    if (!active || width >= 100) return;

    const timer = window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, [active, width]);

  if (!active) return null;

  const barClassName = "h-full bg-gradient-to-r from-accent/70 to-accent";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5"
      role="progressbar"
      aria-hidden
    >
      {prefersReducedMotion ? (
        <div className={barClassName} style={{ width: `${width}%` }} />
      ) : (
        <motion.div
          className={barClassName}
          initial={false}
          animate={{ width: `${width}%` }}
          transition={{
            duration: width >= 100 ? 0.15 : 0.35,
            ease: width >= 100 ? [0.4, 0, 0.2, 1] : [0.16, 1, 0.3, 1],
          }}
        />
      )}
    </div>
  );
}
