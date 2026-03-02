// ============================================================================
// UTILS - Custom Error Classes
// ============================================================================

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(msg = 'Not found') {
        super(msg, 404);
    }
}

export class ForbiddenError extends AppError {
    constructor(msg = 'Forbidden') {
        super(msg, 403);
    }
}

export class ValidationError extends AppError {
    constructor(msg = 'Validation failed') {
        super(msg, 400);
    }
}

export class ConflictError extends AppError {
    constructor(msg = 'Conflict') {
        super(msg, 409);
    }
}

export class UnauthorizedError extends AppError {
    constructor(msg = 'Unauthorized') {
        super(msg, 401);
    }
}
