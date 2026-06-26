const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter (Disabled/Pass-through).
 */
const apiLimiter = (req, res, next) => next();

/**
 * Strict rate limiter for auth endpoints.
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
