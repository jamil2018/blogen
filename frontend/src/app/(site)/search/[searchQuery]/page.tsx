import SearchResultScreen from "../../../../screens/general/SearchResultScreen";
import { fetchSearchPostResults } from "../../../../lib/api";

type SearchPageProps = {
  params: Promise<{ searchQuery: string }>;
};

export default async function SearchPage({ params }: SearchPageProps) {
  const { searchQuery } = await params;
  const results = await fetchSearchPostResults(searchQuery);

  return (
    <SearchResultScreen searchQuery={searchQuery} results={results} />
  );
}
