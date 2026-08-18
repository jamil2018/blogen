import CategoryListView from "../../../components/pages/CategoryListView";
import { fetchAllCategories } from "../../../lib/api";

export default async function CategoriesPage() {
  const categories = await fetchAllCategories();
  return <CategoryListView categories={categories} />;
}
