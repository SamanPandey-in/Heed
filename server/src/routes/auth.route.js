// ============================================================================
// ROUTES - Authentication Routes
// ============================================================================

import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateBody } from '../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), asyncHandler(authController.register));
router.post('/login', validateBody(loginSchema), asyncHandler(authController.login));
router.post('/refresh-token', validateBody(refreshTokenSchema), asyncHandler(authController.refreshToken));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

// Protected routes
router.use(authenticate);
router.post('/logout', asyncHandler(authController.logout));
router.get('/profile', asyncHandler(authController.getProfile));
router.put('/profile', asyncHandler(authController.updateProfile));

export default router;
