import Link from "next/link";
import { Card, Avatar } from "@heroui/react";
import type { User } from "../../types";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { cn } from "../../lib/cn";

type AuthorCardProps = {
  author: User;
  className?: string;
};

export default function AuthorCard({ author, className }: AuthorCardProps) {
  const initials = getAuthorNameInitials(author.name)
    .filter(Boolean)
    .join("");

  return (
    <Link href={`/authors/${author._id}`} className={cn("block", className)}>
      <Card className="p-4 text-center transition-shadow hover:shadow-md">
        <Avatar size="lg" className="mx-auto">
          {author.imageURL ? (
            <Avatar.Image src={author.imageURL} alt={author.name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar>
        <p className="mt-3 font-medium">{author.name}</p>
        {author.bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{author.bio}</p>
        ) : null}
      </Card>
    </Link>
  );
}
