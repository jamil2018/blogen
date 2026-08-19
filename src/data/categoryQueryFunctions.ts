import {
  createCategory as createCategoryAction,
  deleteCategoriesByIds,
  getAllCategories as getAllCategoriesAction,
  getCategoryById as getCategoryByIdAction,
  getCuratedCategories,
  updateCategory,
} from "../actions/categories";

export const getAllCategories = getAllCategoriesAction;
export const getCategoryById = getCategoryByIdAction;
export const getCuratedCategoryList = getCuratedCategories;
export const createCategory = createCategoryAction;

export function updateCategoryById({
  categoryId,
  values,
}: {
  categoryId: string;
  values: { title: string };
}) {
  return updateCategory(categoryId, values);
}

export function deleteMultipleCategoriesById(categoryId: string[]) {
  return deleteCategoriesByIds(categoryId);
}
