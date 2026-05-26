const express = require('express');
const cors = require('cors');
const compression = require('compression');
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

const logger = require('./config/logger');
const {
  securityHeaders,
  corsOptions,
  preventParamPollution,
  attachRequestId,
  jsonLimit,
  urlencodedLimit,
} = require('./middlewares/security');

const app = express();

// ─── Security Layer (order matters) ──────────────────────────────────────────
app.use(attachRequestId);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(preventParamPollution);

// ─── Paystack Webhook (raw body BEFORE express.json) ─────────────────────────
app.use('/api/verify/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: urlencodedLimit }));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Health Check ─────────────────────────────────────────────────────────────
const { version } = require('../package.json');
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    version,
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const router = require('./routes/index.js');
app.use('/api', router);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational === true;

  const reqLogger = logger.child({ requestId: req.requestId });

  if (isOperational) {
    reqLogger.warn({ statusCode, message: err.message }, 'Operational error');
  } else {
    reqLogger.error({ err, statusCode }, 'Unexpected error');
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational
      ? err.message
      : process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message,
    requestId: req.requestId,
  });
});

module.exports = app;
