import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = { title: "Terms | Blogen" };

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      updated="August 21, 2026"
      sections={[
        {
          heading: "Using Blogen",
          body: "You must be eligible to form a contract and follow applicable law. Do not attempt unauthorized access, scrape at abusive rates, or disrupt the service.",
        },
        {
          heading: "Your content",
          body: "You retain ownership of content you create. By publishing, you grant Blogen a non-exclusive license to host, display, and distribute that content on the platform.",
        },
        {
          heading: "Termination",
          body: "We may suspend accounts that violate these terms or our Content Policy. You may stop using Blogen at any time.",
        },
      ]}
    />
  );
}
