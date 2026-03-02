// ============================================================================
// SERVICES - Message Service
// ============================================================================

import { prisma } from '../config/database.js';

export const createMessage = async (data, authorId) => {
  // Verify user is a member of the project
  const membership = await prisma.projectMember.findFirst({
    where: { projectId: data.projectId, userId: authorId }
  });
  if (!membership) throw new Error('Access denied');

  const message = await prisma.message.create({
    data: {
      projectId: data.projectId,
      authorId,
      content: data.content,
      parentId: data.parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
    },
  });
  return message;
};

export const getProjectMessages = async (projectId, userId, { page = 1, limit = 50 } = {}) => {
  const membership = await prisma.projectMember.findFirst({ where: { projectId, userId } });
  if (!membership) throw new Error('Access denied');

  const messages = await prisma.message.findMany({
    where: { projectId, parentId: null },
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
      replies: {
        include: { author: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  });

  return messages.reverse();
};

export const updateMessage = async (messageId, userId, content) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error('Message not found');
  if (message.authorId !== userId) throw new Error('Not authorized');

  return prisma.message.update({
    where: { id: messageId },
    data: { content, isEdited: true },
    include: { author: { select: { id: true, name: true, imageUrl: true } } },
  });
};

export const deleteMessage = async (messageId, userId) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error('Message not found');
  if (message.authorId !== userId) throw new Error('Not authorized');

  await prisma.message.delete({ where: { id: messageId } });
};

// ============================================================================
// TASK COMMENTS
// ============================================================================

export const createTaskComment = async (data, authorId) => {
  // Verify task exists and user has access
  const task = await prisma.task.findUnique({ where: { id: data.taskId } });
  if (!task) throw new Error('Task not found');

  const membership = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId: authorId } });
  if (!membership) throw new Error('Access denied');

  const message = await prisma.message.create({
    data: {
      projectId: task.projectId,
      taskId: data.taskId,
      authorId,
      content: data.content,
      parentId: data.parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
    },
  });
  return message;
};

export const getTaskComments = async (taskId, userId) => {
  // Verify task exists and user has access
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const membership = await prisma.projectMember.findFirst({ where: { projectId: task.projectId, userId } });
  if (!membership) throw new Error('Access denied');

  const messages = await prisma.message.findMany({
    where: { taskId, parentId: null },
    include: {
      author: { select: { id: true, name: true, imageUrl: true } },
      replies: {
        include: { author: { select: { id: true, name: true, imageUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
};

export default { createMessage, getProjectMessages, updateMessage, deleteMessage, createTaskComment, getTaskComments };
