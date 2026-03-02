// ============================================================================
// CONTROLLERS - Message Controller
// ============================================================================

import * as messageService from '../services/message.service.js';
import { successResponse, createdResponse, deletedResponse, badRequestResponse } from '../utils/apiResponse.js';
import { validate } from '../utils/validation.js';
import { createMessageSchema, updateMessageSchema } from '../utils/validation.js';
import { getIO } from '../lib/socket.js';

export const createMessage = async (req, res) => {
  const validation = validate(createMessageSchema)(req.body);
  if (!validation.valid) return badRequestResponse(res, 'Validation failed', validation.errors);
  const message = await messageService.createMessage(validation.data, req.user.id);

  // Emit real-time event
  getIO().to(`project:${validation.data.projectId}`).emit('message:new', message);

  return createdResponse(res, 'Message created', message);
};

export const getMessages = async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const messages = await messageService.getProjectMessages(projectId, req.user.id, { page, limit });
  return successResponse(res, 'Messages retrieved', messages);
};

export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const validation = validate(updateMessageSchema)(req.body);
  if (!validation.valid) return badRequestResponse(res, 'Validation failed', validation.errors);
  const message = await messageService.updateMessage(messageId, req.user.id, validation.data.content);
  return successResponse(res, 'Message updated', message);
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  await messageService.deleteMessage(messageId, req.user.id);
  return deletedResponse(res, 'Message deleted');
};

// ============================================================================
// TASK COMMENTS
// ============================================================================

export const createTaskComment = async (req, res) => {
  const { taskId } = req.params;
  const { content, parentId } = req.body;
  if (!content) return badRequestResponse(res, 'Content is required');

  const message = await messageService.createTaskComment({ taskId, content, parentId }, req.user.id);

  // Emit real-time event
  getIO().to(`project:${message.projectId}`).emit('comment:new', message);

  return createdResponse(res, 'Comment added', message);
};

export const getTaskComments = async (req, res) => {
  const { taskId } = req.params;
  const messages = await messageService.getTaskComments(taskId, req.user.id);
  return successResponse(res, 'Comments retrieved', messages);
};

export default { createMessage, getMessages, updateMessage, deleteMessage, createTaskComment, getTaskComments };
