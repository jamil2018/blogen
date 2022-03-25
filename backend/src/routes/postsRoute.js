import { Router } from "express";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
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
  deleteMultiplePostsById,
  getCuratedPostsCount,
  getCuratedPostsCountByAuthorId,
  getPostCommentById,
  getLatestPosts,
  getPaginatedPosts,
  searchPosts,
} from "../controllers/postsController.js";

const router = Router();

router
  .route("/")
  .get(getAllPosts)
  .post(protect, uploads.single("image"), createNewPost)
  .delete(protect, deleteMultiplePostsById);

router.route("/paginated").get(getPaginatedPosts);

router.route("/latest").get(getLatestPosts);

router.route("/find").get(findPosts);

router.route("/search").get(searchPosts);

router.route("/curated").get(getCuratedPostsCount);

router.route("/curated/:author").get(protect, getCuratedPostsCountByAuthorId);

router.route("/author/:aid").get(getPostsByAuthorId);

router
  .route("/:id")
  .get(getPostById)
  .put(protect, uploads.single("image"), updatePost)
  .delete(protect, deletePost);

router
  .route("/:id/comments")
  .get(getPostComments)
  .post(protect, createPostComment);

router
  .route("/:pid/comments/:cid")
  .get(getPostCommentById)
  .put(protect, updatePostComment)
  .delete(protect, deleteComment);

export default router;
