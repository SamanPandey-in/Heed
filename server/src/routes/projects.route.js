import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
} from "../controllers/projects.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", createProject);
router.patch('/:projectId', updateProject);
router.post('/:projectId/members', addProjectMember);
router.delete('/:projectId/members/:userId', removeProjectMember);
router.delete("/:projectId", deleteProject);

export default router;
