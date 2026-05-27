# TrustBase Backend — Feature Log

Append-only. Never delete entries. One entry per sprint or significant feature.

---

## Sprint 0 — Folder Migration + Infrastructure Hardening
**Date:** 2026-05-23
**Branch:** fix/sprint-0 (merged to main via PR #1)

**What was built:**
- Renamed `trustbase/` → `frontend/` and moved `trustbase/backend/` → `backend/` at repo root
- Added `CLAUDE.md` (master operating file) and `TRUSTBASE_CLAUDE_CODE_PROMPT.txt` at repo root
- Added `backend/eslint.config.js`: ESLint v10 flat config with all CLAUDE.md rules; `ignoreRestSiblings: true` on `no-unused-vars` to support rest-destructure-to-exclude pattern (`const { password_hash, ...safeUser } = user`)
- Added `.lintstagedrc.js`: direct Node ESLint binary calls — fixes Windows PowerShell 5.1 `&&` incompatibility in Husky pre-commit hooks
- Removed broken `"lint-staged": {}` key from root `package.json` (caused "Configuration should not be empty" error)
- Added `.claude/` to `.gitignore`
- Fixed `consistent-return` across auth/company/review/verification controllers and auth/validate middlewares
- Fixed `parseInt` missing radix in `review.controller.js`
- Added `backend/src/models/audit.model.js`: `createAuditLog()` writes to `audit_logs` table, fire-and-forget
- Added `backend/src/config/logger.js`: pino instance (JSON in prod, pino-pretty in dev)
- Added `backend/src/db/migrations/002_audit_logs.sql`: `audit_logs` table schema with indexes
- Added `backend/src/services/user.service.js`: `getProfile`, `updateProfile`
- Added `backend/scripts/verify-schema.js`: validates all required tables exist in Supabase

**Files created:** `CLAUDE.md`, `TRUSTBASE_CLAUDE_CODE_PROMPT.txt`, `backend/eslint.config.js`, `.lintstagedrc.js`, `backend/src/models/audit.model.js`, `backend/src/config/logger.js`, `backend/src/db/migrations/002_audit_logs.sql`, `backend/src/services/user.service.js`, `backend/scripts/verify-schema.js`

**Files modified:** `.gitignore`, `package.json`, `backend/src/controllers/auth.controller.js`, `backend/src/controllers/company.controller.js`, `backend/src/controllers/review.controller.js`, `backend/src/controllers/verification.controller.js`, `backend/src/middlewares/auth.js`, `backend/src/middlewares/validate.js`, `backend/src/app.js`

---

## Sprint 1 — Audit Logging Wired Into Services
**Date:** 2026-05-24
**Branch:** feature/backend

**What was built:**
- Added `AUDIT_ACTIONS` frozen constant to `backend/src/constants/index.js` — eliminates magic strings from all service audit calls. Actions: `USER_SIGNUP`, `USER_LOGIN`, `USER_LOGIN_FAILED`, `REPORT_SUBMITTED`, `UPVOTE_ADDED`, `VERIFICATION_INITIATED`, `VERIFICATION_APPROVED`
- `auth.service.js`: `signup()` and `login()` now accept `context = {}` (ipAddress, userAgent) as second parameter. Fire-and-forget audit calls written for `USER_SIGNUP` (after user created), `USER_LOGIN` (after bcrypt passes), and `USER_LOGIN_FAILED` (before each `unauthorized` throw). `USER_LOGIN_FAILED` metadata is `{ reason: 'invalid_credentials' }` only — no phone or hash to minimise PII in audit table.
- `auth.controller.js`: extracts `{ ipAddress: req.ip, userAgent: req.headers['user-agent'] }` and passes as context to both service calls.
- `report.service.js`: fire-and-forget `REPORT_SUBMITTED` audit after `createReport()` succeeds (metadata: scamType, riskLevel). Fire-and-forget `UPVOTE_ADDED` audit in `upvoteReportById()` after DB write.
- `verification.service.js`: fire-and-forget `VERIFICATION_INITIATED` audit after `createVerification()` succeeds (metadata: type, paystackRef). Fire-and-forget `VERIFICATION_APPROVED` audit in `approveVerification()` after status update (metadata: type). Route for `approveVerification` does not exist yet — audit call ships now so it is ready when the admin route is built in Sprint 3.

**Design decisions (approved via Claude.ai before execution):**
- `USER_LOGIN_FAILED` metadata: `{ reason: 'invalid_credentials' }` only. No phone logged — reduces PII footprint in audit table.
- `UPVOTE_ADDED` added to Sprint 1 scope (same file as `REPORT_SUBMITTED`, avoids a second PR touching report.service.js).
- `approveVerification` audit call ships now even though the admin route is deferred to Sprint 3.

**Files created:** `backend/docs/FEATURE_LOG.md` (this file)

**Files modified:** `backend/src/constants/index.js`, `backend/src/services/auth.service.js`, `backend/src/controllers/auth.controller.js`, `backend/src/services/report.service.js`, `backend/src/services/verification.service.js`

---

## Sprint 3 — Full-Text Search + Compression + Security Hardening
**Date:** 2026-05-26
**Branch:** feature/backend

**What was built:**

- Created `backend/src/db/migrations/003_search_vectors.sql`: adds `search_vector tsvector` column to `reports`, GIN index on that column, and a trigger (`reports_search_update`) that populates the column automatically on INSERT/UPDATE from `business_name`, `description`, and `phone`.

- Updated `backend/src/models/company.model.js`: `searchEntities()` now uses Supabase `.textSearch('search_vector', query)` instead of ILIKE. This uses the GIN index and avoids sequential scans.

- Added `sanitiseSearchQuery()` to `backend/src/utils/validators.js`: strips tsquery operator characters (`!`, `'`, `(`, `)`, `*`, `:`, `&`, `|`, `<`, `>`, `\`), enforces max 100 chars, collapses whitespace.

- Updated `backend/src/controllers/company.controller.js`: calls `sanitiseSearchQuery()` before passing the query to the model. Rejects empty string after sanitisation.

- Installed `compression` npm package. Added `compression()` middleware to `app.js` before routes.

- Added `server.setTimeout(10000, ...)` in `server.js` using Node.js-native TCP timeout — writes raw HTTP 503 and destroys socket for any request exceeding 10 seconds. No external package required.

- Security grep audit fixes:
  - `backend/src/config/supabase.js`: replaced `throw new Error()` with `process.stderr.write + process.exit(1)` (matching server.js startup pattern).
  - `backend/src/middlewares/security.js`: replaced `callback(new Error(...))` in CORS origin check with `callback(forbidden(...))` using AppError factory. Imported `{ forbidden }` from `../errors/AppError`.

- Env var audit: added `NODE_ENV` and `PINO_LEVEL` to `backend/.env.example` — both were used in `process.env.*` but undocumented.

- Created `backend/docs/SECURITY.md`: 16-section comprehensive security posture document covering middleware order, JWT, Zod, rate limiting, Paystack HMAC, error handling contract, AppError usage, audit log event catalogue, RLS posture, secrets management, logging rules, search sanitisation, timeout, compression, credential leak response, and security test cases.

**Design decisions (approved via Claude.ai before execution):**
- `phone` added to tsvector alongside `business_name` and `description` — it is the primary lookup key for scammer identification.
- `connect-timeout` package rejected in favour of `server.setTimeout()` (Node.js-native, no external package, operates at TCP level).

**Human tasks required:**
- [HUMAN — SUPABASE] Run `003_search_vectors.sql` in Supabase SQL Editor on both trustbase-prod and trustbase-test.
- [HUMAN — SUPABASE] Run backfill query: `UPDATE reports SET search_vector = to_tsvector('pg_catalog.english', coalesce(business_name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(phone, ''));`

**Files created:** `backend/src/db/migrations/003_search_vectors.sql`, `backend/docs/SECURITY.md`

**Files modified:** `backend/src/models/company.model.js`, `backend/src/utils/validators.js`, `backend/src/controllers/company.controller.js`, `backend/src/app.js`, `backend/src/server.js`, `backend/src/config/supabase.js`, `backend/src/middlewares/security.js`, `backend/.env.example`, `backend/docs/FEATURE_LOG.md`

---

## Phone Search Fix — Status Filter Alignment
**Date:** 2026-05-27
**Branch:** feature/backend (PR #10)

**What was built:**
- Fixed `getReportsByPhone()` in `report.model.js`: changed `.eq('status', 'published')` to `.neq('status', REPORT_STATUS.REJECTED)`. Phone search now returns all non-rejected reports, consistent with the home feed query `getRecentReports()`.
- Added status flow documentation comment block in `constants/index.js` after `REPORT_STATUS`: documents the intended `pending → published → rejected` lifecycle and notes that a moderation queue is deferred.

**Root cause:** All reports had `status = 'pending'` (no mechanism to set `published`), so `.eq('status', 'published')` always returned empty results.

**Files modified:** `backend/src/models/report.model.js`, `backend/src/constants/index.js`

---

## Sprint 4 — Unit and Integration Test Suite
**Date:** 2026-05-27
**Branch:** feature/backend

**What was built:**

- Refactored `backend/src/utils/risk.js`: split monolithic `computeRiskScore` into four pure functions — `calculateBasePoints(scamType)`, `applyRecencyMultiplier(basePoints, createdAt)`, `determineLevel(score)`, and `computeRiskScore(reports)` (orchestrator). All four exported for direct unit testing.

- Restructured test directory: moved flat test files into `__tests__/unit/` and `__tests__/integration/` subdirectories per CLAUDE.md specification. Updated all `require()` paths.

- `__tests__/unit/risk.test.js`: 27 tests covering all four exported functions — base points for all 8 scam types + unknown, recency multiplier at boundary (29 vs 31 days), level thresholds (29/30/59/60), score cap, volume bonus, tag generation, and end-to-end computeRiskScore.

- `__tests__/unit/validators.test.js`: 35 tests covering all 5 Zod schemas (signup, login, report, verification, updateProfile) and `sanitiseSearchQuery` (special chars, truncation, whitespace, non-string input).

- `__tests__/unit/appError.test.js`: 11 tests covering AppError class (instanceof, properties) and all 7 factory functions (notFound, unauthorized, forbidden, conflict, badRequest, paymentRequired, tooManyRequests).

- `__tests__/integration/auth.test.js`: 13 tests — signup (201, 409 duplicate, 422 invalid phone, 422 short password, password_hash exclusion), login (200, 401 wrong password, 401 nonexistent phone), /users/me (401 no token, 401 bad token), /health (200). All test phones use `07000000` prefix with `afterAll` cleanup.

- `__tests__/integration/reports.test.js`: 9 tests — POST /api/reviews (201 valid, 422 invalid scam type, 422 short desc, 422 missing fields, 201 anonymous), GET /api/reviews (200 array, risk_level filter), GET /api/reviews/mine (401 no token, 200 authenticated). `07000000` prefix cleanup.

- `__tests__/integration/verification.test.js`: 5 tests — POST /api/verify/webhook (401 missing sig, 401 wrong HMAC, 200 valid HMAC), POST /api/verify/initiate (401 no token), GET /api/verify/status (401 no token). Uses `PAYSTACK_SECRET` env var for HMAC computation.

- Removed mock data from `frontend/src/pages/VerifiedProfile.jsx`: replaced hardcoded "Elite Fashion Store" / "elitfashion.ng" with real fetch from `GET /api/companies/verified`, loading spinner, error state, and empty state.

**Test totals:** 73 unit tests pass. Integration tests (27 tests) skip gracefully when env vars are absent — they run against trustbase-test when `.env.test` is configured.

**Coverage:** 100% on AppError.js, risk.js, validators.js. Full 70%+ coverage requires integration tests running with `.env.test`.

**Human tasks required:**
- [HUMAN — TERMINAL] Create `backend/.env.test` with TEST_* env vars pointing at trustbase-test (SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, JWT_SECRET, PAYSTACK_SECRET=test_paystack_secret_for_ci).
- [HUMAN — TERMINAL] Run `npm test` and `npm run test:coverage` to confirm 70%+.

**Files created:** `backend/src/__tests__/unit/appError.test.js`, `backend/src/__tests__/integration/reports.test.js`, `backend/src/__tests__/integration/verification.test.js`

**Files modified:** `backend/src/utils/risk.js`, `backend/src/__tests__/unit/risk.test.js` (moved + updated), `backend/src/__tests__/unit/validators.test.js` (moved + updated), `backend/src/__tests__/integration/auth.test.js` (moved + updated), `frontend/src/pages/VerifiedProfile.jsx`, `backend/docs/FEATURE_LOG.md`
