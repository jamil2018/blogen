"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import ProfileView from "../../../../../components/studio/ProfileView";
import { Button } from "@heroui/react";

type EditUserPageProps = {
  params: Promise<{ userId: string }>;
};

export default function AdminEditUserPage({ params }: EditUserPageProps) {
  const { userId } = use(params);
  const router = useRouter();

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onPress={() => router.push("/admin/users")}>
        ← Back to users
      </Button>
      <ProfileView admin userId={userId} />
    </div>
  );
}
