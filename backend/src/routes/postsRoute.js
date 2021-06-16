import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { uploads } from "../middlewares/fileStorageMiddleware.js";
import {
  createNewPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostComments,
  createPostComment,
  updatePostComment,
  deleteComment,
  findPosts,
  getPostsByAuthorId,
} from "../controllers/postsController.js";

const router = Router();

router
  .route("/")
  .get(getAllPosts)
  .post(protect, uploads.single("image"), createNewPost);
router.route("/find").get(findPosts);
router.route("/author/:id").get(getPostsByAuthorId);
router
  .route("/:id")
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);
router
  .route("/:id/comments")
  .get(getPostComments)
  .post(protect, createPostComment);
router
  .route("/:pid/comments/:cid")
  .put(protect, updatePostComment)
  .delete(protect, deleteComment);

export default router;
