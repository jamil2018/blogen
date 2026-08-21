import { cn } from "../../lib/cn";
import Link from "next/link";
import { Button } from "@heroui/react";

type EmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({
  title,
  description,
  className,
  children,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button size="sm" className="rounded-full">
              {actionLabel}
            </Button>
          </Link>
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
