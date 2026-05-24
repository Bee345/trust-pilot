const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../constants');

const authRateLimit = rateLimit({
  windowMs: RATE_LIMITS.AUTH_WINDOW_MS,
  max: RATE_LIMITS.AUTH_MAX,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const searchRateLimit = rateLimit({
  windowMs: RATE_LIMITS.SEARCH_WINDOW_MS,
  max: RATE_LIMITS.SEARCH_MAX,
  message: { success: false, message: 'Too many requests. Slow down.' },
});

const reportRateLimit = rateLimit({
  windowMs: RATE_LIMITS.REPORT_WINDOW_MS,
  max: RATE_LIMITS.REPORT_MAX,
  message: { success: false, message: 'Report limit reached. Try again in 1 hour.' },
});

module.exports = { authRateLimit, searchRateLimit, reportRateLimit };
