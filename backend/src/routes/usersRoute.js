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
} from "../controllers/usersController.js";

const router = Router();

router
  .route("/")
  .post(registerUser)
  .get(getAllUsers)
  .delete(protect, checkAdmin, deleteUsersById);
router.route("/:id").get(getUserById);
router.route("/login").post(authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route("/profile/:id").put(protect, checkAdmin, updateUserProfileById);

export default router;
