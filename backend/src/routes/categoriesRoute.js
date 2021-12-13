import { Router } from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
  deleteMultipleCategoryById,
  getCategoryById,
  getCategoryCount,
  getCuratedCategoryCount,
} from "../controllers/categoriesController.js";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(protect, getAllCategories)
  .post(protect, checkAdmin, createNewCategory)
  .delete(protect, checkAdmin, deleteMultipleCategoryById);

router.route("/count").get(protect, checkAdmin, getCategoryCount);
router.route("/curated").get(protect, checkAdmin, getCuratedCategoryCount);

router
  .route("/:id")
  .get(protect, getCategoryById)
  .put(protect, checkAdmin, updateCategory)
  .delete(protect, checkAdmin, deleteCategory);

export default router;
