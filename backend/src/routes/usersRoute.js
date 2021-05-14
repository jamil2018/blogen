import { Router } from "express";

const router = Router();

router.route("/").get().post();
router.route("/:id").get().put().delete();

export default router;
