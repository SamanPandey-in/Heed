// ============================================================================
// ROUTES - Notification Routes
// ============================================================================

import { Router } from 'express';
import notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(notificationController.getNotifications));
router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));
router.patch('/:notificationId/read', asyncHandler(notificationController.markAsRead));
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));

export default router;