// ============================================================================
// UTILITIES - API Response Format
// ============================================================================

/**
 * Standard API response format
 */
export const apiResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta }),
    timestamp: new Date().toISOString(),
  };
  
  return res.status(statusCode).json(response);
};

// Success responses
export const successResponse = (res, message = 'Success', data = null, meta = null) => {
  return apiResponse(res, 200, true, message, data, meta);
};

export const createdResponse = (res, message = 'Created successfully', data = null) => {
  return apiResponse(res, 201, true, message, data);
};

export const updatedResponse = (res, message = 'Updated successfully', data = null) => {
  return apiResponse(res, 200, true, message, data);
};

export const deletedResponse = (res, message = 'Deleted successfully') => {
  return apiResponse(res, 200, true, message);
};

// Error responses
export const errorResponse = (res, message = 'Internal Server Error', statusCode = 500) => {
  return apiResponse(res, statusCode, false, message);
};

export const badRequestResponse = (res, message = 'Bad Request', errors = null) => {
  return apiResponse(res, 400, false, message, errors);
};

export const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return apiResponse(res, 401, false, message);
};

export const forbiddenResponse = (res, message = 'Forbidden') => {
  return apiResponse(res, 403, false, message);
};

export const notFoundResponse = (res, message = 'Not Found') => {
  return apiResponse(res, 404, false, message);
};

export const conflictResponse = (res, message = 'Conflict') => {
  return apiResponse(res, 409, false, message);
};

export const validationErrorResponse = (res, message = 'Validation Error', errors = []) => {
  return apiResponse(res, 422, false, message, errors);
};

export default {
  apiResponse,
  successResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
};