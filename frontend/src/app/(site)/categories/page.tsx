import CategoryListScreen from "../../../screens/general/CategoryListScreen";
import { fetchAllCategories } from "../../../lib/api";

export default async function CategoriesPage() {
  const categories = await fetchAllCategories();

  return <CategoryListScreen categories={categories} />;
}
