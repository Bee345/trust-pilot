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
