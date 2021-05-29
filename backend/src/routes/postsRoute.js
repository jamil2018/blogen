import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createNewPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postsController.js";

const router = Router();

router.route("/").get(getAllPosts).post(protect, createNewPost);
router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);
router.route("/authors/:author").get();
router.route("/find").get();

export default router;
