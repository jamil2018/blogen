import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LibraryPageView from "../../../components/pages/LibraryPageView";
import { getCurrentUser } from "../../../lib/db/auth";

export const metadata: Metadata = {
  title: "Library | Blogen",
  description: "Your saved posts on Blogen.",
};

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/library");
  }
  return <LibraryPageView />;
}
