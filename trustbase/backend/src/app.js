const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Security middleware — must be loaded before app is used
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
app.use(attachRequestId);           // track every request with unique ID
app.use(securityHeaders);           // helmet: 11+ security headers
app.use(cors(corsOptions));         // strict CORS whitelist
app.use(preventParamPollution);     // block HTTP parameter pollution

// ─── Paystack Webhook (raw body BEFORE express.json) ─────────────────────────
// Webhook signature verification requires the raw request body string.
// express.json() would parse it into an object, breaking HMAC verification.
app.use('/api/verify/webhook', express.raw({ type: 'application/json' }));

// ─── Body Parsing (limited size to prevent payload attacks) ──────────────────
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: urlencodedLimit }));

// ─── Health Check (no auth, always public) ────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const router = require('./routes/index.js');
app.use('/api', router);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler (must be last, 4 params) ───────────────────────────
// Handles both operational errors (AppError) and unexpected errors (bugs).
// Unexpected errors are forwarded to Sentry via the requestHandler above.
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational === true;

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
