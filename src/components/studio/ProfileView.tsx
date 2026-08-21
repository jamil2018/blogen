"use client";

import { useCallback, useRef, useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  EnvelopeSimple,
  FacebookLogo,
  LinkedinLogo,
  TwitterLogo,
  User,
} from "@phosphor-icons/react";
import * as yup from "yup";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import {
  getUserById,
  updateUser,
  updateUserById,
} from "../../data/userQueryFunctions";
import type { ProfileInput } from "../../actions/users";
async function clearMyReadingProgress() {
  return;
}
async function deleteMyReaderData() {
  return { ok: true };
}
async function exportMyAccountData() {
  return { exportedAt: new Date().toISOString() };
}
async function getMyPreferences() {
  return { readingHistoryEnabled: false };
}
async function updateMyPreferences(_input: { readingHistoryEnabled: boolean }) {
  return { readingHistoryEnabled: false };
}
import {
  clearMyReadingProgress,
  deleteMyReaderData,
  exportMyAccountData,
  getMyPreferences,
  updateMyPreferences,
} from "../../actions/reading";
import {
  clearMyReadingProgress,
  deleteMyReaderData,
  exportMyAccountData,
  getMyPreferences,
  updateMyPreferences,
} from "../../actions/reading";
import {
  clearMyReadingProgress,
  deleteMyReaderData,
  exportMyAccountData,
  getMyPreferences,
  updateMyPreferences,
} from "../../actions/reading";
import {
  SINGLE_AUTHOR_DATA,
  USER_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials, sanitizeSocialURL } from "../../utils/dataFormat";
import { useCurrentUser } from "../auth/AuthProvider";
import { cn } from "../../lib/cn";

const schema = yup.object({
  name: yup.string().required("Required"),
  bio: yup.string(),
  email: yup.string().email("Please enter a valid email address"),
});

const adminEditSchema = schema.shape({
  email: yup
    .string()
    .required("Required")
    .email("Please enter a valid email address"),
});

type ProfileViewProps = {
  admin?: boolean;
  userId?: string;
};

function SocialField({
  name,
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <TextField name={name}>
      <Label>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {icon}
        </span>
        <Input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
    </TextField>
  );
}

function LiveAuthorPreview({
  name,
  bio,
  imageUrl,
  previewUrl,
  twitterId,
  linkedinId,
  facebookId,
  email,
}: {
  name: string;
  bio: string;
  imageUrl?: string;
  previewUrl: string | null;
  twitterId: string;
  linkedinId: string;
  facebookId: string;
  email: string;
}) {
  const initials = getAuthorNameInitials(name).filter(Boolean).join("");
  const avatarSrc = previewUrl ?? imageUrl;

  const socials = [
    { icon: TwitterLogo, href: twitterId, label: "Twitter" },
    { icon: LinkedinLogo, href: linkedinId, label: "LinkedIn" },
    { icon: FacebookLogo, href: facebookId, label: "Facebook" },
    { icon: EnvelopeSimple, href: email ? `mailto:${email}` : "", label: "Email" },
  ].filter((s) => s.href);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-zinc-50 px-4 py-3 dark:bg-zinc-900/50">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Live preview
        </p>
      </div>
      <div className="p-6 text-center">
        <Avatar size="lg" className="mx-auto">
          {avatarSrc ? (
            <Avatar.Image src={avatarSrc} alt={name || "Author"} />
          ) : (
            <Avatar.Fallback>{initials || "?"}</Avatar.Fallback>
          )}
        </Avatar>
        <p className="mt-4 text-lg font-semibold tracking-tight">
          {name || "Your name"}
        </p>
        <p className="mt-2 line-clamp-4 text-sm text-muted">
          {bio || "Your bio will appear on public author pages."}
        </p>
        {socials.length ? (
          <div className="mt-4 flex justify-center gap-2">
            {socials.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted"
                title={label}
                aria-label={label}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export default function ProfileView({ admin = false, userId }: ProfileViewProps) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const targetId = userId ?? currentUser?.id;
  const isAdminUserEdit = Boolean(admin && userId);

  const [dragging, setDragging] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, targetId],
    queryFn: () => getUserById(targetId!),
    enabled: Boolean(targetId),
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileInput) => {
      if (userId) {
        return updateUserById({ userId, values });
      }
      return updateUser(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SINGLE_AUTHOR_DATA] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [USER_DATA] });
      }
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name ?? "",
      email: data?.email ?? "",
      bio: data?.bio ?? "",
      facebookId: data?.facebookId ?? "",
      linkedinId: data?.linkedinId ?? "",
      twitterId: data?.twitterId ?? "",
      websiteUrl: data?.websiteUrl ?? "",
      expertiseTopics: (data?.expertiseTopics ?? []).join(", "),
      isAdmin: data?.isAdmin ?? false,
      image: null as File | null,
    },
    validationSchema: isAdminUserEdit ? adminEditSchema : schema,
    onSubmit: (values) => {
      const payload: ProfileInput = {
        name: values.name,
        bio: values.bio,
        facebookId: sanitizeSocialURL(values.facebookId),
        linkedinId: sanitizeSocialURL(values.linkedinId),
        twitterId: sanitizeSocialURL(values.twitterId),
        websiteUrl: values.websiteUrl.trim() || undefined,
        expertiseTopics: values.expertiseTopics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        image: values.image,
      };
      if (isAdminUserEdit) {
        payload.email = values.email;
        payload.isAdmin = values.isAdmin;
      }
      mutation.mutate(payload);
    },
  });

  const handleAvatar = useCallback(
    (file: File | null) => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      if (file) {
        setAvatarPreview(URL.createObjectURL(file));
      } else {
        setAvatarPreview(null);
      }
      formik.setFieldValue("image", file);
    },
    [avatarPreview, formik]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const initials = getAuthorNameInitials(formik.values.name).filter(Boolean).join("");

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isAdminUserEdit ? "Edit user" : "Profile"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {isAdminUserEdit
          ? "Update account details and permissions."
          : "Shape how readers see you across Blogen."}
      </p>

      {mutation.isSuccess ? (
        <Alert status="success" className="mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {isAdminUserEdit ? "User updated" : "Profile updated"}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <LiveAuthorPreview
            name={formik.values.name}
            bio={formik.values.bio}
            imageUrl={data?.imageURL}
            previewUrl={avatarPreview}
            twitterId={formik.values.twitterId}
            linkedinId={formik.values.linkedinId}
            facebookId={formik.values.facebookId}
            email={formik.values.email}
          />
        </div>

        <div className="space-y-5">
          <div>
            <Label>Avatar</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleAvatar(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file?.type.startsWith("image/")) handleAvatar(file);
              }}
              className={cn(
                "mt-2 flex w-full items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 text-left transition-colors",
                dragging
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/40"
              )}
            >
              <Avatar size="md">
                {avatarPreview || data?.imageURL ? (
                  <Avatar.Image
                    src={avatarPreview ?? data?.imageURL}
                    alt={formik.values.name}
                  />
                ) : (
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                )}
              </Avatar>
              <div>
                <p className="flex items-center text-sm font-medium">
                  <Camera className="mr-1.5 size-4" />
                  Drop photo or browse
                </p>
                <p className="text-xs text-muted">PNG, JPG, or WebP</p>
              </div>
            </button>
          </div>

          <TextField name="name">
            <Label>Name</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                className="pl-10"
              />
            </div>
          </TextField>

          {isAdminUserEdit ? (
            <>
              <TextField name="email">
                <Label>Email</Label>
                <div className="relative">
                  <EnvelopeSimple className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <Input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className="pl-10"
                  />
                </div>
              </TextField>
              <Checkbox
                isSelected={formik.values.isAdmin}
                onChange={(isSelected) =>
                  formik.setFieldValue("isAdmin", isSelected)
                }
              >
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Label>Admin</Label>
                </Checkbox.Content>
              </Checkbox>
            </>
          ) : null}

          <TextField name="bio">
            <Label>Bio</Label>
            <TextArea
              name="bio"
              rows={4}
              value={formik.values.bio}
              onChange={formik.handleChange}
              placeholder="A short introduction for readers"
            />
          </TextField>

          <TextField name="expertiseTopics">
            <Label>Expertise topics</Label>
            <Input
              name="expertiseTopics"
              value={formik.values.expertiseTopics}
              onChange={formik.handleChange}
              placeholder="Comma-separated topics (e.g. typescript, design)"
            />
          </TextField>

          <TextField name="websiteUrl">
            <Label>Website</Label>
            <Input
              name="websiteUrl"
              value={formik.values.websiteUrl}
              onChange={formik.handleChange}
              placeholder="https://…"
            />
          </TextField>

          <SocialField
            name="twitterId"
            label="Twitter / X"
            icon={<TwitterLogo className="size-4" />}
            value={formik.values.twitterId}
            onChange={(v) => formik.setFieldValue("twitterId", v)}
            placeholder="handle"
          />

          <SocialField
            name="linkedinId"
            label="LinkedIn"
            icon={<LinkedinLogo className="size-4" />}
            value={formik.values.linkedinId}
            onChange={(v) => formik.setFieldValue("linkedinId", v)}
            placeholder="profile slug"
          />

          <SocialField
            name="facebookId"
            label="Facebook"
            icon={<FacebookLogo className="size-4" />}
            value={formik.values.facebookId}
            onChange={(v) => formik.setFieldValue("facebookId", v)}
            placeholder="username"
          />

          <Button type="submit" className="rounded-full" isDisabled={mutation.isPending}>
            {isAdminUserEdit ? "Save user" : "Save profile"}
          </Button>

          {!isAdminUserEdit ? <AccountPrivacySection /> : null}
        </div>
      </div>
    </form>
  );
}

function AccountPrivacySection() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { data: prefs, refetch } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: getMyPreferences,
  });

  const toggleProgress = async (enabled: boolean) => {
    setBusy(true);
    setMessage(null);
    try {
      await updateMyPreferences({ readingProgressEnabled: enabled });
      await refetch();
      setMessage(
        enabled
          ? "Reading progress enabled"
          : "Reading progress disabled (Library unaffected)"
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const clearProgress = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await clearMyReadingProgress();
      setMessage("Reading progress cleared");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Clear failed");
    } finally {
      setBusy(false);
    }
  };

  const exportAccount = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const payload = await exportMyAccountData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blogen-account-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Account data exported");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteReader = async () => {
    if (
      !window.confirm(
        "Delete Library, follows, reading progress, and preferences? This cannot be undone."
      )
    ) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await deleteMyReaderData();
      setMessage("Reader data deleted");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-10 space-y-4 border-t border-border pt-8">
      <h2 className="text-lg font-semibold">Reading &amp; privacy</h2>
      <p className="text-sm text-muted">
        Reading continuity is optional and separate from your Library.
      </p>
      <Checkbox
        isSelected={prefs?.readingProgressEnabled ?? true}
        isDisabled={busy}
        onChange={(v) => void toggleProgress(v)}
      >
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Label>Save reading progress across devices</Label>
        </Checkbox.Content>
      </Checkbox>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full"
          isDisabled={busy}
          onPress={() => void clearProgress()}
        >
          Clear reading progress
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-full"
          isDisabled={busy}
          onPress={() => void exportAccount()}
        >
          Export account data
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="rounded-full"
          isDisabled={busy}
          onPress={() => void deleteReader()}
        >
          Delete reader data
        </Button>
      </div>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </section>
  );
}
