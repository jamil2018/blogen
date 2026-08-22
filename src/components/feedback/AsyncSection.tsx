import type { ReactNode } from "react";
import ErrorState from "./ErrorState";

type AsyncSectionProps = {
  isLoading: boolean;
  isError?: boolean;
  skeleton: ReactNode;
  errorFallback?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AsyncSection({
  isLoading,
  isError = false,
  skeleton,
  errorFallback,
  children,
  className,
}: AsyncSectionProps) {
  if (isError) {
    return <>{errorFallback ?? <ErrorState className={className} />}</>;
  }

  if (isLoading) {
    return <>{skeleton}</>;
  }

  return <>{children}</>;
}
