"use client";

import AppSidebar from "../../components/layout/AppSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppSidebar variant="admin">{children}</AppSidebar>;
}
