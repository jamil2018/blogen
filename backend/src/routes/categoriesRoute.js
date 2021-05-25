import { Router } from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoriesController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router
  .route("/")
  .get(protect, getAllCategories)
  .post(protect, createNewCategory);

router
  .route("/:id")
  .put(protect, updateCategory)
  .delete(protect, deleteCategory);

export default router;
