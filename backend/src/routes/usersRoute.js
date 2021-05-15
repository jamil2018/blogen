import { Router } from "express";
import { registerUser } from "../controllers/userControllers.js";

const router = Router();

router.route("/").get().post(registerUser);
router.route("/:id").get().put();

export default router;
