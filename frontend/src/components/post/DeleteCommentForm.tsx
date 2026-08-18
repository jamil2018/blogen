"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { deleteCommentById } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";

type DeleteCommentFormProps = {
  postId: string;
  commentId: string;
  onClose: () => void;
};

export default function DeleteCommentForm({
  postId,
  commentId,
  onClose,
}: DeleteCommentFormProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteCommentById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMENT_DATA] });
      onClose();
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Are you sure you want to delete this comment? This action cannot be
        undone.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onPress={onClose}>
          Cancel
        </Button>
        <Button
          variant="danger"
          isDisabled={mutation.isPending}
          onPress={() => mutation.mutate({ postId, commentId })}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
