"use client";

import { useEffect } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import * as yup from "yup";
import { Camera } from "@phosphor-icons/react";
import {
  Alert,
  Avatar,
  Button,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import { getUserById, updateUser } from "../../data/userQueryFunctions";
import { SINGLE_AUTHOR_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { getAuthorNameInitials, sanitizeSocialURL } from "../../utils/dataFormat";

const schema = yup.object({
  name: yup.string().required("Required"),
  bio: yup.string(),
});

type ProfileViewProps = {
  admin?: boolean;
};

export default function ProfileView({ admin = false }: ProfileViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isRehydrated } = useSelector(
    (state: {
      userData: {
        user: { _id?: string; isAdmin?: boolean };
        isRehydrated: boolean;
      };
    }) => state.userData
  );

  const { data, isLoading } = useQuery({
    queryKey: [SINGLE_AUTHOR_DATA, user._id],
    queryFn: () => getUserById(user._id!),
    enabled: Boolean(user._id),
  });

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SINGLE_AUTHOR_DATA] });
    },
  });

  useEffect(() => {
    if (!isRehydrated) return;
    if (admin && !user.isAdmin) router.push("/");
    if (!admin && (user.isAdmin || !user._id)) router.push("/");
  }, [admin, isRehydrated, router, user]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: data?.name ?? "",
      bio: data?.bio ?? "",
      facebookId: data?.facebookId ?? "",
      linkedinId: data?.linkedinId ?? "",
      twitterId: data?.twitterId ?? "",
      image: null as File | null,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      mutation.mutate({
        name: values.name,
        bio: values.bio,
        facebookId: sanitizeSocialURL(values.facebookId),
        linkedinId: sanitizeSocialURL(values.linkedinId),
        twitterId: sanitizeSocialURL(values.twitterId),
        image: values.image,
      });
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
      <h1 className="text-2xl font-semibold">Profile</h1>

      {mutation.isSuccess ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Profile updated</Alert.Description>
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
        Save profile
      </Button>
    </form>
  );
}
