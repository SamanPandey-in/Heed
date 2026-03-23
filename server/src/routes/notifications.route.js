import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/", clearAll);

export default router;
