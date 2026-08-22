import Link from "next/link";
import Logo from "../../assets/appIcon.svg";

const policyLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/content-policy", label: "Content" },
  { href: "/copyright", label: "Copyright" },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-zinc-50 dark:bg-zinc-900/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <Link href="/" className="flex items-center gap-3">
          <img src={Logo} alt="" className="size-6" />
          <span className="text-base font-medium tracking-tight">Blogen</span>
        </Link>
        <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted sm:gap-6">
          <Link href="/explore" className="hover:text-ink">
            Explore
          </Link>
          <Link href="/library" className="hover:text-ink">
            Library
          </Link>
          <Link href="/about" className="hover:text-ink">
            About
          </Link>
          {policyLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} Blogen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
