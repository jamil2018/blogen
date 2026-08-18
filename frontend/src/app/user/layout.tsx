"use client";

import AppSidebar from "../../components/layout/AppSidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppSidebar variant="user">{children}</AppSidebar>;
}
