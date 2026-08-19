"use client";

import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import Link from "next/link";
import { Alert, Button } from "@heroui/react";
import FormField from "./FormField";
import OAuthButtons from "./OAuthButtons";
import { createUser } from "../../data/userQueryFunctions";
import { USER_DATA } from "../../definitions/reactQueryConstants/queryConstants";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [USER_DATA] });
      if (result.status === "confirm_email") {
        setErrorMessage(null);
        setConfirmEmail(result.email);
        return;
      }
      router.refresh();
      router.push("/user/dashboard");
      onSuccess?.();
    },
    onError: (error: Error) => {
      setConfirmEmail(null);
      setErrorMessage(error.message || "Registration failed. Please try again.");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Create account
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Use your email or Google account.
        </p>
      </header>

      {confirmEmail ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Account created. Check {confirmEmail} to confirm your email, then{" "}
              <Link
                href="/login"
                className="font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
              >
                sign in
              </Link>
              .
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
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

        <Button
          type="submit"
          fullWidth
          isDisabled={mutation.isPending}
          className="transition-transform active:scale-[0.98]"
        >
          {mutation.isPending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-paper px-3 text-xs font-medium text-muted">or</span>
        </div>
      </div>

      <OAuthButtons />

      {showLoginLink ? (
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
          >
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
