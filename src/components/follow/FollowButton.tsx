"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, toast } from "@heroui/react";
import { getIsFollowing, toggleFollow } from "../../actions/follows";
import type { FollowTargetType } from "../../lib/db/follows";
import { useCurrentUser } from "../auth/AuthProvider";

type FollowButtonProps = {
  targetType: FollowTargetType;
  targetId: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

export default function FollowButton({
  targetType,
  targetId,
  label,
  size = "sm",
  className,
}: FollowButtonProps) {
  const user = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ["follow", targetType, targetId];

  const { data: following = false, isLoading } = useQuery({
    queryKey,
    queryFn: () => getIsFollowing(targetType, targetId),
    enabled: Boolean(user && targetId),
  });

  const mutation = useMutation({
    mutationFn: () => toggleFollow(targetType, targetId),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result.following);
      queryClient.invalidateQueries({ queryKey: ["following-feed"] });
      queryClient.invalidateQueries({ queryKey: ["my-follows"] });
      toast(result.following ? "Following" : "Unfollowed", {
        variant: "success",
      });
    },
    onError: (error) => {
      toast(error instanceof Error ? error.message : "Could not update follow", {
        variant: "danger",
      });
    },
  });

  if (!targetId) return null;

  if (!user) {
    return (
      <Button
        size={size}
        variant="secondary"
        className={className ?? "rounded-full"}
        onPress={() =>
          router.push(
            `/login?next=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.pathname : "/"
            )}`
          )
        }
      >
        {label ?? "Follow"}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={following ? "ghost" : "secondary"}
      className={className ?? "rounded-full"}
      isDisabled={isLoading || mutation.isPending}
      onPress={() => mutation.mutate()}
      aria-pressed={following}
    >
      {following ? "Following" : label ?? "Follow"}
    </Button>
  );
}
