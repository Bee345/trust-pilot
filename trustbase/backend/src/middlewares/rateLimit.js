const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests. Slow down.' },
});

const reportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Report limit reached. Try again in 1 hour.' },
});

module.exports = { authRateLimit, searchRateLimit, reportRateLimit };
