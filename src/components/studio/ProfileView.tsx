"use client";

import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as yup from "yup";
import { Camera } from "@phosphor-icons/react";
import {
  Alert,
  Avatar,
  Button,
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
import {
  SINGLE_AUTHOR_DATA,
  USER_DATA,
} from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials, sanitizeSocialURL } from "../../utils/dataFormat";
import { useCurrentUser } from "../auth/AuthProvider";

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

export default function ProfileView({ admin = false, userId }: ProfileViewProps) {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const targetId = userId ?? currentUser?.id;
  const isAdminUserEdit = Boolean(admin && userId);

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
        image: values.image,
      };
      if (isAdminUserEdit) {
        payload.email = values.email;
        payload.isAdmin = values.isAdmin;
      }
      mutation.mutate(payload);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  const initials = getAuthorNameInitials(formik.values.name).filter(Boolean).join("");

  return (
    <form onSubmit={formik.handleSubmit} className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">
        {isAdminUserEdit ? "Edit user" : "Profile"}
      </h1>

      {mutation.isSuccess ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              {isAdminUserEdit ? "User updated" : "Profile updated"}
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <div className="flex items-center gap-4">
        <Avatar size="lg">
          {data?.imageURL ? (
            <Avatar.Image src={data.imageURL} alt={data.name} />
          ) : (
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          )}
        </Avatar>
        <label className="cursor-pointer text-sm text-teal-700 dark:text-teal-400">
          <Camera className="mr-1 inline size-4" />
          Change photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) =>
              formik.setFieldValue("image", e.target.files?.[0] ?? null)
            }
          />
        </label>
      </div>

      <TextField name="name">
        <Label>Name</Label>
        <Input name="name" value={formik.values.name} onChange={formik.handleChange} />
      </TextField>

      {isAdminUserEdit ? (
        <>
          <TextField name="email">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
            />
          </TextField>
          <Checkbox
            isSelected={formik.values.isAdmin}
            onChange={(isSelected) => formik.setFieldValue("isAdmin", isSelected)}
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
        />
      </TextField>

      <TextField name="facebookId">
        <Label>Facebook</Label>
        <Input
          name="facebookId"
          value={formik.values.facebookId}
          onChange={formik.handleChange}
        />
      </TextField>

      <TextField name="linkedinId">
        <Label>LinkedIn</Label>
        <Input
          name="linkedinId"
          value={formik.values.linkedinId}
          onChange={formik.handleChange}
        />
      </TextField>

      <TextField name="twitterId">
        <Label>Twitter</Label>
        <Input
          name="twitterId"
          value={formik.values.twitterId}
          onChange={formik.handleChange}
        />
      </TextField>

      <Button type="submit" isDisabled={mutation.isPending}>
        {isAdminUserEdit ? "Save user" : "Save profile"}
      </Button>
    </form>
  );
}
