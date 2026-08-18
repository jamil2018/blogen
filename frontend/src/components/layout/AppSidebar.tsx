"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Article,
  ChartBar,
  Gear,
  List as MenuIcon,
  SignOut,
  User,
  Users,
  Folder,
} from "@phosphor-icons/react";
import { Button, Drawer } from "@heroui/react";
import { useDispatch } from "react-redux";
import { clearUserData } from "../../redux/slices/userDataSlice";
import { cn } from "../../lib/cn";
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
        icon: <Users className="size-4" />,
        match: (p) => p === "/admin/users",
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: <Folder className="size-4" />,
        match: (p) => p === "/admin/categories",
      },
      {
        href: "/admin/posts",
        label: "Posts",
        icon: <Article className="size-4" />,
        match: (p) => p.includes("/admin/posts"),
      },
      {
        href: "/admin/profile",
        label: "Profile",
        icon: <User className="size-4" />,
        match: (p) => p.includes("/admin/profile"),
      },
    ];
  }

  return [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: <ChartBar className="size-4" />,
      match: (p) => p.includes("/user/dashboard"),
    },
    {
      href: "/user/posts",
      label: "Posts",
      icon: <Article className="size-4" />,
      match: (p) => p.includes("/user/posts"),
    },
    {
      href: "/user/profile",
      label: "Profile",
      icon: <User className="size-4" />,
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
  const dispatch = useDispatch();
  const router = useRouter();
  const items = getNavItems(variant);
  const homeHref = variant === "admin" ? "/admin" : "/";

  const logout = () => {
    dispatch(clearUserData());
    router.push("/");
    onNavigate?.();
  };

  return (
    <nav className="flex h-full flex-col">
      <Link
        href={homeHref}
        className="mb-6 block text-center text-lg font-medium tracking-wide"
        onClick={onNavigate}
      >
        Blogen
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
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
      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <ThemeToggle />
        <Button
          variant="ghost"
          fullWidth
          className="justify-start"
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
      <aside className="hidden w-60 shrink-0 border-r border-border p-4 md:block">
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
          <span className="ml-2 font-medium">Blogen</span>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      <Drawer isOpen={mobileOpen} onOpenChange={setMobileOpen}>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog>
              <Drawer.Header>
                <Drawer.Heading>Navigation</Drawer.Heading>
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
