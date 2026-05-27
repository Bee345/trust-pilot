// Application-wide constants.
// Never use magic numbers or strings directly in business logic.
// Reference these instead so intent is clear and changes are in one place.

const SCAM_TYPES = Object.freeze([
  'Online Marketplace Scam',
  'Fake Product / Non-delivery',
  'POS Fraud',
  'Investment / Ponzi',
  'Romantic Scam',
  'Loan / Finance Fraud',
  'Job / Recruitment Scam',
  'Other',
]);

const VERIFICATION_TYPES = Object.freeze(['individual', 'business']);

const VERIFICATION_STATUS = Object.freeze({
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_RECEIVED: 'payment_received',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
});

// Report status flow:
//   pending → published (future: moderation queue approves)
//   pending → rejected  (future: moderation queue rejects)
// Currently all reports stay 'pending' on creation.
// Queries use .neq('rejected') so pending reports are visible.
// A moderation queue to transition pending → published/rejected
// is deferred to a future sprint.

const RISK_LEVELS = Object.freeze({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' });

const NIGERIAN_PHONE_REGEX = /^(0[7-9][0-1]\d{8})$/;

// Paystack amounts in kobo (1 Naira = 100 kobo)
const VERIFICATION_PRICES_KOBO = Object.freeze({
  individual: 200000,   // ₦2,000
  business: 500000,     // ₦5,000
});

const JWT_EXPIRY = '7d';
const BCRYPT_SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

const RATE_LIMITS = Object.freeze({
  AUTH_MAX: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000,        // 15 minutes
  SEARCH_MAX: 60,
  SEARCH_WINDOW_MS: 60 * 1000,           // 1 minute
  REPORT_MAX: 10,
  REPORT_WINDOW_MS: 60 * 60 * 1000,      // 1 hour
});

const HIGH_RISK_SCAM_TYPES = Object.freeze(
  new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud'])
);

const MEDIUM_RISK_SCAM_TYPES = Object.freeze(
  new Set(['Online Marketplace Scam', 'Loan / Finance Fraud', 'Romantic Scam'])
);

const AUDIT_ACTIONS = Object.freeze({
  USER_SIGNUP: 'USER_SIGNUP',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGIN_FAILED: 'USER_LOGIN_FAILED',
  REPORT_SUBMITTED: 'REPORT_SUBMITTED',
  UPVOTE_ADDED: 'UPVOTE_ADDED',
  VERIFICATION_INITIATED: 'VERIFICATION_INITIATED',
  VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
});

module.exports = {
  SCAM_TYPES,
  VERIFICATION_TYPES,
  VERIFICATION_STATUS,
  REPORT_STATUS,
  RISK_LEVELS,
  NIGERIAN_PHONE_REGEX,
  VERIFICATION_PRICES_KOBO,
  JWT_EXPIRY,
  BCRYPT_SALT_ROUNDS,
  OTP_EXPIRY_MINUTES,
  OTP_LENGTH,
  RATE_LIMITS,
  HIGH_RISK_SCAM_TYPES,
  MEDIUM_RISK_SCAM_TYPES,
  AUDIT_ACTIONS,
};
