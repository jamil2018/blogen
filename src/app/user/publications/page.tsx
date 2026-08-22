import { Suspense } from "react";
import { StudioPageFallback } from "../../../components/feedback/StudioSkeleton";
import PublicationsStudioView from "../../../components/studio/PublicationsStudioView";

export const dynamic = "force-dynamic";

export default function UserPublicationsPage() {
  return (
    <Suspense
      fallback={<StudioPageFallback />}
    >
      <PublicationsStudioView />
    </Suspense>
  );
}
