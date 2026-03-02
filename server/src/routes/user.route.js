// ============================================================================
// ROUTES - User Routes
// ============================================================================

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

router.use(authenticate);

/**
 * @route   GET /api/users/search
 * @desc    Search users by email for invites
 * @access  Private
 */
router.get('/search', asyncHandler(async (req, res) => {
    const { email, workspaceId } = req.query;

    if (!email || email.length < 3) {
        return successResponse(res, 'Search term too short', []);
    }

    const users = await prisma.user.findMany({
        where: {
            email: {
                contains: email,
                mode: 'insensitive'
            },
            isActive: true,
            // Optionally exclude current workspace members if workspaceId is provided
            ...(workspaceId && {
                workspaceMemberships: {
                    none: {
                        workspaceId: workspaceId
                    }
                }
            })
        },
        select: {
            id: true,
            email: true,
            name: true,
            imageUrl: true
        },
        take: 10
    });

    return successResponse(res, 'Users found', users);
}));

export default router;
