const AppError = require('../utils/AppError');
const config = require('../config');

/**
 * Centralized error handler.
 * Handles Mongoose, JWT, and custom AppError instances.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  // ─── Mongoose bad ObjectId (CastError) ──────────────
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new AppError(message, 400);
  }

  // ─── Mongoose duplicate key ─────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for '${field}'. This ${field} already exists.`;
    error = new AppError(message, 400);
  }

  // ─── Mongoose validation error ──────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    const message = `Validation failed: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // ─── JWT errors ─────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please login again.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired. Please login again.', 401);
  }

  // ─── Multer errors ─────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large. Maximum size is 5MB.', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field.', 400);
  }

  // ─── Send response ─────────────────────────────────
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  res.status(statusCode).json({
    success: false,
    status,
    message: error.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
