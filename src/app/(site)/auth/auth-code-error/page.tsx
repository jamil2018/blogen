import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in failed</h1>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t complete sign in. The link may have expired, been
          cancelled, or the provider did not return a verified email.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700"
      >
        Try again
      </Link>
    </div>
  );
}
