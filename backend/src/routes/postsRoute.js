import { Router } from "express";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/").get().post();
router.route("/:id").get().put().delete();
router.route("/category/:category").get();
router.route("/authors/:author").get();
router.route("/tags").get();

export default router;
