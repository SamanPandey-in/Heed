// ============================================================================
// SERVICES - Workspace Service
// ============================================================================

import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

/**
 * Generate unique slug from workspace name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
};

/**
 * Create workspace
 */
export const createWorkspace = async (data, ownerId) => {
  const slug = await generateUniqueSlug(data.name);

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, imageUrl: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, imageUrl: true },
            },
          },
        },
      },
    });

    logger.info(`Workspace created: ${workspace.name}`);

    return workspace;
  } catch (err) {
    // Handle unique constraint violation (race condition)
    if (err.code === 'P2002') {
      logger.warn(`Slug collision detected, retrying with new slug`);
      return createWorkspace(data, ownerId);
    }
    throw err;
  }
};

/**
 * Generate unique slug
 */
const generateUniqueSlug = async (name) => {
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${generateSlug(name)}-${suffix}`;
};

/**
 * Get all workspaces for user
 */
export const getUserWorkspaces = async (userId) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
            },
          },
          _count: {
            select: { projects: true, members: true },
          },
        },
      },
    },
  });

  return memberships.map(m => ({
    ...m.workspace,
    role: m.role,
  }));
};

/**
 * Get workspace by ID
 */
export const getWorkspaceById = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
    include: {
      workspace: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, imageUrl: true },
              },
            },
          },
          projects: {
            include: {
              teamLead: {
                select: { id: true, name: true, imageUrl: true },
              },
              _count: {
                select: { tasks: true, members: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      },
    },
  });

  if (!membership) {
    throw new Error('Workspace not found or access denied');
  }

  return {
    ...membership.workspace,
    role: membership.role,
  };
};

/**
 * Update workspace
 */
export const updateWorkspace = async (workspaceId, userId, data) => {
  // Check ownership or admin
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: 'ADMIN' } } },
      ],
    },
  });

  if (!workspace) {
    throw new Error('Not authorized to update this workspace');
  }

  return prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.settings && { settings: data.settings }),
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
  });
};

/**
 * Delete workspace
 */
export const deleteWorkspace = async (workspaceId, userId) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: userId,
    },
  });

  if (!workspace) {
    throw new Error('Only the owner can delete this workspace');
  }

  await prisma.workspace.delete({
    where: { id: workspaceId },
  });

  logger.info(`Workspace deleted: ${workspaceId}`);
};

/**
 * Add member to workspace
 */
export const addWorkspaceMember = async (workspaceId, userId, data) => {
  // Check admin role
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Only admins can add members');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: data.userId,
      },
    },
  });

  if (existingMember) {
    throw new Error('User is already a member');
  }

  return prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: data.userId,
      role: data.role || 'MEMBER',
      message: data.message || '',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true },
      },
    },
  });
};

/**
 * Remove member from workspace
 */
export const removeWorkspaceMember = async (workspaceId, userId, memberId) => {
  // Check admin role
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Only admins can remove members');
  }

  // Can't remove owner
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (workspace.ownerId === memberId) {
    throw new Error('Cannot remove workspace owner');
  }

  await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });

  logger.info(`Member removed from workspace: ${memberId}`);
};

/**
 * Get workspace members
 */
export const getWorkspaceMembers = async (workspaceId, userId) => {
  // Check if user is member
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId,
    },
  });

  if (!membership) {
    throw new Error('Access denied');
  }

  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, name: true, email: true, imageUrl: true, role: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });
};

export default {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  removeWorkspaceMember,
  getWorkspaceMembers,
};