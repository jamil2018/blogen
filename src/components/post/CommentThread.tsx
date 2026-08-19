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
  Chip,
  FieldError,
  Label,
  Skeleton,
  TextArea,
  TextField,
} from "@heroui/react";

import { useCurrentUser } from "../auth/AuthProvider";
import { createCommentByPostId } from "../../data/commentQueryFunctions";
import { COMMENT_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials } from "../../utils/dataFormat";
import { formatRelativeTime } from "../../utils/relativeTime";
import type { Comment, User } from "../../types";
import EmptyState from "../feedback/EmptyState";
import Reveal from "../motion/Reveal";

const MAX_COMMENT_LENGTH = 500;

const schema = yup.object({
  text: yup
    .string()
    .required("This field is required")
    .max(MAX_COMMENT_LENGTH, `Maximum ${MAX_COMMENT_LENGTH} characters`),
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
  const user = useCurrentUser();
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

  const remaining = MAX_COMMENT_LENGTH - formik.values.text.length;

  return (
    <div id="comments" className="scroll-mt-24 space-y-6">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : comments?.length ? (
        <ul className="space-y-4">
          {comments.map((comment, index) => {
            const author =
              typeof comment.author === "object"
                ? comment.author
                : ({ name: "Unknown" } as User);
            const initials = getAuthorNameInitials(author.name ?? "")
              .filter(Boolean)
              .join("");
            const canEdit = user?.id === author.id;

            return (
              <Reveal key={comment.id} delay={index * 0.04}>
                <li>
                  <Card className="p-4 transition-shadow hover:shadow-sm">
                    <div className="flex gap-3">
                      <Avatar size="sm" className="shrink-0">
                        {author.imageURL ? (
                          <Avatar.Image src={author.imageURL} alt={author.name} />
                        ) : (
                          <Avatar.Fallback>{initials}</Avatar.Fallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/authors/${author.id}`}
                            className="text-sm font-medium text-ink transition-colors hover:text-accent"
                          >
                            {author.name}
                          </Link>
                          {author.isAdmin ? (
                            <Chip size="sm" variant="soft" color="accent">
                              Author
                            </Chip>
                          ) : null}
                          {comment.createdAt ? (
                            <time
                              className="text-xs text-muted"
                              dateTime={comment.createdAt}
                              title={new Date(comment.createdAt).toLocaleString()}
                            >
                              {formatRelativeTime(comment.createdAt)}
                            </time>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink">
                          {comment.text}
                        </p>
                      </div>
                      {canEdit ? (
                        <div className="flex shrink-0 gap-0.5">
                          <Button
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            aria-label="Edit comment"
                            onPress={() => onEdit(comment.id)}
                          >
                            <PencilSimple className="size-4" />
                          </Button>
                          <Button
                            isIconOnly
                            variant="ghost"
                            size="sm"
                            aria-label="Delete comment"
                            onPress={() => onDelete(comment.id)}
                          >
                            <Trash className="size-4" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                </li>
              </Reveal>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          title="No comments yet"
          description="Be the first to share your thoughts on this article."
        />
      )}

      {!user?.id ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              You need to be logged in to post comments.{" "}
              <Link href="/login" className="font-medium text-accent underline underline-offset-2">
                Sign in
              </Link>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <Card className="p-4">
        <form onSubmit={formik.handleSubmit} className="space-y-3">
          <TextField
            name="text"
            isDisabled={!user?.id || mutation.isPending}
            isInvalid={Boolean(formik.touched.text && formik.errors.text)}
          >
            <Label>Join the conversation</Label>
            <TextArea
              id="text"
              name="text"
              placeholder="Share your thoughts..."
              rows={4}
              value={formik.values.text}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              maxLength={MAX_COMMENT_LENGTH}
            />
            {formik.touched.text && formik.errors.text ? (
              <FieldError>{String(formik.errors.text)}</FieldError>
            ) : null}
          </TextField>
          <div className="flex items-center justify-between gap-3">
            <span
              className={
                remaining < 50 ? "text-xs text-amber-600 dark:text-amber-400" : "text-xs text-muted"
              }
            >
              {remaining} characters remaining
            </span>
            <Button
              type="submit"
              variant="primary"
              className="rounded-full px-5"
              isDisabled={!user?.id || mutation.isPending || !formik.values.text.trim()}
            >
              Post comment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
