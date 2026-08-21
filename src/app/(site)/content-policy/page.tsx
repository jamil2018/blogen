import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = { title: "Content Policy | Blogen" };

export default function ContentPolicyPage() {
  return (
    <PolicyPage
      title="Content Policy"
      updated="August 21, 2026"
      sections={[
        {
          heading: "Allowed",
          body: "Original writing, commentary, tutorials, and discussion that respects readers and other creators.",
        },
        {
          heading: "Not allowed",
          body: "Harassment, illegal content, malware, spam, impersonation, and plagiarism. We remove violating content and may restrict accounts.",
        },
        {
          heading: "Reporting",
          body: "Use the report control on posts or contact moderation. Reports are reviewed by administrators with an audit trail.",
        },
      ]}
    />
  );
}
