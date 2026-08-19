import type { Metadata } from "next";
import AuthPageShell from "../../../components/auth/AuthPageShell";
import LoginForm from "../../../components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Blogen",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next =
    params.next?.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/user/dashboard";

  return (
    <AuthPageShell>
      <LoginForm next={next} error={params.error} />
    </AuthPageShell>
  );
}
