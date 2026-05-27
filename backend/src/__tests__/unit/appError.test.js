const {
  AppError,
  notFound,
  unauthorized,
  forbidden,
  conflict,
  badRequest,
  paymentRequired,
  tooManyRequests,
} = require('../../errors/AppError');

describe('AppError class', () => {
  it('extends Error', () => {
    const err = new AppError('test', 500);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('sets message, statusCode, and isOperational', () => {
    const err = new AppError('broken', 503);
    expect(err.message).toBe('broken');
    expect(err.statusCode).toBe(503);
    expect(err.isOperational).toBe(true);
  });
});

describe('factory functions', () => {
  it('notFound creates 404 with resource name', () => {
    const err = notFound('User');
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('User not found');
    expect(err.isOperational).toBe(true);
  });

  it('unauthorized creates 401 with default message', () => {
    const err = unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication required');
  });

  it('unauthorized accepts a custom message', () => {
    const err = unauthorized('Token expired');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Token expired');
  });

  it('forbidden creates 403 with default message', () => {
    const err = forbidden();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Access denied');
  });

  it('forbidden accepts a custom message', () => {
    const err = forbidden('Admin only');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Admin only');
  });

  it('conflict creates 409', () => {
    const err = conflict('Phone already registered');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Phone already registered');
    expect(err.isOperational).toBe(true);
  });

  it('badRequest creates 400', () => {
    const err = badRequest('Invalid input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Invalid input');
  });

  it('paymentRequired creates 402', () => {
    const err = paymentRequired('Payment needed');
    expect(err.statusCode).toBe(402);
    expect(err.message).toBe('Payment needed');
  });

  it('tooManyRequests creates 429', () => {
    const err = tooManyRequests('Slow down');
    expect(err.statusCode).toBe(429);
    expect(err.message).toBe('Slow down');
    expect(err.isOperational).toBe(true);
  });
});
