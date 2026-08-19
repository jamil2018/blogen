"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import {
  Button,
  FieldError,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  getCommentByPostIdCommentId,
  updateCommentByPostIdCommentId,
} from "../../data/commentQueryFunctions";
import {
  COMMENT_DATA,
  SINGLE_COMMENT_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";

const schema = yup.object({
  text: yup.string().required("This field is required"),
});

type EditCommentFormProps = {
  postId: string;
  commentId: string;
  onClose: () => void;
};

export default function EditCommentForm({
  postId,
  commentId,
  onClose,
}: EditCommentFormProps) {
  const queryClient = useQueryClient();
  const { isLoading, data } = useQuery({
    queryKey: [SINGLE_COMMENT_DATA, { postId, commentId }],
    queryFn: ({ queryKey }) =>
      getCommentByPostIdCommentId(
        queryKey[1] as { postId: string; commentId: string }
      ),
  });

  const mutation = useMutation({
    mutationFn: updateCommentByPostIdCommentId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMMENT_DATA] });
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: { text: "" },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: (values) =>
      mutation.mutate({
        postId,
        commentId,
        values: { text: values.text },
      }),
  });

  useEffect(() => {
    if (data?.text) {
      formik.setFieldValue("text", data.text);
    }
  }, [data?.text]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <TextField
        name="text"
        isInvalid={Boolean(formik.touched.text && formik.errors.text)}
      >
        <Label>Comment</Label>
        <TextArea
          id="text"
          name="text"
          rows={5}
          value={formik.values.text}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.text && formik.errors.text ? (
          <FieldError>{String(formik.errors.text)}</FieldError>
        ) : null}
      </TextField>
      <Button type="submit" isDisabled={mutation.isPending}>
        Save
      </Button>
    </form>
  );
}
