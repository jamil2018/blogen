import type { Metadata } from "next";
import { redirect } from "next/navigation";
import NewCollectionPageView from "../../../../../components/pages/NewCollectionPageView";
import { getCurrentUser } from "../../../../../lib/db/auth";

export const metadata: Metadata = {
  title: "New collection | Blogen",
  description: "Create a collection of saved sources.",
};

export default async function NewCollectionPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/library/collections/new");
  }
  return <NewCollectionPageView />;
}
