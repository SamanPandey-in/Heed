// Tasks routes

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getTasks,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getTasks);
router.get("/project/:projectId", getProjectTasks);
router.post("/", createTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
