import SearchResultsView from "../../../../components/pages/SearchResultsView";
import { fetchSearchPostResults } from "../../../../lib/api";

type SearchPageProps = {
  params: Promise<{ searchQuery: string }>;
};

export default async function SearchPage({ params }: SearchPageProps) {
  const { searchQuery } = await params;
  const results = await fetchSearchPostResults(searchQuery);
  return (
    <SearchResultsView searchQuery={searchQuery} results={results} />
  );
}
