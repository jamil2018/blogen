import AuthorListView from "../../../components/pages/AuthorListView";
import { fetchAllUsers } from "../../../lib/api";

export default async function AuthorsPage() {
  const authors = await fetchAllUsers();
  return <AuthorListView authors={authors} />;
}
