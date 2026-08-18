"use client";

import dynamic from "next/dynamic";

const UserDashboard = dynamic(
  () => import("../../../screens/user/Dashboard/UserDashboard"),
  { ssr: false }
);

export default function UserDashboardPage() {
  return <UserDashboard />;
}
