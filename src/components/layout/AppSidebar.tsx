"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Article,
  ChartBar,
  CurrencyDollar,
  Folder,
  List as MenuIcon,
  PenNib,
  ShieldCheck,
  SignOut,
  User,
  Users,
  Ticket,
} from "@phosphor-icons/react";
import { Avatar, Button, Drawer } from "@heroui/react";
import { signOut } from "../../actions/auth";
import { cn } from "../../lib/cn";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { useCurrentUser } from "../auth/AuthProvider";
import ThemeToggle from "../theme/ThemeToggle";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match?: (path: string) => boolean;
};

function getNavItems(variant: "user" | "admin"): NavItem[] {
  if (variant === "admin") {
    return [
      {
        href: "/admin/users",
        label: "Users",
        icon: <Users className="size-4" weight="duotone" />,
        match: (p) => p.startsWith("/admin/users"),
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: <Folder className="size-4" weight="duotone" />,
        match: (p) => p === "/admin/categories",
      },
      {
        href: "/admin/posts",
        label: "Posts",
        icon: <Article className="size-4" weight="duotone" />,
        match: (p) => p.includes("/admin/posts"),
      },
      {
        href: "/admin/moderation",
        label: "Moderation",
        icon: <ShieldCheck className="size-4" weight="duotone" />,
        match: (p) => p.startsWith("/admin/moderation"),
      },
      {
        href: "/admin/payments",
        label: "Payments",
        icon: <CurrencyDollar className="size-4" weight="duotone" />,
        match: (p) => p.startsWith("/admin/payments"),
      },
      {
        href: "/admin/profile",
        label: "Profile",
        icon: <User className="size-4" weight="duotone" />,
        match: (p) => p.includes("/admin/profile"),
      },
    ];
  }

  return [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: <ChartBar className="size-4" weight="duotone" />,
      match: (p) => p.includes("/user/dashboard"),
    },
    {
      href: "/user/posts",
      label: "Posts",
      icon: <Article className="size-4" weight="duotone" />,
      match: (p) => p.includes("/user/posts"),
    },
    {
      href: "/user/profile",
      label: "Profile",
      icon: <User className="size-4" weight="duotone" />,
      match: (p) => p.includes("/user/profile"),
    },
  ];
}

function SidebarNav({
  variant,
  onNavigate,
}: {
  variant: "user" | "admin";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const items = getNavItems(variant);
  const homeHref = variant === "admin" ? "/admin" : "/";
  const createHref =
    variant === "admin" ? "/admin/posts/create" : "/user/posts/create";

  const logout = async () => {
    await signOut();
    router.refresh();
    router.push("/");
    onNavigate?.();
  };

  const initials = user?.name
    ? getAuthorNameInitials(user.name).filter(Boolean).join("")
    : "";

  return (
    <nav className="flex h-full flex-col">
      <Link
        href={homeHref}
        className="mb-6 block text-center text-lg font-semibold tracking-tight"
        onClick={onNavigate}
      >
        Blogen
      </Link>

      <Link href={createHref} onClick={onNavigate} className="mb-4 block">
        <Button className="w-full rounded-full" size="sm">
          <PenNib className="mr-2 size-4" weight="bold" />
          New Story
        </Button>
      </Link>

      <ul className="flex-1 space-y-1">
        {items.map((item) => {
          const active = item.match?.(pathname) ?? pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-muted hover:bg-zinc-100 hover:text-ink dark:hover:bg-zinc-800"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto space-y-3 border-t border-border pt-4">
        {user ? (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-zinc-50/80 px-3 py-2.5 dark:bg-zinc-900/50">
            <Avatar size="sm">
              {user.imageURL ? (
                <Avatar.Image src={user.imageURL} alt={user.name} />
              ) : (
                <Avatar.Fallback>{initials}</Avatar.Fallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <span
                className={cn(
                  "mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                  user.isAdmin
                    ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {user.isAdmin ? (
                  <ShieldCheck className="size-3" weight="fill" />
                ) : null}
                {user.isAdmin ? "Admin" : "Author"}
              </span>
            </div>
          </div>
        ) : null}
        <ThemeToggle />
        <Button
          variant="ghost"
          fullWidth
          className="justify-start rounded-full"
          onPress={logout}
        >
          <SignOut className="mr-2 size-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}

export default function AppSidebar({
  variant,
  children,
}: {
  variant: "user" | "admin";
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-border p-4 md:block">
        <SidebarNav variant={variant} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center border-b border-border p-4 md:hidden">
          <Button
            isIconOnly
            variant="ghost"
            aria-label="Open sidebar"
            onPress={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-5" />
          </Button>
          <span className="ml-2 font-semibold tracking-tight">Blogen</span>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      <Drawer isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Backdrop className="bg-ink/25 backdrop-blur-sm">
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>Studio</Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body>
                <SidebarNav
                  variant={variant}
                  onNavigate={() => setMobileOpen(false)}
                />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
