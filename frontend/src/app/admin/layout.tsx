import AdminLayout from "../../layout/AdminLayout";

export default function AdminSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
