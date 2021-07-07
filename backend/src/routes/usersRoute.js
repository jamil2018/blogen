import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getAllUsers,
} from "../controllers/usersController.js";

const router = Router();

router.route("/").post(registerUser).get(getAllUsers);
router.route("/login").post(authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
