"use client";

import Link from "next/link";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import {
  Alert,
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import TiptapEditor from "../editor/TiptapEditor";
import PostCoverUpload from "../editor/PostCoverUpload";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import {
  createPost,
  getPostById,
  updatePostById,
} from "../../data/postQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
  SINGLE_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import type { Category } from "../../types";

const createSchema = yup.object({
  title: yup.string().required("This field is required"),
  summary: yup.string().required("This field is required").min(150).max(300),
  category: yup.string().required("This field is required"),
  image: yup.mixed().required("You need an image for your post"),
  description: yup.string().required("This field is required"),
});

const editSchema = createSchema.shape({
  image: yup.mixed(),
});

type PostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  redirectPath: string;
  onSuccess: () => void;
};

export default function PostForm({
  mode,
  postId,
  redirectPath,
  onSuccess,
}: PostFormProps) {
  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
  });

  const { data: existingPost, isLoading: postLoading } = useQuery({
    queryKey: [SINGLE_POST_DATA, postId],
    queryFn: () => getPostById(postId!),
    enabled: mode === "edit" && Boolean(postId),
  });

  const mutation = useMutation({
    mutationFn: mode === "create" ? createPost : updatePostById,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POST_DATA] });
      onSuccess();
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: existingPost?.title ?? "",
      summary: existingPost?.summary ?? "",
      category:
        typeof existingPost?.category === "string"
          ? existingPost.category
          : existingPost?.category?._id ?? "",
      tags: existingPost?.tags?.join(", ") ?? "",
      description: existingPost?.description ?? "",
      image: null as File | null,
    },
    validationSchema: mode === "create" ? createSchema : editSchema,
    onSubmit: (values) => {
      const tags =
        typeof values.tags === "string" && values.tags.length > 0
          ? values.tags.split(",").map((t) => t.trim())
          : [];
      const postData = {
        title: values.title,
        description: values.description,
        summary: values.summary,
        category: values.category,
        tags,
        image: values.image,
      };
      if (mode === "edit" && postId) {
        mutation.mutate({ postId, values: postData });
      } else {
        mutation.mutate(postData);
      }
    },
  });

  if (categoriesLoading || (mode === "edit" && postLoading)) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const categoryList = (categories ?? []) as Category[];

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-2xl space-y-4">
      <Link href={redirectPath} className="text-sm text-teal-700 dark:text-teal-400">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold">
        {mode === "create" ? "Create a new post" : "Edit post"}
      </h1>

      {mutation.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Failed to save post</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <TextField
        name="title"
        isInvalid={Boolean(formik.touched.title && formik.errors.title)}
      >
        <Label>Title</Label>
        <Input
          id="title"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.title && formik.errors.title ? (
          <FieldError>{String(formik.errors.title)}</FieldError>
        ) : null}
      </TextField>

      <TextField
        name="summary"
        isInvalid={Boolean(formik.touched.summary && formik.errors.summary)}
      >
        <Label>Summary</Label>
        <TextArea
          id="summary"
          name="summary"
          rows={4}
          value={formik.values.summary}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.summary && formik.errors.summary ? (
          <FieldError>{String(formik.errors.summary)}</FieldError>
        ) : null}
      </TextField>

      <Select
        selectedKey={formik.values.category || null}
        onSelectionChange={(key) =>
          formik.setFieldValue("category", key ? String(key) : "")
        }
        placeholder="Select category"
      >
        <Label>Category</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {categoryList.map((cat) => (
              <ListBoxItem key={cat._id} id={cat._id} textValue={cat.title}>
                {cat.title}
              </ListBoxItem>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      {formik.touched.category && formik.errors.category ? (
        <p className="text-xs text-red-600">{String(formik.errors.category)}</p>
      ) : null}

      <TextField name="tags">
        <Label>Tags</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="Comma-separated tags"
          value={formik.values.tags}
          onChange={formik.handleChange}
        />
      </TextField>

      <PostCoverUpload
        value={formik.values.image}
        previewUrl={existingPost?.imageURL}
        onChange={(file) => formik.setFieldValue("image", file)}
      />
      {formik.touched.image && formik.errors.image ? (
        <p className="text-xs text-red-600">{String(formik.errors.image)}</p>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-medium">Description</p>
        <TiptapEditor
          value={formik.values.description}
          onChange={(html) => formik.setFieldValue("description", html)}
        />
        {formik.touched.description && formik.errors.description ? (
          <p className="mt-1 text-xs text-red-600">
            {String(formik.errors.description)}
          </p>
        ) : null}
      </div>

      <Button type="submit" isDisabled={mutation.isPending}>
        {mode === "create" ? "Create post" : "Save changes"}
      </Button>
    </form>
  );
}
