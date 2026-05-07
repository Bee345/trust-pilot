# TrustBase Backend — Coding Rules
# Read before writing any backend code.
# These rules apply to every file in trustbase/backend/src/

---

## Module System — CRITICAL

ALWAYS use CommonJS. NEVER use ES Module syntax.

CORRECT:
  const express = require('express');
  module.exports = router;
  module.exports = { signup, login };

WRONG (will break the app):
  import express from 'express';
  export default router;
  export { signup, login };

Reason: package.json declares "type": "commonjs".
This is a deliberate choice and will not change.

---

## File Responsibilities — One Job Per File

controllers/
  - Read req.body / req.params / req.query
  - Call exactly one service function
  - Send the response
  - DO NOT write any business logic
  - DO NOT write any database queries
  - Catch errors and pass to next(err) or return error()

services/
  - ALL business logic lives here
  - Can call multiple models
  - Can call external APIs (Twilio, Paystack)
  - Can throw errors with custom statusCode
  - DO NOT import express or touch req/res

models/
  - ALL database queries go here
  - Call Supabase only (no business logic)
  - Every function either returns data or throws
  - Never return raw Supabase error objects — throw them

middlewares/
  - auth.js: JWT verification only
  - validate.js: Zod schema validation only
  - rateLimit.js: rate limiting configs only
  - DO NOT put business logic in middleware

routes/
  - Wire URLs to controllers + middlewares
  - Nothing else

utils/
  - Pure functions only (no side effects in validators.js, risk.js)
  - No database calls
  - No req/res references

config/
  - Initialize and export external clients
  - No logic, just configuration

---

## Error Handling Pattern

In services — throw errors with statusCode:
```js
const err = new Error('Phone number already registered');
err.statusCode = 409;
throw err;
```

In controllers — catch and handle:
```js
async function myController(req, res, next) {
  try {
    const result = await myService(req.validatedBody);
    success(res, result);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);   // unexpected errors go to global error handler → Sentry
  }
}
```

Global error handler in app.js (last middleware):
```js
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message,
  });
});
```

---

## HTTP Response Format

Always use the helpers from utils/response.js.
NEVER build response objects manually in controllers.

Success:
  success(res, { user })         → { success: true, data: { user } }
  success(res, { reports }, 201) → 201 { success: true, data: { reports } }

Error:
  error(res, 'Not found', 404)   → { success: false, message: 'Not found' }

---

## HTTP Status Codes to Use

  200 — OK (GET, PUT success)
  201 — Created (POST success)
  400 — Bad request (client did something wrong, generic)
  401 — Unauthorized (missing or invalid JWT)
  403 — Forbidden (authenticated but not allowed)
  404 — Not found
  409 — Conflict (duplicate — phone already registered)
  422 — Unprocessable Entity (Zod validation failed)
  429 — Too Many Requests (rate limit hit)
  500 — Internal Server Error (unexpected — goes to Sentry)

---

## Authentication Rules

JWT tokens:
  - Sign with JWT_SECRET from process.env
  - Expiry: 7 days ('7d')
  - Payload: { sub: userId }
  - NEVER put sensitive data (password, full user object) in JWT payload

Protected routes use verifyToken middleware.
Anonymous-allowed routes use optionalAuth middleware.

Read req.user.sub to get the logged-in user's ID.

Never return password_hash in any response.
Strip it at the model layer using Supabase column selection.

---

## Input Validation Rules

All user input is validated with Zod BEFORE it reaches the service.
Use the validate() middleware factory from middlewares/validate.js.
Schemas live in utils/validators.js ONLY.

After validate() runs, use req.validatedBody in controllers (not req.body).
req.validatedBody is safe — Zod has already stripped unknown fields.

Return 422 for validation failures (not 400).

---

## Nigerian Phone Number

Required format: 080XXXXXXXX, 081XXXXXXXX, 070XXXXXXXX, 090XXXXXXXX, 091XXXXXXXX
Regex: /^(0[7-9][0-1]\d{8})$/
This is enforced in validators.js. Do not add phone validation anywhere else.

For Twilio SMS — convert to E.164 format:
  '08012345678' → '+2348012345678'
  Code: '+234' + phone.substring(1)

---

## Rate Limiting

Apply via middleware from middlewares/rateLimit.js:

  authRateLimit   — POST /auth/signup and POST /auth/login (5 per 15 min per IP)
  searchRateLimit — GET searches (60 per minute per IP)
  reportRateLimit — POST /reviews (10 per hour per IP)

---

## Paystack Webhook Security — CRITICAL

ALWAYS verify the webhook signature before processing any payment event.

```js
const crypto = require('crypto');
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET)
  .update(rawBody)    // must be the RAW body string, not parsed JSON
  .digest('hex');

if (hash !== req.headers['x-paystack-signature']) {
  return res.sendStatus(401);
}
```

For rawBody to work, add to app.js before express.json():
```js
app.use('/api/verify/webhook', express.raw({ type: 'application/json' }));
```

For all other routes, express.json() still works normally.
The webhook route must receive the raw body to verify the signature.

Respond with 200 IMMEDIATELY — Paystack retries if you don't respond fast.
Do any slow processing after sending the response.

---

## Socket.io Events

Server emits (never receives) these events:
  'new_report'          — when a report is submitted and published
  'verification_update' — when a verification status changes

Use emitNewReport() and emitVerificationUpdate() from sockets/index.js.
Never import io directly in services — use the emit helper functions.

---

## Environment Variables

Load with dotenv (already in app.js): require('dotenv').config()

Required (app MUST crash if missing):
  PORT, SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, JWT_SECRET

Optional (features degrade if missing — check before using):
  TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE
  PAYSTACK_SECRET
  SOCKET_PORT
  SENTRY_DSN

In config files, check for missing required vars:
```js
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}
```

---

## Logging

Use console.warn only during development for missing optional services.
Never use console.log in production code.

When adding pino logger (future):
  - Replace all console.warn/info with logger.warn/info
  - Log: timestamp, level, message, requestId

---

## Security Checklist (for every PR)

  [ ] No hardcoded secrets, keys, or tokens
  [ ] No .env files committed
  [ ] No SQL injection (Supabase parameterizes automatically — just use it correctly)
  [ ] No password_hash in any API response
  [ ] JWT secret comes from process.env
  [ ] Paystack webhook signature verified
  [ ] Rate limiting applied to auth and submit endpoints
  [ ] Zod validation on all user inputs
  [ ] Error messages don't expose internals in production
