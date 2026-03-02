// ============================================================================
// VALIDATIONS - Zod Schema Definitions
// ============================================================================

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email format');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters');
const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(255, 'Name must not exceed 255 characters');
const uuidSchema = z.string().uuid('Invalid UUID format');

// ============================================================================
// AUTH VALIDATIONS
// ============================================================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============================================================================
// WORKSPACE VALIDATIONS
// ============================================================================

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  settings: z.record(z.any()).optional(),
});

export const addWorkspaceMemberSchema = z.object({
  userId: uuidSchema,
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
  message: z.string().max(500).optional(),
});

export const updateWorkspaceMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
  message: z.string().max(500).optional(),
});

// ============================================================================
// PROJECT VALIDATIONS
// ============================================================================

export const createProjectSchema = z.object({
  name: nameSchema,
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).default('PLANNING'),
  startDate: z.string().date().optional().nullable(),
  endDate: z.string().date().optional().nullable(),
  workspaceId: uuidSchema,
  teamLeadId: uuidSchema.optional().nullable(),
  memberIds: z.array(uuidSchema).optional(),
});

export const updateProjectSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  startDate: z.string().date().optional().nullable(),
  endDate: z.string().date().optional().nullable(),
  progress: z.number().int().min(0).max(100).optional(),
  teamLeadId: uuidSchema.optional().nullable(),
});

export const addProjectMemberSchema = z.object({
  userId: uuidSchema,
  role: z.enum(['LEAD', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const updateProjectMemberSchema = z.object({
  role: z.enum(['LEAD', 'MEMBER', 'VIEWER']),
});

// ============================================================================
// TASK VALIDATIONS
// ============================================================================

export const createTaskSchema = z.object({
  projectId: uuidSchema,
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  type: z.enum(['TASK', 'FEATURE', 'BUG', 'IMPROVEMENT', 'OTHER']).default('TASK'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: uuidSchema.optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  type: z.enum(['TASK', 'FEATURE', 'BUG', 'IMPROVEMENT', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: uuidSchema.optional().nullable(),
  dueDate: z.string().date().optional().nullable(),
});

export const taskFilterSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: uuidSchema.optional(),
  projectId: uuidSchema.optional(),
});

// ============================================================================
// MESSAGE VALIDATIONS
// ============================================================================

export const createMessageSchema = z.object({
  projectId: uuidSchema,
  content: z.string().min(1, 'Message content is required'),
  parentId: uuidSchema.optional().nullable(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

// ============================================================================
// PAGINATION VALIDATIONS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Validate and return validated data or errors
 */
export const validate = (schema) => {
  return (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { valid: false, errors };
    }
    return { valid: true, data: result.data };
  };
};

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createWorkspaceSchema,
  updateWorkspaceSchema,
  addWorkspaceMemberSchema,
  updateWorkspaceMemberSchema,
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberSchema,
  createTaskSchema,
  updateTaskSchema,
  taskFilterSchema,
  createMessageSchema,
  updateMessageSchema,
  paginationSchema,
  validate,
};