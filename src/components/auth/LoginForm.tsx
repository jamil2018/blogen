"use client";

import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import Link from "next/link";
import { Alert, Button } from "@heroui/react";
import FormField from "./FormField";
import { signInUser } from "../../data/userQueryFunctions";
import { storeUserData } from "../../redux/slices/userDataSlice";
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
};

export default function LoginForm({
  onSuccess,
  showRegisterLink = true,
}: LoginFormProps) {
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: (data) => {
      dispatch(storeUserData(data));
      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/user/dashboard");
      }
      onSuccess?.();
    },
    onError: (error: Error & { status?: number }) => {
      if (error.status === 401) setShowError(true);
    },
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate(values),
  });

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back to Blogen</p>
      </div>

      {showError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Incorrect email or password</Alert.Description>
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
        <Button type="submit" fullWidth isDisabled={mutation.isPending}>
          Submit
        </Button>
      </form>

      {showRegisterLink ? (
        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-teal-700 dark:text-teal-400">
            Sign up
          </Link>
        </p>
      ) : null}
    </div>
  );
}
