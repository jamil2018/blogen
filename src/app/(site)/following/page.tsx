import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FollowingPageView from "../../../components/pages/FollowingPageView";
import { getCurrentUser } from "../../../lib/db/auth";

export const metadata: Metadata = {
  title: "Following · Blogen",
  description: "Chronological feed from authors and topics you follow.",
};

export default async function FollowingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/following");
  }
  return <FollowingPageView />;
}
