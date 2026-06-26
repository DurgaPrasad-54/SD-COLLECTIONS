const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
require('express-async-errors'); // Wraps async route handlers automatically

const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

const app = express();

// ─── Security Middleware ──────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request Logging ──────────────────────────────────
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Body Parsers ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Cookie Parser ────────────────────────────────────
app.use(cookieParser());

// ─── MongoDB Injection Protection ─────────────────────
app.use(mongoSanitize());

// ─── Rate Limiting ────────────────────────────────────
// app.use('/api', apiLimiter);

// ─── Static Files (Uploads) ──────────────────────────
// Removed local static uploads since we use Cloudinary

// ─── API Routes ───────────────────────────────────────
app.use('/api', routes);

// ─── Root endpoint ────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛍️ SD COLLECTIONS eCommerce API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// ─── 404 Handler ──────────────────────────────────────
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// ─── Global Error Handler ─────────────────────────────
app.use(errorHandler);

module.exports = app;
