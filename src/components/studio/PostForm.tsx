"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Hash, X } from "@phosphor-icons/react";
import * as yup from "yup";
import {
  Alert,
  Button,
  Checkbox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Select,
  Spinner,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import TiptapEditor from "../editor/TiptapEditor";
import PostCoverUpload from "../editor/PostCoverUpload";
import { getAllCategories } from "../../data/categoryQueryFunctions";
import {
  createPost,
  getPostById,
  getPostRevisions,
  updatePostById,
} from "../../data/postQueryFunctions";
import {
  CATEGORY_DATA,
  POST_DATA,
  SINGLE_POST_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import type { Category, Post, PostRevision } from "../../types";
import { getMyPublications } from "../../actions/publications";
import {
  calculateReadingTime,
  convertToText,
  countWords,
} from "../../utils/dataFormat";

const draftSchema = yup.object({
  title: yup.string().required("This field is required"),
  summary: yup.string().min(0).max(300),
  category: yup.string().required("This field is required"),
  description: yup.string(),
});

const publishSchema = yup.object({
  title: yup.string().required("This field is required"),
  summary: yup.string().required("This field is required").min(150).max(300),
  category: yup.string().required("This field is required"),
  image: yup.mixed(),
  description: yup.string().required("This field is required"),
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

type FormValues = {
  title: string;
  summary: string;
  category: string;
  tags: string[];
  description: string;
  image: File | null;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  scheduledAt: string;
  distributeWeb: boolean;
  distributeFollowers: boolean;
  distributeEmail: boolean;
  publicationId: string;
  distributionMode: "web_only" | "email_only" | "web_and_email";
  accessLevel: "public" | "members" | "paid";
  submitToPublication: boolean;
};

export default function PostForm({
  mode,
  postId,
  redirectPath,
  onSuccess,
}: PostFormProps) {
  const queryClient = useQueryClient();
  const [savedPostId, setSavedPostId] = useState<string | undefined>(postId);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const recoveryKey = `blogen-draft-${savedPostId ?? "new"}`;
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: [CATEGORY_DATA],
    queryFn: getAllCategories,
  });

  const { data: myPublications } = useQuery({
    queryKey: ["my-publications"],
    queryFn: getMyPublications,
  });

  const { data: existingPost, isLoading: postLoading } = useQuery({
    queryKey: [SINGLE_POST_DATA, savedPostId],
    queryFn: () => getPostById(savedPostId!),
    enabled: Boolean(savedPostId),
  });

  const mutation = useMutation({
    mutationFn: (input: {
      postId?: string;
      intent: "draft" | "publish" | "schedule";
      values: FormValues;
    }) => {
      const payload = {
        title: input.values.title,
        description: input.values.description,
        summary: input.values.summary,
        category: input.values.category,
        tags: input.values.tags,
        image: input.values.image,
        seoTitle: input.values.seoTitle || undefined,
        seoDescription: input.values.seoDescription || undefined,
        slug: input.values.slug || undefined,
        scheduledAt: input.values.scheduledAt || undefined,
        distributeWeb: input.values.distributeWeb,
        distributeFollowers: input.values.distributeFollowers,
        distributeEmail: input.values.distributeEmail,
        publicationId: input.values.publicationId || undefined,
        distributionMode: input.values.distributionMode,
        accessLevel: input.values.accessLevel,
        submitToPublication: input.values.submitToPublication,
      };
      if (input.postId) {
        return updatePostById({
          postId: input.postId,
          values: payload,
          intent: input.intent,
        });
      }
      return createPost({ ...payload, intent: input.intent });
    },
    onSuccess: (post: Post, variables) => {
      queryClient.invalidateQueries({ queryKey: [POST_DATA] });
      queryClient.invalidateQueries({ queryKey: [SINGLE_POST_DATA, post.id] });
      queryClient.invalidateQueries({ queryKey: ["post-revisions", post.id] });
      setSavedPostId(post.id);
      try {
        localStorage.removeItem(recoveryKey);
      } catch {
        /* ignore */
      }
      if (variables.intent === "publish" || variables.intent === "schedule") {
        toast(
          variables.intent === "schedule" ? "Post scheduled" : "Published",
          { variant: "success" }
        );
        onSuccess();
      } else {
        setAutosaveState("saved");
        toast("Draft saved", { variant: "success" });
      }
    },
    onError: () => {
      setAutosaveState("error");
    },
  });

  const { data: revisions } = useQuery({
    queryKey: ["post-revisions", savedPostId],
    queryFn: () => getPostRevisions(savedPostId!),
    enabled: Boolean(savedPostId),
  });

  const formik = useFormik<FormValues>({
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
      seoTitle: existingPost?.seoTitle ?? "",
      seoDescription: existingPost?.seoDescription ?? "",
      slug: existingPost?.slug ?? "",
      scheduledAt: existingPost?.scheduledAt
        ? existingPost.scheduledAt.slice(0, 16)
        : "",
      distributeWeb: existingPost?.distributeWeb ?? true,
      distributeFollowers: existingPost?.distributeFollowers ?? true,
      distributeEmail: existingPost?.distributeEmail ?? false,
      publicationId: existingPost?.publicationId ?? "",
      distributionMode: existingPost?.distributionMode ?? "web_only",
      accessLevel: existingPost?.accessLevel ?? "public",
      submitToPublication: false,
    },
    validationSchema: draftSchema,
    onSubmit: () => undefined,
  });

  useEffect(() => {
    if (existingPost || mode === "edit") return;
    try {
      const raw = localStorage.getItem(recoveryKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FormValues>;
      formik.setValues((prev) => ({
        ...prev,
        title: parsed.title ?? prev.title,
        summary: parsed.summary ?? prev.summary,
        category: parsed.category ?? prev.category,
        tags: parsed.tags ?? prev.tags,
        description: parsed.description ?? prev.description,
        seoTitle: parsed.seoTitle ?? prev.seoTitle,
        seoDescription: parsed.seoDescription ?? prev.seoDescription,
      }));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPost, mode, recoveryKey]);

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(
          recoveryKey,
          JSON.stringify({
            title: formik.values.title,
            summary: formik.values.summary,
            category: formik.values.category,
            tags: formik.values.tags,
            description: formik.values.description,
            seoTitle: formik.values.seoTitle,
            seoDescription: formik.values.seoDescription,
          })
        );
      } catch {
        /* ignore */
      }
      if (!formik.values.title || !formik.values.category) return;
      setAutosaveState("saving");
      mutation.mutate({
        postId: savedPostId,
        intent: "draft",
        values: formik.values,
      });
    }, 2500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formik.values.title,
    formik.values.summary,
    formik.values.category,
    formik.values.description,
    formik.values.tags,
    formik.values.seoTitle,
    formik.values.seoDescription,
    savedPostId,
  ]);

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

  const save = async (intent: "draft" | "publish" | "schedule") => {
    const schema =
      intent === "publish" || intent === "schedule" ? publishSchema : draftSchema;
    try {
      await schema.validate(formik.values, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const nextErrors: Record<string, string> = {};
        error.inner.forEach((item) => {
          if (item.path) nextErrors[item.path] = item.message;
        });
        formik.setErrors(nextErrors);
        formik.setTouched(
          Object.fromEntries(Object.keys(nextErrors).map((k) => [k, true]))
        );
        return;
      }
    }
    if (
      (intent === "publish" || intent === "schedule") &&
      mode === "create" &&
      !formik.values.image &&
      !existingPost?.imageURL
    ) {
      formik.setFieldError("image", "You need an image for your post");
      formik.setFieldTouched("image", true, false);
      return;
    }
    if (intent === "schedule" && !formik.values.scheduledAt) {
      toast("Pick a future date and time to schedule", { variant: "danger" });
      return;
    }
    mutation.mutate({
      postId: savedPostId,
      intent,
      values: formik.values,
    });
  };

  if (categoriesLoading || (Boolean(savedPostId) && postLoading && mode === "edit")) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const categoryList = (categories ?? []) as Category[];
  const status = existingPost?.status ?? "draft";
  const previewHref = savedPostId
    ? `/user/posts/preview/${savedPostId}`
    : undefined;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save("publish");
      }}
      className="mx-auto max-w-3xl"
    >
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
              {mode === "create" && !savedPostId ? "New story" : "Edit story"}
            </h1>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted dark:bg-zinc-800">
              {status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>
              {autosaveState === "saving"
                ? "Saving…"
                : autosaveState === "saved"
                  ? "Draft saved"
                  : autosaveState === "error"
                    ? "Autosave failed"
                    : `${wordCount} words`}
            </span>
            <span>{charCount} chars</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {readMinutes} min read
            </span>
            {previewHref ? (
              <Link href={previewHref} className="text-accent hover:underline">
                Preview
              </Link>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="rounded-full"
              isDisabled={mutation.isPending}
              onPress={() => void save("draft")}
            >
              Save draft
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-full"
              isDisabled={mutation.isPending}
              onPress={() => void save("schedule")}
            >
              Schedule
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full"
              isDisabled={mutation.isPending}
            >
              Publish
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

        <TextField name="seoTitle">
          <Label>SEO title (optional)</Label>
          <Input
            name="seoTitle"
            value={formik.values.seoTitle}
            onChange={formik.handleChange}
          />
        </TextField>
        <TextField name="seoDescription">
          <Label>SEO description (optional)</Label>
          <TextArea
            name="seoDescription"
            rows={2}
            value={formik.values.seoDescription}
            onChange={formik.handleChange}
          />
        </TextField>

        <TextField name="slug">
          <Label>URL slug</Label>
          <Input
            name="slug"
            value={formik.values.slug}
            onChange={formik.handleChange}
            placeholder="stable-url-slug"
          />
          <p className="mt-1 text-xs text-muted">
            Public URL: /p/{formik.values.slug || "your-slug"}. Changing a
            published slug keeps a redirect from the old path.
          </p>
        </TextField>

        <TextField name="scheduledAt">
          <Label>Schedule publish (optional)</Label>
          <Input
            name="scheduledAt"
            type="datetime-local"
            value={formik.values.scheduledAt}
            onChange={formik.handleChange}
          />
          <p className="mt-1 text-xs text-muted">
            Use Schedule to go live at this time via Vercel Cron.
          </p>
        </TextField>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Distribution</legend>
          <Checkbox
            isSelected={formik.values.distributeWeb}
            onChange={(v) => formik.setFieldValue("distributeWeb", v)}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>Web</Label>
            </Checkbox.Content>
          </Checkbox>
          <Checkbox
            isSelected={formik.values.distributeFollowers}
            onChange={(v) => formik.setFieldValue("distributeFollowers", v)}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>Followers feed</Label>
            </Checkbox.Content>
          </Checkbox>
          <Checkbox
            isSelected={formik.values.distributeEmail}
            onChange={(v) => formik.setFieldValue("distributeEmail", v)}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Label>Email newsletter (Resend)</Label>
            </Checkbox.Content>
          </Checkbox>
          <Select
            aria-label="Access level"
            selectedKey={formik.values.accessLevel}
            onSelectionChange={(key) =>
              formik.setFieldValue(
                "accessLevel",
                String(key) as FormValues["accessLevel"]
              )
            }
          >
            <Label>Access</Label>
            <ListBox>
              <ListBoxItem id="public" textValue="public">
                Public
              </ListBoxItem>
              <ListBoxItem id="members" textValue="members">
                Members (any active membership)
              </ListBoxItem>
              <ListBoxItem id="paid" textValue="paid">
                Paid tier only
              </ListBoxItem>
            </ListBox>
          </Select>
          <Select
            aria-label="Distribution mode"
            selectedKey={formik.values.distributionMode}
            onSelectionChange={(key) =>
              formik.setFieldValue(
                "distributionMode",
                String(key) as FormValues["distributionMode"]
              )
            }
          >
            <Label>Mode</Label>
            <ListBox>
              <ListBoxItem id="web_only" textValue="web_only">
                Web only
              </ListBoxItem>
              <ListBoxItem id="email_only" textValue="email_only">
                Email only (hidden from public archive)
              </ListBoxItem>
              <ListBoxItem id="web_and_email" textValue="web_and_email">
                Web + email
              </ListBoxItem>
            </ListBox>
          </Select>
        </fieldset>

        {(myPublications?.length ?? 0) > 0 ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Publication</legend>
            <Select
              aria-label="Publication"
              selectedKey={formik.values.publicationId || "none"}
              onSelectionChange={(key) =>
                formik.setFieldValue(
                  "publicationId",
                  String(key) === "none" ? "" : String(key)
                )
              }
            >
              <Label>Submit to publication</Label>
              <ListBox>
                <ListBoxItem id="none" textValue="none">
                  None (independent)
                </ListBoxItem>
                {(myPublications ?? []).map((pub) => (
                  <ListBoxItem key={pub.id} id={pub.id} textValue={pub.name}>
                    {pub.name}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select>
            {formik.values.publicationId ? (
              <Checkbox
                isSelected={formik.values.submitToPublication}
                onChange={(v) =>
                  formik.setFieldValue("submitToPublication", v)
                }
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label>Mark as submitted for editorial review</Label>
                </Checkbox.Content>
              </Checkbox>
            ) : null}
          </fieldset>
        ) : null}

        {savedPostId && (revisions as PostRevision[] | undefined)?.length ? (
          <section className="rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold">Revision history</h2>
            <p className="mt-1 text-xs text-muted">
              Immutable snapshots created on each publish (and scheduled go-live).
            </p>
            <ul className="mt-3 space-y-2">
              {(revisions as PostRevision[]).map((rev) => (
                <li
                  key={rev.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 text-sm last:border-0"
                >
                  <span className="font-medium">
                    Rev {rev.revisionNumber}: {rev.title}
                  </span>
                  <time className="text-xs text-muted" dateTime={rev.publishedAt}>
                    {new Date(rev.publishedAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

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
