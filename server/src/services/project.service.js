// ============================================================================
// SERVICES - Project Service
// ============================================================================

import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export const createProject = async (data, userId) => {
  // Verify workspace membership
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: data.workspaceId,
      userId,
    },
  });

  if (!membership) {
    throw new Error('Not a member of this workspace');
  }

  const effectiveLeadId = data.teamLeadId || userId;
  const membersToCreate = [{ userId: effectiveLeadId, role: 'LEAD' }];

  if (effectiveLeadId !== userId) {
    membersToCreate.push({ userId, role: 'MEMBER' });
  }

  // Add additional members from memberIds
  if (data.memberIds && data.memberIds.length > 0) {
    const existingIds = membersToCreate.map(m => m.userId);
    data.memberIds.forEach(id => {
      if (!existingIds.includes(id)) {
        membersToCreate.push({ userId: id, role: 'MEMBER' });
      }
    });
  }

  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      status: data.status || 'PLANNING',
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      workspaceId: data.workspaceId,
      teamLeadId: effectiveLeadId,
      members: {
        create: membersToCreate,
      },
    },
    include: {
      workspace: { select: { id: true, name: true } },
      teamLead: { select: { id: true, name: true, imageUrl: true } },
      members: {
        include: { user: { select: { id: true, name: true, imageUrl: true } } },
      },
    },
  });

  logger.info(`Project created: ${project.name}`);
  return project;
};

export const getWorkspaceProjects = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId },
  });

  if (!membership) {
    throw new Error('Not a member of this workspace');
  }

  return prisma.project.findMany({
    where: { workspaceId },
    include: {
      teamLead: { select: { id: true, name: true, imageUrl: true } },
      members: { include: { user: { select: { id: true, name: true, imageUrl: true } } } },
      _count: { select: { tasks: true, members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getProjectById = async (projectId, userId) => {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId },
  });

  if (!membership) {
    throw new Error('Not a member of this project');
  }

  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: { select: { id: true, name: true, slug: true } },
      teamLead: { select: { id: true, name: true, imageUrl: true } },
      members: { include: { user: { select: { id: true, name: true, imageUrl: true } } } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, imageUrl: true } },
          reporter: { select: { id: true, name: true, imageUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

export const updateProject = async (projectId, userId, data) => {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId, role: { in: ['LEAD', 'MEMBER'] } },
  });

  if (!membership) {
    throw new Error('Not authorized to update this project');
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority && { priority: data.priority }),
      ...(data.status && { status: data.status }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.teamLeadId !== undefined && { teamLeadId: data.teamLeadId }),
    },
    include: {
      teamLead: { select: { id: true, name: true, imageUrl: true } },
    },
  });
};

export const deleteProject = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { teamLeadId: userId },
        { workspace: { ownerId: userId } },
      ],
    },
  });

  if (!project) {
    throw new Error('Not authorized to delete this project');
  }

  await prisma.project.delete({ where: { id: projectId } });
  logger.info(`Project deleted: ${projectId}`);
};

export const addProjectMember = async (projectId, userId, data) => {
  // Check if user is lead only (not regular members)
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId, role: 'LEAD' },
  });

  if (!membership) {
    throw new Error('Only project lead can add members');
  }

  const existingMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: data.userId } },
  });

  if (existingMember) {
    throw new Error('User is already a project member');
  }

  return prisma.projectMember.create({
    data: { projectId, userId: data.userId, role: data.role || 'MEMBER' },
    include: { user: { select: { id: true, name: true, imageUrl: true } } },
  });
};

export const removeProjectMember = async (projectId, userId, memberId) => {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId, role: 'LEAD' },
  });

  if (!membership) {
    throw new Error('Only project lead can remove members');
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberId } },
  });
};

export default {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
};