// Teams routes

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  joinByInviteCode,
  deleteTeam,
} from "../controllers/teams.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get("/", getTeams);
router.get("/:teamId", getTeamById);
router.post("/", createTeam);
router.patch('/:teamId', updateTeam);
router.post('/join', joinByInviteCode);
router.post('/:teamId/members', addTeamMember);
router.delete('/:teamId/members/:userId', removeTeamMember);
router.delete("/:teamId", deleteTeam);

export default router;
