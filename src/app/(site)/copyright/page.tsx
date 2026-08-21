import type { Metadata } from "next";
import PolicyPage from "../../../components/pages/PolicyPage";

export const metadata: Metadata = { title: "Copyright | Blogen" };

export default function CopyrightPage() {
  return (
    <PolicyPage
      title="Copyright & Takedown"
      updated="August 21, 2026"
      sections={[
        {
          heading: "Respect copyright",
          body: "Only publish content you own or are licensed to share. Crediting a source does not replace permission.",
        },
        {
          heading: "Notices",
          body: "Copyright owners may submit a takedown request with identification of the work, the allegedly infringing URL, and contact details.",
        },
        {
          heading: "Counter-notice",
          body: "If your content was removed in error, you may submit a counter-notice. We document moderation decisions in an admin audit log.",
        },
      ]}
    />
  );
}
