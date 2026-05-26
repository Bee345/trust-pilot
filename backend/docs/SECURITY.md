# TrustBase Backend — Security Architecture

This document is the single authoritative reference for the security posture
of the TrustBase backend. Every engineer touching this codebase must read this
document before making changes to any security-relevant code. Sections are
ordered from outermost (network) to innermost (data), matching the request
lifecycle.

---

## Table of Contents

1. [Middleware Order and Rationale](#1-middleware-order-and-rationale)
2. [Authentication — JWT](#2-authentication--jwt)
3. [Input Validation — Zod](#3-input-validation--zod)
4. [Rate Limiting](#4-rate-limiting)
5. [Paystack Webhook — HMAC Verification](#5-paystack-webhook--hmac-verification)
6. [Error Handling Contract](#6-error-handling-contract)
7. [AppError Usage Contract](#7-apperror-usage-contract)
8. [Audit Logging — Event Catalogue](#8-audit-logging--event-catalogue)
9. [Row-Level Security (RLS) Posture](#9-row-level-security-rls-posture)
10. [Secrets Management](#10-secrets-management)
11. [Logging Rules](#11-logging-rules)
12. [Search Input Sanitisation](#12-search-input-sanitisation)
13. [Request Timeout](#13-request-timeout)
14. [Response Compression](#14-response-compression)
15. [What to Do If a Credential Leaks](#15-what-to-do-if-a-credential-leaks)
16. [Security Test Cases](#16-security-test-cases)

---

## 1. Middleware Order and Rationale

The middleware stack in `src/app.js` is ordered deliberately. Changing the
order without understanding the rationale below will introduce security gaps.

```
1.  Sentry.init()                         — captures startup errors
2.  attachRequestId                       — UUID attached before any log fires
3.  securityHeaders (helmet)              — HTTP headers set before any response
4.  cors(corsOptions)                     — CORS checked before body is parsed
5.  preventParamPollution (hpp)           — query-string normalised before routing
6.  express.raw({ type: 'application/json' }) — ONLY on /api/verify/webhook
7.  express.json({ limit: '10kb' })       — body parsed after raw route
8.  express.urlencoded({ limit: '10kb' }) — form body parsed
9.  compression()                         — applied after body parsing
10. pino request logger                   — request logged with requestId
11. authRateLimit / searchRateLimit / reportRateLimit — per-route limiters
12. validate(schema)                      — Zod at every input boundary
13. verifyToken / optionalAuth            — JWT per route
14. Paystack HMAC verification            — inside verification.service.js
15. Global error handler                  — LAST; never leaks stack in production
```

**Why this order matters:**

- **Sentry before everything:** startup errors and uncaught exceptions are
  captured even if the rest of the stack never initialises.

- **attachRequestId before logging:** every log line, including errors, carries
  the requestId. Without this, correlating logs across a request is impossible.

- **securityHeaders before routes:** Helmet sets HTTP response headers (CSP,
  HSTS, X-Frame-Options, X-Content-Type-Options, etc.) on every response,
  including error responses. If placed after routes, error responses miss
  these headers.

- **cors before body parsing:** a rejected CORS preflight never touches the
  request body. This prevents a malicious origin from bypassing CORS by
  sending a body that a later middleware might act on before CORS rejects.

- **express.raw BEFORE express.json for /api/verify/webhook:** Paystack sends
  a raw JSON body. HMAC-SHA512 verification requires the exact raw bytes — once
  `express.json` parses and re-serialises the body, byte-for-byte integrity is
  lost and signature verification will fail. The route-scoped `express.raw`
  intercepts requests to `/api/verify/webhook` before `express.json` runs.

- **rate limiters before validate and auth:** a brute-force attacker is stopped
  at the rate limiter without consuming database connections or running Zod
  schemas.

- **validate before auth:** invalid input is rejected before a JWT database
  lookup runs. This prevents blind probing attacks from consuming DB resources.

- **Global error handler is LAST:** Express requires error handlers to have
  exactly four parameters `(err, req, res, next)`. If it is placed before
  routes, Express will not recognise it as an error handler.

---

## 2. Authentication — JWT

**Token format:** HS256, signed with `JWT_SECRET`.

**Expiry:** 7 days (`JWT_EXPIRY` constant in `constants/index.js`).

**Storage (frontend):** `localStorage` key `trustbase_token`. The frontend
clears this key on any 401 response via `lib/api.js`.

**Transmission:** `Authorization: Bearer <token>` header on every authenticated
request. The token is never sent as a URL query parameter.

**Verification middleware (`middlewares/auth.js`):**

- `verifyToken` — required auth. Verifies the signature, checks expiry, attaches
  `req.user = { id, phone }` to the request. Throws `unauthorized` if token is
  absent, malformed, or expired.

- `optionalAuth` — optional auth. Same verification logic but does not throw
  on missing token. Used on routes where both guests and authenticated users
  are allowed (e.g., `POST /api/reviews`).

**What is never done:**

- JWT secret is never committed to git. It is read from `process.env.JWT_SECRET`
  which is checked at startup; the server exits if it is missing.
- `req.user` is never set from the request body or query string — only from
  a verified JWT.
- Password hashes are never included in JWT payload.

---

## 3. Input Validation — Zod

All input at system boundaries is validated through Zod schemas defined in
`src/utils/validators.js`. The `validate(schema)` middleware in
`src/middlewares/validate.js` runs `schema.safeParse(req.body)`. On failure it
returns HTTP 422 with field-level error messages. On success it sets
`req.validatedBody` with the stripped, typed data.

**All schemas call `.strip()`.** Unknown fields are silently removed. A client
cannot inject extra fields that a later function might accidentally use.

**Schemas defined:**

| Schema               | Route                     | Key validations                                              |
|----------------------|---------------------------|--------------------------------------------------------------|
| `signupSchema`       | POST /api/auth/signup      | name ≥ 2 chars; Nigerian phone regex; password ≥ 8 chars    |
| `loginSchema`        | POST /api/auth/login       | Nigerian phone regex; password non-empty                     |
| `reportSchema`       | POST /api/reviews          | scamType must be exact DB enum; description ≥ 20 chars       |
| `verificationSchema` | POST /api/verify/initiate  | type must be 'individual' or 'business'                      |
| `updateProfileSchema`| PUT /api/users/me          | name ≥ 2 chars                                               |

**Nigerian phone regex:** `/^(0[7-9][0-1]\d{8})$/`
This regex is the canonical definition. It is used in both `signupSchema` and
`reportSchema` (optional phone field). It must never be changed without a
Claude.ai review — Nigerian carrier prefixes change slowly but do change.

**Search query sanitisation** is handled separately from Zod because search
is a GET request with query parameters, not a JSON body. See
[Section 12](#12-search-input-sanitisation).

---

## 4. Rate Limiting

Rate limiting is applied at the route level before validation or auth runs.
All limit values come from the `RATE_LIMITS` constant in
`src/constants/index.js` — never hardcoded in middleware.

| Limiter            | Window     | Max requests | Applied to                                |
|--------------------|------------|--------------|-------------------------------------------|
| `authRateLimit`    | 15 minutes | 10           | POST /api/auth/signup, POST /api/auth/login|
| `searchRateLimit`  | 1 minute   | 30           | All GET search and retrieval endpoints    |
| `reportRateLimit`  | 1 hour     | 5            | POST /api/reviews                         |

**Progressive lockout** is implemented in `auth.service.js` for login failures.
After 5 failed attempts the account is locked for 20 minutes, after 10 for
40 minutes, after 15 for 120 minutes. Lockout data is stored in the `users`
table in the `lockout_until` and `failed_attempts` columns.

**Rate limit hit logging:** when any limiter fires, a `RATE_LIMIT_HIT` audit
event is written via `createAuditLog()` with the request IP address. This
provides a record of brute-force attempts even after the window resets.

---

## 5. Paystack Webhook — HMAC Verification

The `/api/verify/webhook` endpoint receives payment status events from Paystack.
These events trigger user verification state changes — they are high-value and
must be authenticated.

**Verification flow:**

1. Express intercepts the route with `express.raw({ type: 'application/json' })`
   before `express.json` runs. The raw `Buffer` is available as `req.body`.

2. `verification.service.js` calls `verifyPaystackSignature(rawBody, signature)`:
   ```js
   const hash = crypto
     .createHmac('sha512', process.env.PAYSTACK_SECRET)
     .update(rawBody)
     .digest('hex');
   if (hash !== signature) throw unauthorized('Invalid webhook signature');
   ```

3. The Paystack signature arrives in `req.headers['x-paystack-signature']`.

4. If the HMAC does not match, the request is rejected immediately with `401`.
   No database read or write occurs before the HMAC check passes.

5. On a valid `charge.success` event with a reference matching a pending
   verification, the user's `is_verified` flag and `verification_type` are
   updated and a `VERIFICATION_APPROVED` audit event is written.

6. **The endpoint always responds `200` immediately** after signature
   verification, regardless of whether the event type is recognised. Paystack
   retries events that receive non-2xx responses. Responding `200` immediately
   and processing asynchronously is the correct Paystack integration pattern.

**Test card:** 4084 0840 8408 4081 (any future expiry, CVV 408).

---

## 6. Error Handling Contract

**Backend global error handler** is the last middleware in `app.js`.

- Every error response includes `{ success: false, message, requestId }`.
- `requestId` is always present — it allows correlating a client error with
  the specific server log entry.
- Stack traces are stripped in `NODE_ENV=production`. A developer's stack
  trace must never reach a client in production.
- Internal error details (database query text, env var names, file paths,
  Supabase error codes) are never included in any response.

**Operational vs non-operational errors:**

- `AppError` instances (from factory functions) have `isOperational = true`.
  These are expected errors — wrong password, duplicate phone, 404, etc.
  The client receives the error message directly.

- Any other thrown value (`throw new Error(...)` is forbidden — see
  [Section 7](#7-apperror-usage-contract)) has `isOperational = false`.
  The client receives `'Something went wrong'` in production. Sentry receives
  the full error including stack trace.

**Frontend API error contract (`frontend/src/lib/api.js`):**

| HTTP status | Client message shown                       |
|-------------|--------------------------------------------|
| 401         | localStorage cleared → redirect to /login  |
| 429         | 'Too many requests, please wait'            |
| 500+        | 'Something went wrong'                      |
| Network fail| 'Check your connection and try again'       |

---

## 7. AppError Usage Contract

`src/errors/AppError.js` exports factory functions. Every thrown error in the
backend must use one of these factories. Raw `Error` objects are forbidden.

**Available factories:**

| Factory           | HTTP status | isOperational | Use for                                        |
|-------------------|-------------|---------------|------------------------------------------------|
| `notFound(entity)`| 404         | true          | Resource lookup returned null                  |
| `unauthorized(msg)`| 401        | true          | Missing/invalid/expired JWT, wrong password    |
| `forbidden(msg)`  | 403         | true          | Authenticated but not permitted                |
| `conflict(msg)`   | 409         | true          | Duplicate record (phone, reference, etc.)      |
| `badRequest(msg)` | 400         | true          | Malformed input that passed Zod (edge cases)   |
| `paymentRequired(msg)`| 402     | true          | Payment action required before proceeding      |

**Right:**
```js
throw notFound('User');
throw unauthorized('Invalid token');
throw conflict('Phone number already registered');
```

**Wrong — forbidden:**
```js
throw new Error('Not found');                            // raw Error
throw Object.assign(new Error('Conflict'), { statusCode: 409 }); // manual status
const err = new Error('Duplicate'); err.statusCode = 409;        // manual status
```

The only place `new Error()` is used with intent is startup config checks in
`src/config/supabase.js` — and those use `process.exit(1)` not throw, and
`src/middlewares/security.js` CORS — and that uses `forbidden()`.

---

## 8. Audit Logging — Event Catalogue

All significant state-changing actions write to the `audit_logs` table via
`createAuditLog()` in `src/models/audit.model.js`. All calls are fire-and-forget
(`Promise` not awaited, `.catch` logs but never throws). This ensures a slow
audit write never blocks a response or causes an unhandled rejection.

**Schema:**
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Event catalogue:**

| Action                   | Entity         | When fired                                    | Metadata                                          |
|--------------------------|----------------|-----------------------------------------------|---------------------------------------------------|
| `USER_SIGNUP`            | `user`         | After user row created successfully           | `{ ip, userAgent }`                               |
| `USER_LOGIN`             | `user`         | After bcrypt passes and JWT is issued         | `{ ip, userAgent }`                               |
| `USER_LOGIN_FAILED`      | `user`         | Before each `unauthorized` throw in login     | `{ reason: 'invalid_credentials' }` — no phone    |
| `REPORT_SUBMITTED`       | `report`       | After report row created                      | `{ scamType, riskLevel }`                         |
| `UPVOTE_ADDED`           | `report`       | After upvote upsert                           | `{ reportId }`                                    |
| `VERIFICATION_INITIATED` | `verification` | After Paystack payment link created           | `{ type, paystackRef }`                           |
| `VERIFICATION_APPROVED`  | `verification` | After webhook confirms charge.success         | `{ type }`                                        |
| `RATE_LIMIT_HIT`         | `system`       | When any rate limiter fires                   | `{ ip, route }`                                   |

**PII minimisation rule:** `USER_LOGIN_FAILED` stores only
`{ reason: 'invalid_credentials' }`. The phone number is not logged — this
minimises the PII footprint in the audit table in the event of a breach.

---

## 9. Row-Level Security (RLS) Posture

The backend uses the Supabase **service role key** (`SUPABASE_KEY`). This key
bypasses RLS completely and is the intended pattern for a trusted backend server.
RLS policies are still enabled on all tables as a defence-in-depth measure —
if the backend's auth logic ever fails to enforce access control at the
application layer, RLS provides a second barrier.

**Tables and expected RLS policies:**

| Table          | RLS enabled | Notes                                                         |
|----------------|-------------|---------------------------------------------------------------|
| `users`        | Yes         | Users may only read/update their own row                      |
| `reports`      | Yes         | Published reports readable by all; insert authenticated only  |
| `report_upvotes`| Yes        | Insert authenticated; user can only upvote each report once   |
| `verifications`| Yes         | Users may only read their own verification row                |
| `audit_logs`   | Yes         | Read/write only by service role — no client access at all     |

**The service role key is backend-only.** It is read from `process.env.SUPABASE_KEY`
and is never sent to the frontend, never logged, and never appears in any API
response.

**The anon key is never used in the backend.** Using the anon key in the backend
would mean all queries run under RLS policies, making the backend unable to
perform admin-level operations (e.g., reading all reports for moderation).

---

## 10. Secrets Management

**Required secrets and their locations:**

| Secret              | Where used                         | How provided in production |
|---------------------|------------------------------------|----------------------------|
| `SUPABASE_URL`      | config/supabase.js                 | Railway environment variable|
| `SUPABASE_KEY`      | config/supabase.js                 | Railway environment variable|
| `JWT_SECRET`        | middlewares/auth.js, auth.service  | Railway environment variable|
| `PAYSTACK_SECRET`   | config/paystack.js, verification   | Railway environment variable|
| `TWILIO_SID`        | config/twilio.js                   | Railway environment variable|
| `TWILIO_TOKEN`      | config/twilio.js                   | Railway environment variable|
| `TWILIO_PHONE`      | utils/otp.js                       | Railway environment variable|
| `SENTRY_DSN`        | app.js                             | Railway environment variable|

**Rules:**

- `.env` files are never committed. `.env.example` is the documented contract
  for all variables — it contains placeholder values only.
- `backend/.env.test` (used by Jest integration tests) is in `.gitignore`.
  It points at `trustbase-test`, never `trustbase-prod`.
- Secrets are never logged. The pino logger is never called with any of the
  values above.
- Railway environment variables are the single source of truth for production
  secrets. No engineer needs direct access to production secrets for local
  development.

**JWT secret strength:** minimum 64 random bytes (128 hex characters). Use
`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

---

## 11. Logging Rules

Logger: `pino` instance in `src/config/logger.js`.
- JSON output in `NODE_ENV=production` (structured, machine-readable, fast).
- `pino-pretty` output in development (human-readable, coloured).
- Level controlled by `PINO_LEVEL` env var (defaults to `info`).

Every log entry must include `requestId`. This is attached via
`logger.child({ requestId: req.requestId })` at the start of each request.

**Log levels:**

| Level  | When to use                                                            |
|--------|------------------------------------------------------------------------|
| `fatal`| Startup failure (missing required env vars, failed DB connection)      |
| `error`| Non-operational errors — unexpected, captured by Sentry               |
| `warn` | Operational errors — known, expected (wrong password, rate limit, etc.)|
| `info` | Normal operations (request received, response sent, service started)   |
| `debug`| Verbose dev-only traces — never committed without `PINO_LEVEL=debug`  |

**Never log:**

- `password` or `password_hash`
- JWT token value
- `SUPABASE_KEY` or any other secret from environment variables
- `PAYSTACK_SECRET`
- Any value from `req.body.password`

---

## 12. Search Input Sanitisation

The `GET /api/companies/search?q=` endpoint accepts a free-text query. Before
passing the query to the PostgreSQL full-text search engine, `sanitiseSearchQuery`
in `src/utils/validators.js` applies the following transformations:

1. Trims leading and trailing whitespace.
2. Truncates to 100 characters maximum.
3. Strips tsquery operator characters: `!`, `'`, `(`, `)`, `*`, `:`, `&`, `|`,
   `<`, `>`, `\`. These characters have special meaning in PostgreSQL tsquery
   syntax and could be used to craft malformed queries.
4. Collapses runs of whitespace to single spaces.

After sanitisation, the query is passed to `searchEntities()` in
`company.model.js`, which uses Supabase's `.textSearch('search_vector', query)`
rather than ILIKE. This means the search uses the GIN-indexed `search_vector`
tsvector column instead of a sequential scan.

The `search_vector` column is populated by a PostgreSQL trigger defined in
`src/db/migrations/003_search_vectors.sql`. The trigger fires on every
`INSERT` or `UPDATE` on the `reports` table and indexes `business_name`,
`description`, and `phone`.

---

## 13. Request Timeout

The HTTP server in `src/server.js` applies a 10-second socket timeout via
Node.js-native `server.setTimeout()`. If a request takes longer than 10
seconds, the raw socket receives an HTTP 503 response and is destroyed.

This is implemented at the TCP level (not as Express middleware) and does not
require any additional npm package. The timeout is intentionally aggressive —
no legitimate API operation in TrustBase should take longer than a few seconds.
If a downstream service (Supabase, Paystack, Twilio) is hanging, the timeout
prevents the Node.js event loop from filling with stuck handles.

```js
server.setTimeout(10000, (socket) => {
  socket.write(
    'HTTP/1.1 503 Service Unavailable\r\n' +
    'Content-Type: application/json\r\n\r\n' +
    '{"success":false,"message":"Request timed out"}'
  );
  socket.destroy();
});
```

The 503 response body does not include a `requestId` because the timeout fires
at the socket level before Express has a chance to attach one. This is an
acceptable trade-off.

---

## 14. Response Compression

`compression()` middleware from the `compression` npm package is applied in
`app.js` after body parsing and before routes. It gzip-compresses all responses
where the client sends `Accept-Encoding: gzip`. This reduces response sizes
for large JSON payloads (report lists, search results) and is transparent to
the client.

Compression is applied to all routes including `/health`. It is not applied
to the Paystack webhook route (`/api/verify/webhook`) because that endpoint
uses `express.raw` — the request body must remain uncompressed for HMAC
verification, and the response to Paystack is a minimal 200 with no body.

---

## 15. What to Do If a Credential Leaks

This section defines the exact steps to follow if any secret is accidentally
committed to git or otherwise exposed.

### If SUPABASE_KEY (service role key) is exposed:

1. **Immediately:** Open Supabase dashboard → Project Settings → API →
   rotate the service role key. The old key is invalidated instantly.
2. Update the Railway environment variable with the new key.
3. Redeploy the Railway service.
4. Check `audit_logs` for any anomalous `action` entries in the window
   between the leak and the rotation.
5. Report the incident via the GitHub issue tracker with label `security`.

### If JWT_SECRET is exposed:

1. **Immediately:** Change `JWT_SECRET` in Railway environment variables.
2. Redeploy the Railway service.
3. **All existing JWTs are invalidated** — all users will be logged out and
   must log in again. This is the intended effect.
4. No user data is compromised; session tokens cannot be used after the secret
   rotates.

### If PAYSTACK_SECRET is exposed:

1. **Immediately:** Open Paystack dashboard → Settings → API Keys & Webhooks →
   rotate the secret key.
2. Update the Railway environment variable.
3. Check Paystack webhook logs for any calls with the old key from unexpected IPs.
4. Redeploy.

### If any secret is committed to a git branch:

1. Do not just delete the file and push a new commit — the secret is still in
   git history.
2. Rotate the secret first (see above for each credential type).
3. Then rewrite git history to remove the commit:
   `git filter-repo --path <file> --invert-paths`
   or use `git rebase -i` to edit/drop the offending commit.
4. Force-push the cleaned branch: this requires temporarily removing branch
   protection from `main`.
5. Notify all team members to re-clone or `git fetch --all && git reset --hard`.

---

## 16. Security Test Cases

The following cases are required in every sprint's test suite. They are
defined in `src/__tests__/integration/`.

| Test case                                               | Expected response |
|---------------------------------------------------------|-------------------|
| Unauthenticated request to any `verifyToken` route      | 401               |
| Expired JWT on any `verifyToken` route                  | 401               |
| POST /api/verify/webhook with wrong HMAC                | 401               |
| POST /api/verify/webhook with correct HMAC              | 200               |
| POST /api/reviews with scam_type not in enum            | 422               |
| POST /api/auth/signup with invalid phone                | 422               |
| POST /api/auth/signup with duplicate phone              | 409               |
| POST /api/auth/login with wrong password                | 401 (not 404)     |
| POST /api/auth/login with non-existent phone            | 401 (not 404)     |
| GET /api/companies/search with tsquery special chars    | 200 (sanitised)   |
| Any route after rate limit exceeded                     | 429               |
| POST /api/auth/login with extra unknown body fields     | 200 (fields stripped by Zod)|

The login tests (wrong password and non-existent phone) both return 401 — never
404. Returning 404 for a non-existent account reveals whether a phone number is
registered, which is an account enumeration vulnerability.
