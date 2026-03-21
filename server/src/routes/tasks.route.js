import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getTasks,
  getTaskById,
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/tasks.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.get("/project/:projectId", getProjectTasks);
router.get("/:taskId", getTaskById);
router.post("/", createTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
