"use client";

import Link from "next/link";
import { useMemo, useState, KeyboardEvent } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Hash, X } from "@phosphor-icons/react";
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
import {
  calculateReadingTime,
  convertToText,
  countWords,
} from "../../utils/dataFormat";

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

function TagChipInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(input);
    }
    if (event.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-border bg-paper px-3 py-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 dark:bg-teal-950 dark:text-teal-300"
          >
            <Hash className="size-3" />
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-teal-100 dark:hover:bg-teal-900"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length ? "Add another" : "Type and press Enter"}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}

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
    mutationFn: (input: {
      postId?: string;
      values: {
        title: string;
        description: string;
        summary: string;
        category: string;
        tags: string[];
        image: File | null;
      };
    }) => {
      if (mode === "edit" && input.postId) {
        return updatePostById({ postId: input.postId, values: input.values });
      }
      return createPost(input.values);
    },
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
          : existingPost?.category?.id ?? "",
      tags: existingPost?.tags ?? ([] as string[]),
      description: existingPost?.description ?? "",
      image: null as File | null,
    },
    validationSchema: mode === "create" ? createSchema : editSchema,
    onSubmit: (values) => {
      mutation.mutate({
        postId,
        values: {
          title: values.title,
          description: values.description,
          summary: values.summary,
          category: values.category,
          tags: values.tags,
          image: values.image,
        },
      });
    },
  });

  const plainText = useMemo(
    () => convertToText(formik.values.description),
    [formik.values.description]
  );
  const wordCount = useMemo(() => {
    const text = plainText.trim();
    return text ? countWords(text) : 0;
  }, [plainText]);
  const charCount = plainText.length;
  const readMinutes = calculateReadingTime(plainText || " ");

  if (categoriesLoading || (mode === "edit" && postLoading)) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const categoryList = (categories ?? []) as Category[];

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-3xl">
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-border bg-paper/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-paper/80 md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={redirectPath}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <h1 className="text-lg font-semibold tracking-tight">
              {mode === "create" ? "New story" : "Edit story"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {readMinutes} min read
            </span>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              isDisabled={mutation.isPending}
            >
              {mode === "create" ? "Publish" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {mutation.isError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to save post"}
              </Alert.Description>
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
            placeholder="Give your story a headline"
          />
          {formik.touched.title && formik.errors.title ? (
            <FieldError>{String(formik.errors.title)}</FieldError>
          ) : null}
        </TextField>

        <PostCoverUpload
          value={formik.values.image}
          previewUrl={existingPost?.imageURL}
          onChange={(file) => {
            formik.setFieldValue("image", file);
            formik.setFieldTouched("image", true, false);
          }}
        />
        {formik.touched.image && formik.errors.image ? (
          <p className="text-xs text-red-600">{String(formik.errors.image)}</p>
        ) : null}

        <TextField
          name="summary"
          isInvalid={Boolean(formik.touched.summary && formik.errors.summary)}
        >
          <Label>Summary</Label>
          <TextArea
            id="summary"
            name="summary"
            rows={3}
            value={formik.values.summary}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="150 to 300 characters for cards and search"
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
                <ListBoxItem key={cat.id} id={cat.id} textValue={cat.title}>
                  {cat.title}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        {formik.touched.category && formik.errors.category ? (
          <p className="text-xs text-red-600">{String(formik.errors.category)}</p>
        ) : null}

        <TagChipInput
          tags={formik.values.tags}
          onChange={(tags) => formik.setFieldValue("tags", tags)}
        />

        <div>
          <p className="mb-2 text-sm font-medium">Body</p>
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
      </div>
    </form>
  );
}
