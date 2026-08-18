import RegisterForm from "../../components/auth/RegisterForm";

export const metadata = {
  title: "Register | Blogen",
};

export default function RegisterPage() {
  return (
    <div className="py-12">
      <RegisterForm />
    </div>
  );
}
