// Custom error class for all predictable application errors.
// Use this instead of: const err = new Error('msg'); err.statusCode = 404;
//
// Why a dedicated class: gives us instanceof checks, consistent shape,
// and separates "expected errors" (user did something wrong) from
// "unexpected errors" (bugs) that go to Sentry.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as a known, expected error
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-built factory functions — use these instead of new AppError() directly.
// They make controller code read like plain English.

const notFound = (resource) => new AppError(`${resource} not found`, 404);
const unauthorized = (msg = 'Authentication required') => new AppError(msg, 401);
const forbidden = (msg = 'Access denied') => new AppError(msg, 403);
const conflict = (msg) => new AppError(msg, 409);
const badRequest = (msg) => new AppError(msg, 400);
const paymentRequired = (msg) => new AppError(msg, 402);
const tooManyRequests = (msg) => new AppError(msg, 429);

module.exports = { AppError, notFound, unauthorized, forbidden, conflict, badRequest, paymentRequired, tooManyRequests };
