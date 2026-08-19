"use client";

import Link from "next/link";
import {
  EnvelopeSimple,
  FacebookLogo,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";
import { Avatar, Button, Card } from "@heroui/react";
import type { User } from "../../types";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { cn } from "../../lib/cn";

type AuthorBioCardProps = {
  author: User;
  className?: string;
};

export default function AuthorBioCard({ author, className }: AuthorBioCardProps) {
  const initials = getAuthorNameInitials(author.name ?? "")
    .filter(Boolean)
    .join("");

  return (
    <Card className={cn("overflow-hidden p-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Avatar size="lg" className="shrink-0">
          {author.imageURL ? (
            <Avatar.Image src={author.imageURL} alt={author.name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            About the author
          </p>
          <Link
            href={`/authors/${author.id}`}
            className="mt-1 block text-xl font-semibold tracking-tight text-ink transition-colors hover:text-accent"
          >
            {author.name}
          </Link>
          {author.bio ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{author.bio}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-1">
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label="Email author"
              onPress={() => window.open(`mailto:${author.email}`)}
            >
              <EnvelopeSimple className="size-4" />
            </Button>
            {author.facebookId ? (
              <a
                href={`https://www.facebook.com/${author.facebookId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button isIconOnly variant="ghost" size="sm" aria-label="Facebook">
                  <FacebookLogo className="size-4" />
                </Button>
              </a>
            ) : null}
            {author.twitterId ? (
              <a
                href={`https://twitter.com/${author.twitterId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button isIconOnly variant="ghost" size="sm" aria-label="Twitter">
                  <TwitterLogo className="size-4" />
                </Button>
              </a>
            ) : null}
            {author.linkedinId ? (
              <a
                href={`https://www.linkedin.com/in/${author.linkedinId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button isIconOnly variant="ghost" size="sm" aria-label="LinkedIn">
                  <LinkedinLogo className="size-4" />
                </Button>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
