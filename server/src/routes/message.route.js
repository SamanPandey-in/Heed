// ============================================================================
// ROUTES - Message Routes
// ============================================================================

import { Router } from 'express';
import messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(messageController.createMessage));
router.get('/project/:projectId', asyncHandler(messageController.getMessages));
router.put('/:messageId', asyncHandler(messageController.updateMessage));
router.delete('/:messageId', asyncHandler(messageController.deleteMessage));

// Task comments routes
router.post('/task/:taskId', asyncHandler(messageController.createTaskComment));
router.get('/task/:taskId', asyncHandler(messageController.getTaskComments));

export default router;