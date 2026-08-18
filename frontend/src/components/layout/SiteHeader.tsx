"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { clearUserData } from "../../redux/slices/userDataSlice";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import type { Post, User } from "../../types";
import { cn } from "../../lib/cn";
import AppIcon from "../../assets/appIcon.svg";
import { SignIn, UserPlus } from "@phosphor-icons/react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/categories", label: "Categories" },
  { href: "/authors", label: "Authors" },
];

type UserDataState = { user: Partial<User> };

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { isLoading, data } = useQuery({
    queryKey: [SEARCH_POST_DATA, query],
    queryFn: ({ queryKey }) => searchPosts(queryKey[1] as string),
    enabled: query.length > 0,
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
      {open && query ? (
        <div className="absolute top-full z-50 mt-1 w-full min-w-[16rem] rounded-xl border border-border bg-paper p-2 shadow-lg">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (data as Post[] | undefined)?.length ? (
            <ul className="max-h-60 overflow-y-auto">
              {(data as Post[]).map((post) => (
                <li key={post._id}>
                  <Link
                    href={`/posts/${post._id}`}
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onClick={() => setOpen(false)}
                  >
                    {post.title}
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
  const dispatch = useDispatch();
  const { user } = useSelector(
    (state: { userData: UserDataState }) => state.userData
  );

  if (!user._id) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">
            <SignIn className="mr-1 size-4" />
            Sign in
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm">
            <UserPlus className="mr-1 size-4" />
            Register
          </Button>
        </Link>
      </div>
    );
  }

  const initials = getAuthorNameInitials(user.name ?? "")
    .filter(Boolean)
    .join("");

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button variant="ghost" className="gap-2">
          <Avatar size="sm">
            {user.imageURL ? (
              <Avatar.Image src={user.imageURL} alt={user.name} />
            ) : (
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            )}
          </Avatar>
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="dashboard" href="/user/dashboard">
            Dashboard
          </Dropdown.Item>
          <Dropdown.Item id="posts" href="/user/posts">
            Posts
          </Dropdown.Item>
          <Dropdown.Item id="profile" href="/user/profile">
            Profile
          </Dropdown.Item>
          <Dropdown.Item id="logout" onAction={() => dispatch(clearUserData())}>
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
          <img src={AppIcon} alt="" className="size-8" />
          <span className="hidden font-medium tracking-wide sm:inline">
            Blogen
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="ghost" size="sm">
                {link.label}
              </Button>
            </Link>
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
                    {link.label}
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
  const dispatch = useDispatch();
  const { user } = useSelector(
    (state: { userData: UserDataState }) => state.userData
  );

  if (user._id) {
    return (
      <div className="space-y-2 border-t border-border pt-4">
        <Link href="/user/dashboard" className="block py-2 text-sm" onClick={onClose}>
          Dashboard
        </Link>
        <Link href="/user/posts" className="block py-2 text-sm" onClick={onClose}>
          Posts
        </Link>
        <Link href="/user/profile" className="block py-2 text-sm" onClick={onClose}>
          Profile
        </Link>
        <Button
          variant="ghost"
          fullWidth
          onPress={() => {
            dispatch(clearUserData());
            onClose();
          }}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 border-t border-border pt-4">
      <Link href="/login" className="flex-1" onClick={onClose}>
        <Button variant="ghost" fullWidth>
          Sign in
        </Button>
      </Link>
      <Link href="/register" className="flex-1" onClick={onClose}>
        <Button fullWidth>Register</Button>
      </Link>
    </div>
  );
}
