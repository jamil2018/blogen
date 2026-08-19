import type { Metadata } from "next";
import AuthPageShell from "../../../components/auth/AuthPageShell";
import RegisterForm from "../../../components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Blogen",
};

export default function RegisterPage() {
  return (
    <AuthPageShell
      headline="Join the community."
      description="Sign up to read stories, leave comments, and publish your own posts."
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
