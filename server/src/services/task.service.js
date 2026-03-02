// ============================================================================
// SERVICES - Task Service
// ============================================================================

import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';
import { createNotification } from './notification.service.js';

export const createTask = async (data, reporterId) => {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId: data.projectId, userId: reporterId }
  });
  if (!membership) throw new Error('Access denied');

  const project = await prisma.project.findUnique({ where: { id: data.projectId } });
  if (!project) throw new Error('Project not found');

  const task = await prisma.task.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status || 'TODO',
      type: data.type || 'TASK',
      priority: data.priority || 'MEDIUM',
      assigneeId: data.assigneeId,
      reporterId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true, imageUrl: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  if (data.assigneeId && data.assigneeId !== reporterId) {
    await createNotification(data.assigneeId, 'TASK_ASSIGNED', 'Task Assigned', `You have been assigned to "${task.title}"`, { taskId: task.id, projectId: data.projectId });
  }

  return task;
};

export const getProjectTasks = async (projectId, userId, filters = {}) => {
  const membership = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  if (!membership) throw new Error('Access denied');

  const where = { projectId };
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.assigneeId) where.assigneeId = filters.assigneeId;

  return prisma.task.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, imageUrl: true } },
      reporter: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getTaskById = async (taskId, userId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: { select: { id: true, name: true, workspaceId: true, startDate: true, status: true, priority: true, progress: true } },
      assignee: { select: { id: true, name: true, imageUrl: true } },
      reporter: { select: { id: true, name: true, imageUrl: true } },
    },
  });
  if (!task) throw new Error('Task not found');

  const membership = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId } });
  if (!membership) throw new Error('Access denied');

  // Return task with projectId at top level for convenience
  return {
    ...task,
    projectId: task.project.id,
  };
};

export const updateTask = async (taskId, userId, data) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const membership = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId } });
  if (!membership) throw new Error('Access denied');

  const oldAssigneeId = task.assigneeId;
  const oldStatus = task.status;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status, completedAt: data.status === 'DONE' ? new Date() : null }),
      ...(data.type && { type: data.type }),
      ...(data.priority && { priority: data.priority }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
    include: {
      assignee: { select: { id: true, name: true, imageUrl: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  if (data.assigneeId && data.assigneeId !== oldAssigneeId && data.assigneeId !== userId) {
    await createNotification(data.assigneeId, 'TASK_ASSIGNED', 'Task Assigned', `You have been assigned to "${updated.title}"`, { taskId: updated.id, projectId: task.projectId });
  }

  if (data.status && data.status !== oldStatus && data.status === 'DONE' && task.assigneeId) {
    await createNotification(task.reporterId, 'TASK_COMPLETED', 'Task Completed', `"${updated.title}" has been marked as done`, { taskId: updated.id, projectId: task.projectId });
  }

  return updated;
};

export const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const membership = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId, role: 'LEAD' } });
  if (!membership) throw new Error('Only project lead can delete tasks');

  await prisma.task.delete({ where: { id: taskId } });
  logger.info(`Task deleted: ${taskId}`);
};

export const getMyTasks = async (userId) => {
  return prisma.task.findMany({
    where: { assigneeId: userId },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, imageUrl: true } },
      reporter: { select: { id: true, name: true, imageUrl: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });
};

export default { createTask, getProjectTasks, getTaskById, updateTask, deleteTask, getMyTasks };