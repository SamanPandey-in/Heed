// ============================================================================
// ROUTES - Dashboard Routes
// ============================================================================

import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/stats', asyncHandler(dashboardController.getDashboard));
router.get('/activity', asyncHandler(dashboardController.getRecentActivity));

export default router;