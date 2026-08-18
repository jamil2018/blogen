import UserLayout from "../../layout/UserLayout";

export default function UserSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}
