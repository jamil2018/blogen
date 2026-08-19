"use client";

import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";
import Reveal from "../motion/Reveal";
import { cn } from "../../lib/cn";

type Breadcrumb = {
  label: string;
  href?: string;
};

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  meta?: React.ReactNode;
  className?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  meta,
  className,
}: PageHeroProps) {
  return (
    <Reveal className={cn("mb-10", className)}>
      {breadcrumbs?.length ? (
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {index > 0 ? <CaretRight className="size-3.5 shrink-0" aria-hidden /> : null}
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-accent">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-ink sm:text-4xl md:text-5xl">
        {title}
      </h1>

      {description ? (
        <p className="mt-3 max-w-2xl text-base text-muted md:text-lg">{description}</p>
      ) : null}

      {meta ? <div className="mt-4 flex flex-wrap items-center gap-3">{meta}</div> : null}
    </Reveal>
  );
}
