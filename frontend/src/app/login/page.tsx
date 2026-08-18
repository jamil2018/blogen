import LoginForm from "../../components/auth/LoginForm";

export const metadata = {
  title: "Sign in | Blogen",
};

export default function LoginPage() {
  return (
    <div className="py-12">
      <LoginForm />
    </div>
  );
}
