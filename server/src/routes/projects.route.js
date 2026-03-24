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
  getProjectActivity,
  getProjectNoteMessages,
  createProjectNoteMessage,
} from "../controllers/projects.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.get("/:projectId/activity", getProjectActivity);
router.get("/:projectId/notes/messages", getProjectNoteMessages);
router.post("/", createProject);
router.patch('/:projectId', updateProject);
router.post('/:projectId/notes/messages', createProjectNoteMessage);
router.post('/:projectId/members', addProjectMember);
router.delete('/:projectId/members/:userId', removeProjectMember);
router.delete("/:projectId", deleteProject);

export default router;
