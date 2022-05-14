import { Router } from "express";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getAllUsers,
  getUserById,
  updateUserProfileById,
  deleteUsersById,
  getCuratedUserCount,
  getLatestUsers,
} from "../controllers/usersController.js";
import { uploads } from "../middlewares/fileStorageMiddleware.js";

const router = Router();

router
  .route("/")
  .post(registerUser)
  .get(getAllUsers)
  .delete(protect, checkAdmin, deleteUsersById);

router.route("/latest").get(getLatestUsers);
router.route("/curated").get(getCuratedUserCount);
router.route("/login").post(authUser);
router.route("/:id").get(getUserById);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/profile/:id").put(protect, checkAdmin, updateUserProfileById);

export default router;
