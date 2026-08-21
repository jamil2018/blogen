import { Suspense } from "react";
import { Spinner } from "@heroui/react";
import PublicationsStudioView from "../../../components/studio/PublicationsStudioView";

export const dynamic = "force-dynamic";

export default function UserPublicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <PublicationsStudioView />
    </Suspense>
  );
}
