"use client";

import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import Link from "next/link";
import { Alert, Button } from "@heroui/react";
import FormField from "./FormField";
import OAuthButtons from "./OAuthButtons";
import { signInUser } from "../../data/userQueryFunctions";
import { useState } from "react";

const schema = yup.object({
  email: yup
    .string()
    .required("This field is required")
    .email("Please enter a valid email address"),
  password: yup.string().required("This field is required"),
});

type LoginFormProps = {
  onSuccess?: () => void;
  showRegisterLink?: boolean;
  next?: string;
  error?: string;
};

export default function LoginForm({
  onSuccess,
  showRegisterLink = true,
  next = "/user/dashboard",
  error,
}: LoginFormProps) {
  const [showError, setShowError] = useState(Boolean(error));
  const [errorDetail, setErrorDetail] = useState(
    error ?? "Incorrect email or password"
  );
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {
      router.refresh();
      router.push(data.isAdmin ? "/admin" : next);
      onSuccess?.();
    },
    onError: (error: Error) => {
      setShowError(true);
      setErrorDetail(error.message);
    },
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate(values),
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold tracking-tight text-ink">Sign in</h2>
        <p className="mt-1.5 text-sm text-muted">
          Use your email or Google account.
        </p>
      </header>

      {showError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{errorDetail}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
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
          {mutation.isPending ? "Signing in…" : "Sign in"}
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

      <OAuthButtons next={next} />

      {showRegisterLink ? (
        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-teal-700 underline-offset-4 hover:underline dark:text-teal-400"
          >
            Sign up
          </Link>
        </p>
      ) : null}
    </div>
  );
}
