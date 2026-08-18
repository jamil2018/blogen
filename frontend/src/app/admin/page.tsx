"use client";

import dynamic from "next/dynamic";

const AdminHomeScreen = dynamic(
  () => import("../../screens/admin/dashboard/AdminHomeScreen"),
  { ssr: false }
);

export default function AdminHomePage() {
  return <AdminHomeScreen />;
}
