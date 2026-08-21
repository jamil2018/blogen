import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = { title: "Privacy | Blogen" };

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="August 21, 2026"
      sections={[
        {
          heading: "What we collect",
          body: "Account profile data, authentication identifiers, content you publish, Library saves, reports you submit, and basic usage logs needed to operate Blogen.",
        },
        {
          heading: "How we use data",
          body: "We use data to provide publishing and reading features, secure accounts, moderate abuse, and improve reliability. We do not sell personal data.",
        },
        {
          heading: "Your choices",
          body: "You can update profile fields, unsave Library items, and request account deletion through support. Public posts remain visible until unpublished or deleted by you or moderation.",
        },
      ]}
    />
  );
}
