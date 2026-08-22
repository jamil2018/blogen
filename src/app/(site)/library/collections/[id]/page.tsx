import { redirect } from "next/navigation";
import CollectionDetailView from "../../../../../components/pages/CollectionDetailView";
import { getCurrentUser } from "../../../../../lib/db/auth";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/library");

  const { id } = await params;
  return <CollectionDetailView collectionId={id} />;
}
