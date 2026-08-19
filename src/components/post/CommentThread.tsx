"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  FieldError,
  Label,
  Skeleton,
  TextArea,
  TextField,
} from "@heroui/react";

import { useSelector } from "react-redux";
import { createCommentByPostId } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import type { Comment, User } from "../../types";
import EmptyState from "../feedback/EmptyState";

const schema = yup.object({
  text: yup.string().required("This field is required"),
});

type CommentThreadProps = {
  postId: string;
  comments?: Comment[];
  isLoading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function CommentThread({
  postId,
  comments,
  isLoading,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const { user } = useSelector(
    (state: { userData: { user: Partial<User> } }) => state.userData
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCommentByPostId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMENT_DATA] });
      formik.resetForm();
    },
  });

  const formik = useFormik({
    initialValues: { text: "" },
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate({ postId, values }),
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : comments?.length ? (
        <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
          {comments.map((comment) => {
            const author =
              typeof comment.author === "object"
                ? comment.author
                : ({ name: "Unknown" } as User);
            const initials = getAuthorNameInitials(author.name ?? "")
              .filter(Boolean)
              .join("");
            const canEdit = user._id === author._id;

            return (
              <li key={comment._id}>
                <Card className="p-4">
                  <div className="flex gap-4">
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <Avatar size="sm">
                        {author.imageURL ? (
                          <Avatar.Image src={author.imageURL} alt={author.name} />
                        ) : (
                          <Avatar.Fallback>{initials}</Avatar.Fallback>
                        )}
                      </Avatar>
                      <Link
                        href={`/authors/${author._id}`}
                        className="text-xs text-muted hover:text-ink"
                      >
                        {author.name}
                      </Link>
                    </div>
                    <p className="flex-1 text-sm">{comment.text}</p>
                    {canEdit ? (
                      <div className="flex shrink-0 gap-1">
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          aria-label="Edit comment"
                          onPress={() => onEdit(comment._id)}
                        >
                          <PencilSimple className="size-4" />
                        </Button>
                        <Button
                          isIconOnly
                          variant="ghost"
                          size="sm"
                          aria-label="Delete comment"
                          onPress={() => onDelete(comment._id)}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No comments yet" description="Be the first to share your thoughts." />
      )}

      {!user._id ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              You need to be logged in to post comments.{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <form onSubmit={formik.handleSubmit} className="space-y-3">
        <TextField
          name="text"
          isDisabled={!user._id || mutation.isPending}
          isInvalid={Boolean(formik.touched.text && formik.errors.text)}
        >
          <Label>Post a comment</Label>
          <TextArea
            id="text"
            name="text"
            placeholder="Share your thoughts…"
            rows={4}
            value={formik.values.text}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.text && formik.errors.text ? (
            <FieldError>{String(formik.errors.text)}</FieldError>
          ) : null}
        </TextField>
        <Button
          type="submit"
          variant="secondary"
          isDisabled={!user._id || mutation.isPending}
        >
          Save
        </Button>
      </form>
    </div>
  );
}
