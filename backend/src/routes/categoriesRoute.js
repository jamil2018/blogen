import { Router } from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
  deleteMultipleCategoryById,
} from "../controllers/categoriesController.js";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(protect, checkAdmin, getAllCategories)
  .post(protect, checkAdmin, createNewCategory)
  .delete(protect, checkAdmin, deleteMultipleCategoryById);

router
  .route("/:id")
  .put(protect, checkAdmin, updateCategory)
  .delete(protect, checkAdmin, deleteCategory);

export default router;
