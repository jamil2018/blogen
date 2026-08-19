"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button, Input } from "@heroui/react";
import Reveal from "../components/motion/Reveal";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Authors", href: "/authors" },
  { label: "About", href: "/about" },
];

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 2) {
      router.push(`/search/${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Error 404
        </p>
        <h1 className="mt-2 text-6xl font-semibold tracking-tighter text-ink sm:text-7xl">
          Page not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          The page you are looking for does not exist or may have been moved.
          Search for an article or head back to familiar ground.
        </p>
      </Reveal>

      <Reveal delay={0.06} className="mt-8 w-full max-w-md">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <MagnifyingGlass
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              placeholder="Search articles..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              aria-label="Search articles"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="mt-3 w-full rounded-full"
            isDisabled={query.trim().length < 2}
          >
            Search
          </Button>
        </form>
      </Reveal>

      <Reveal delay={0.1} className="mt-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          Quick links
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm" className="rounded-full">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
