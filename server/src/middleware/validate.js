// ============================================================================
// MIDDLEWARE - Validation Middleware
// ============================================================================

import { validationErrorResponse } from '../utils/apiResponse.js';

/**
 * Validates request body against a Zod schema
 * @param {Object} schema - Zod schema
 * @returns {Function} - Middleware function
 */
export const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
        const errors = result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return validationErrorResponse(res, 'Validation failed', errors);
    }
    
    req.validated = result.data;
    next();
};

/**
 * Validates request query params against a Zod schema
 * @param {Object} schema - Zod schema
 * @returns {Function} - Middleware function
 */
export const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    
    if (!result.success) {
        const errors = result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return validationErrorResponse(res, 'Invalid query params', errors);
    }
    
    req.validatedQuery = result.data;
    next();
};

/**
 * Validates request params against a Zod schema
 * @param {Object} schema - Zod schema
 * @returns {Function} - Middleware function
 */
export const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);
    
    if (!result.success) {
        const errors = result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }));
        return validationErrorResponse(res, 'Invalid URL params', errors);
    }
    
    req.validatedParams = result.data;
    next();
};
