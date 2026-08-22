"use client";

import Link, { useLinkStatus } from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps, type ReactNode } from "react";
import { debounce } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { List as MenuIcon } from "@phosphor-icons/react";
import {
  Avatar,
  Button,
  Drawer,
  Dropdown,
  SearchField,
  Spinner,
} from "@heroui/react";
import ThemeToggle from "../theme/ThemeToggle";
import { SEARCH_POST_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { searchPosts } from "../../data/postQueryFunctions";
import { signOut } from "../../actions/auth";
import { useCurrentUser } from "../auth/AuthProvider";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import type { Post } from "../../types";
import { cn } from "../../lib/cn";
import AppIcon from "../../assets/appIcon.svg";
import { SignIn, UserPlus } from "@phosphor-icons/react";

const navLinks = [
  { href: "/", label: "Explore" },
  { href: "/following", label: "Following" },
  { href: "/library", label: "Library" },
  { href: "/paths", label: "Paths" },
  { href: "/categories", label: "Categories" },
  { href: "/authors", label: "Authors" },
];

function NavLinkIndicator({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn(pending && "opacity-50")} aria-busy={pending || undefined}>
      {children}
    </span>
  );
}

type HeaderNavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
};

function HeaderNavLink({ href, children, className, onNavigate }: HeaderNavLinkProps) {
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      <NavLinkIndicator>{children}</NavLinkIndicator>
    </Link>
  );
}

type NavButtonProps = Omit<ComponentProps<typeof Button>, "onPress"> & {
  href: string;
  onNavigate?: () => void;
};

function NavButton({ href, onNavigate, className, children, ...props }: NavButtonProps) {
  return (
    <Link href={href} onClick={onNavigate}>
      <NavLinkIndicator>
        <Button {...props} className={className}>
          {children}
        </Button>
      </NavLinkIndicator>
    </Link>
  );
}

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { isLoading, data, isError } = useQuery({
    queryKey: [SEARCH_POST_DATA, query],
    queryFn: ({ queryKey }) => searchPosts(queryKey[1] as string),
    enabled: query.length >= 2,
    refetchOnWindowFocus: false,
  });

  const debouncedSet = debounce((value: string) => setQuery(value), 200);

  const goToSearch = () => {
    if (query.trim()) {
      router.push(`/search/${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <SearchField
        aria-label="Search posts"
        onSubmit={goToSearch}
        className="max-w-xs"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            placeholder="Search…"
            onChange={(e) => {
              debouncedSet(e.target.value);
              setOpen(Boolean(e.target.value));
            }}
            onFocus={() => query && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </SearchField.Group>
      </SearchField>
      {open && query.length >= 2 ? (
        <div
          className="absolute top-full z-50 mt-1 w-full min-w-[16rem] rounded-xl border border-border bg-paper p-2 shadow-lg"
          role="listbox"
          aria-label="Search suggestions"
        >
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : isError ? (
            <p className="px-3 py-2 text-sm text-muted">Search failed. Try again.</p>
          ) : (data as Post[] | undefined)?.length ? (
            <ul className="max-h-60 overflow-y-auto">
              {(data as Post[]).map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.id}`}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                    role="option"
                  >
                    <NavLinkIndicator>{post.title}</NavLinkIndicator>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-sm text-muted">No results found</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function UserMenu() {
  const router = useRouter();
  const user = useCurrentUser();

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    router.push("/");
  };

  if (!user?.id) {
    return (
      <div className="flex items-center gap-2">
        <NavButton variant="ghost" size="sm" href="/login">
          <SignIn className="mr-1 size-4" />
          Sign in
        </NavButton>
        <NavButton size="sm" href="/register">
          <UserPlus className="mr-1 size-4" />
          Register
        </NavButton>
      </div>
    );
  }

  const initials = getAuthorNameInitials(user.name ?? "")
    .filter(Boolean)
    .join("");

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={user.name}
        className="button button--md button--ghost gap-2"
      >
        <Avatar size="sm">
          {user.imageURL ? (
            <Avatar.Image src={user.imageURL} alt="" />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar>
        <span className="hidden sm:inline">{user.name}</span>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item
            id="create"
            href={user.isAdmin ? "/admin/posts/create" : "/user/posts/create"}
          >
            Create
          </Dropdown.Item>
          <Dropdown.Item id="library" href="/library">
            Library
          </Dropdown.Item>
          <Dropdown.Item id="following" href="/following">
            Following
          </Dropdown.Item>
          <Dropdown.Item
            id="dashboard"
            href={user.isAdmin ? "/admin" : "/user/dashboard"}
          >
            Dashboard
          </Dropdown.Item>
          <Dropdown.Item
            id="posts"
            href={user.isAdmin ? "/admin/posts" : "/user/posts"}
          >
            Posts
          </Dropdown.Item>
          <Dropdown.Item
            id="profile"
            href={user.isAdmin ? "/admin/profile" : "/user/profile"}
          >
            Profile
          </Dropdown.Item>
          <Dropdown.Item id="logout" onAction={handleLogout}>
            Logout
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <NavLinkIndicator>
            <img src={AppIcon} alt="" className="size-8" />
            <span className="hidden font-medium tracking-wide sm:inline">
              Blogen
            </span>
          </NavLinkIndicator>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <HeaderNavLink
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-zinc-100 hover:text-ink dark:hover:bg-zinc-800"
            >
              {link.label}
            </HeaderNavLink>
          ))}
          <ThemeToggle />
          <UserMenu />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Open menu"
            onPress={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
        </div>
      </div>

      <Drawer isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>Menu</Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body className="space-y-4">
                <SearchBar />
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-sm font-medium"
                    onClick={() => setMobileOpen(false)}
                  >
                    <NavLinkIndicator>{link.label}</NavLinkIndicator>
                  </Link>
                ))}
                <MobileAuthLinks onClose={() => setMobileOpen(false)} />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </header>
  );
}

function MobileAuthLinks({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const user = useCurrentUser();

  if (user?.id) {
    return (
      <div className="space-y-2 border-t border-border pt-4">
        <Link
          href={user.isAdmin ? "/admin" : "/user/dashboard"}
          className="block py-2 text-sm"
          onClick={onClose}
        >
          <NavLinkIndicator>Dashboard</NavLinkIndicator>
        </Link>
        <Link
          href={user.isAdmin ? "/admin/posts" : "/user/posts"}
          className="block py-2 text-sm"
          onClick={onClose}
        >
          <NavLinkIndicator>Posts</NavLinkIndicator>
        </Link>
        <Link
          href={user.isAdmin ? "/admin/profile" : "/user/profile"}
          className="block py-2 text-sm"
          onClick={onClose}
        >
          <NavLinkIndicator>Profile</NavLinkIndicator>
        </Link>
        <Button
          variant="ghost"
          fullWidth
          onPress={async () => {
            await signOut();
            router.refresh();
            onClose();
            router.push("/");
          }}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 border-t border-border pt-4">
      <NavButton variant="ghost" fullWidth href="/login" onNavigate={onClose}>
        Sign in
      </NavButton>
      <NavButton fullWidth href="/register" onNavigate={onClose}>
        Register
      </NavButton>
    </div>
  );
}
