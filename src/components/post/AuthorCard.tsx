import Link from "next/link";
import {
  EnvelopeSimple,
  FacebookLogo,
  LinkedinLogo,
  TwitterLogo,
} from "@phosphor-icons/react";
import { Card, Avatar, Chip } from "@heroui/react";
import type { User } from "../../types";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { cn } from "../../lib/cn";

type AuthorCardProps = {
  author: User;
  postCount?: number;
  featured?: boolean;
  className?: string;
};

export default function AuthorCard({
  author,
  postCount,
  featured = false,
  className,
}: AuthorCardProps) {
  const initials = getAuthorNameInitials(author.name)
    .filter(Boolean)
    .join("");

  return (
    <Link href={`/authors/${author.id}`} className={cn("group block h-full", className)}>
      <Card
        className={cn(
          "h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
          featured && "border-accent/30 bg-gradient-to-br from-teal-50/50 to-paper dark:from-teal-950/20 dark:to-paper"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <Avatar size="lg" className="mx-auto">
            {author.imageURL ? (
              <Avatar.Image src={author.imageURL} alt={author.name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar>
          {featured ? (
            <Chip size="sm" variant="soft" color="accent" className="mt-3">
              Featured contributor
            </Chip>
          ) : null}
          <p className="mt-3 font-semibold text-ink transition-colors group-hover:text-accent">
            {author.name}
          </p>
          {author.isAdmin ? (
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-accent">
              Author
            </p>
          ) : null}
          {postCount !== undefined ? (
            <p className="mt-1 text-sm text-muted">
              {postCount} {postCount === 1 ? "article" : "articles"} published
            </p>
          ) : null}
          {author.bio ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{author.bio}</p>
          ) : null}
          <div className="mt-4 flex justify-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            {author.email ? (
              <span className="inline-flex rounded-lg p-1.5 text-muted" aria-hidden>
                <EnvelopeSimple className="size-4" />
              </span>
            ) : null}
            {author.twitterId ? (
              <span className="inline-flex rounded-lg p-1.5 text-muted" aria-hidden>
                <TwitterLogo className="size-4" />
              </span>
            ) : null}
            {author.linkedinId ? (
              <span className="inline-flex rounded-lg p-1.5 text-muted" aria-hidden>
                <LinkedinLogo className="size-4" />
              </span>
            ) : null}
            {author.facebookId ? (
              <span className="inline-flex rounded-lg p-1.5 text-muted" aria-hidden>
                <FacebookLogo className="size-4" />
              </span>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}
