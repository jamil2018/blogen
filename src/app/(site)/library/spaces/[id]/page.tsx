import { redirect } from "next/navigation";
import KnowledgeSpaceView from "../../../../../components/pages/KnowledgeSpaceView";
import { getCurrentUser } from "../../../../../lib/db/auth";

export default async function KnowledgeSpacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/library");

  const { id } = await params;
  return <KnowledgeSpaceView collectionId={id} />;
}
