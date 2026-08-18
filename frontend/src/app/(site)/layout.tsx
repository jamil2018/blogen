import GeneralLayout from "../../layout/GeneralLayout";

export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GeneralLayout>{children}</GeneralLayout>;
}
