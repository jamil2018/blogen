import { Router } from "express";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getAllUsers,
  getUserById,
} from "../controllers/usersController.js";

const router = Router();

router.route("/").post(registerUser).get(getAllUsers);
router.route("/:id").get(getUserById);
// .put(protect, checkAdmin);
router.route("/login").post(authUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
