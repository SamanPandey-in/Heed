import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comments.controller.js";

const router = Router();

router.use(authenticate);

router.get("/:taskId/comments", getComments);
router.post("/:taskId/comments", createComment);
router.delete("/comments/:commentId", deleteComment);

export default router;
