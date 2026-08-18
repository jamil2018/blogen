import AboutPageView from "../../../components/pages/AboutPageView";
import { fetchLatestUsers } from "../../../lib/api";

export default async function AboutPage() {
  const users = await fetchLatestUsers();
  return <AboutPageView users={users} />;
}
