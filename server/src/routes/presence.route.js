import { Router } from 'express';
import { getProjectPresence } from '../controllers/presence.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// GET /api/presence/:projectId - SSE endpoint for real-time presence
router.get('/:projectId', authenticate, getProjectPresence);

export default router;
