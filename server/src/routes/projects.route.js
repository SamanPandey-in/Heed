// Projects routes

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
} from "../controllers/projects.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", createProject);
router.delete("/:projectId", deleteProject);

export default router;
