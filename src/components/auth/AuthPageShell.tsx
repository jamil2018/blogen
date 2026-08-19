import Link from "next/link";
import type { ReactNode } from "react";
import AppIcon from "../../assets/appIcon.svg";

type AuthPageShellProps = {
  children: ReactNode;
  headline?: string;
  description?: string;
};

export default function AuthPageShell({
  children,
  headline = "Return to your desk.",
  description = "Sign in to manage posts, comments, and your author profile.",
}: AuthPageShellProps) {
  return (
    <div className="auth-page -mx-4 -my-8 grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_min(480px,45%)]">
      <aside className="auth-panel-editorial relative flex flex-col justify-between overflow-hidden px-6 py-8 sm:px-8 lg:px-12 lg:py-14">
        <div className="auth-panel-texture pointer-events-none absolute inset-0" aria-hidden />

        <Link
          href="/"
          className="relative z-10 inline-flex w-fit items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400"
        >
          <img src={AppIcon} alt="" className="size-9" />
          <span className="text-lg font-medium tracking-wide">Blogen</span>
        </Link>

        <div className="auth-editorial-copy relative z-10 mt-10 lg:mt-0">
          <h1 className="max-w-md text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl lg:leading-[1.15]">
            {headline}
          </h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted">
            {description}
          </p>
        </div>

        <p className="relative z-10 mt-8 hidden text-sm text-muted lg:block">
          A calm place to read and write about tech.
        </p>
      </aside>

      <section className="auth-panel-form flex items-center justify-center border-t border-border px-6 py-10 sm:px-8 lg:border-t-0 lg:border-l lg:px-10 lg:py-14">
        <div className="auth-enter w-full max-w-sm">{children}</div>
      </section>
    </div>
  );
}
