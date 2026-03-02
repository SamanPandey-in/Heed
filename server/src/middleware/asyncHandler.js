// ============================================================================
// MIDDLEWARE - Async Error Handler Wrapper
// ============================================================================

import { logger } from '../config/logger.js';
import { errorResponse } from '../utils/apiResponse.js';
import { AppError } from '../utils/errors.js';

/**
 * Wraps async route handlers to catch errors and pass to Express error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Handle operational errors (known errors with status codes)
    if (error instanceof AppError) {
      logger.warn(`Operational Error: ${error.message}`, {
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
      });
      return errorResponse(res, error.message, error.statusCode);
    }
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return errorResponse(res, error.message, 400);
    }
    
    if (error.name === 'UnauthorizedError') {
      return errorResponse(res, 'Unauthorized access', 401);
    }
    
    // Unknown error — log full stack
    logger.error(`Route Error: ${req.method} ${req.path}`, {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
    
    // Default to 500 internal server error
    return errorResponse(res, 'Internal Server Error', 500);
  });
};

/**
 * Global error handler middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  return errorResponse(res, 'Internal Server Error', 500);
};

/**
 * Not found handler for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 404);
};

export default asyncHandler;