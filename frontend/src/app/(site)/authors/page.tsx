import AuthorListScreen from "../../../screens/general/AuthorListScreen";
import { fetchAllUsers } from "../../../lib/api";

export default async function AuthorsPage() {
  const authors = await fetchAllUsers();

  return <AuthorListScreen authors={authors} />;
}
