import Link from "next/link";
import Logo from "../../assets/appIcon.svg";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-zinc-50 dark:bg-zinc-900/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <img src={Logo} alt="" className="size-6" />
          <span className="text-sm font-medium">Blogen</span>
        </Link>
        <nav className="flex gap-6 text-sm text-muted">
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/categories" className="hover:text-ink">
            Categories
          </Link>
          <Link href="/authors" className="hover:text-ink">
            Authors
          </Link>
        </nav>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Blogen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
