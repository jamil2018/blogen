"use client";

import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import Link from "next/link";
import { Camera } from "@phosphor-icons/react";
import {
  Alert,
  Button,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import FormField from "./FormField";
import { createUser } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
import { storeUserData } from "../../redux/slices/userDataSlice";
import { sanitizeSocialURL } from "../../utils/dataFormat";
import { useState } from "react";

const schema = yup.object({
  name: yup.string().required("This field is required"),
  email: yup
    .string()
    .required("This field is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("This field is required")
    .min(6, "Password must be at least 6 characters"),
});

type RegisterFormProps = {
  onSuccess?: () => void;
  showLoginLink?: boolean;
};

export default function RegisterForm({
  onSuccess,
  showLoginLink = true,
}: RegisterFormProps) {
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USER_DATA] });
      dispatch(storeUserData(data));
      router.push("/user/dashboard");
      onSuccess?.();
    },
    onError: () => setShowError(true),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      facebookId: "",
      linkedinId: "",
      twitterId: "",
      image: null as File | null,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      mutation.mutate({
        ...values,
        facebookId: values.facebookId
          ? sanitizeSocialURL(values.facebookId)
          : "",
        linkedinId: values.linkedinId
          ? sanitizeSocialURL(values.linkedinId)
          : "",
        twitterId: values.twitterId
          ? sanitizeSocialURL(values.twitterId)
          : "",
        isAdmin: false,
      });
    },
  });

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-muted">Join the Blogen community</p>
      </div>

      {showError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Registration failed. Please try again.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          name="name"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.name && formik.errors.name
              ? String(formik.errors.name)
              : undefined
          }
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.email && formik.errors.email
              ? String(formik.errors.email)
              : undefined
          }
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={
            formik.touched.password && formik.errors.password
              ? String(formik.errors.password)
              : undefined
          }
        />

        <TextField name="bio">
          <Label>Bio</Label>
          <TextArea
            id="bio"
            name="bio"
            rows={3}
            value={formik.values.bio}
            onChange={formik.handleChange}
          />
        </TextField>

        <FormField
          label="Facebook handle"
          name="facebookId"
          value={formik.values.facebookId}
          onChange={formik.handleChange}
        />
        <FormField
          label="LinkedIn handle"
          name="linkedinId"
          value={formik.values.linkedinId}
          onChange={formik.handleChange}
        />
        <FormField
          label="Twitter handle"
          name="twitterId"
          value={formik.values.twitterId}
          onChange={formik.handleChange}
        />

        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Camera className="size-4" />
            Profile photo
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) =>
                formik.setFieldValue("image", e.target.files?.[0] ?? null)
              }
            />
          </label>
          {formik.values.image ? (
            <p className="mt-1 text-xs text-muted">{formik.values.image.name}</p>
          ) : null}
        </div>

        <Button type="submit" fullWidth isDisabled={mutation.isPending}>
          Register
        </Button>
      </form>

      {showLoginLink ? (
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-700 dark:text-teal-400">
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
