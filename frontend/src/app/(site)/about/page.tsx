import AboutUsScreen from "../../../screens/general/AboutUsScreen";
import { fetchLatestUsers } from "../../../lib/api";

export default async function AboutPage() {
  const users = await fetchLatestUsers();

  return <AboutUsScreen users={users} />;
}
