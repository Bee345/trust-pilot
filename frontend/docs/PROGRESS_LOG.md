# TrustBase — Development Progress Log
# Update this file after completing each phase or significant task.
# Use Haiku 4.5 to write these updates (it's documentation, not coding).
# Format: ## [YYYY-MM-DD] — What Was Done

---

## [2026-05-07] — Initial Codebase Audit + Project Documentation Setup

### What Was Audited
Complete read-through of all frontend and backend source files.

**Frontend status (trustbase/src/) — UI COMPLETE, not wired to backend:**
- 15 pages fully built with mock/hardcoded data:
  Signup, Login, Home, SearchResults, ReportsList, ReportScam,
  VerifiedProfile, GetVerified, VerificationStatus, MyReports,
  Profile, More, Notifications, PrivacySecurity, PrivacySettings
- BottomNav component with 5 tabs (Home, Reports, Report CTA, Verified, More)
- React Router v7 with basic auth guard (isAuthenticated useState — mock only)
- Brand color: #E53935 (red), dark color: #1A2B3C
- Currency: Nigerian Naira (₦) throughout
- No API calls anywhere — all data is hardcoded arrays

**Backend status (trustbase/backend/src/) — SCAFFOLD ONLY:**
- app.js: Express setup (BROKEN — uses import/export in a CommonJS project)
- server.js: Server start (BROKEN — same ESM/CJS mismatch)
- routes/index.js: 4 route groups defined (references files that don't exist)
- All directories empty: controllers/, models/, middlewares/, services/,
  sockets/, utils/, config/

### Bugs Found and Fixed
1. ESM/CJS MISMATCH (CRITICAL): app.js and server.js use ES Module syntax
   in a CommonJS project — converted to require()/module.exports.
2. MISSING ROUTE FILES: created in Phase 8 below.

### Files Created Today (planning/process docs)
- CLAUDE.md, IMPLEMENTATION_PLAN.md, PIPELINE.md, TASK_MODEL_MAP.txt,
  PROCEDURES.md, BACKEND_RULES.md, LEARN.md, PROGRESS_LOG.md
- .github/workflows/ci.yml, deploy.yml (CI/CD scaffolding — secrets NOT YET set)
- commitlint.config.js, sonar-project.properties

---

## [2026-05-07] — Phase 1 Complete: Config Layer

### Files Created
- backend/src/config/supabase.js — Supabase client (createClient with service key)
- backend/src/config/twilio.js — Twilio client with graceful null-return if env missing
- backend/src/config/paystack.js — Axios instance with Authorization header

### Verified
- npm run dev starts without errors
- GET /health returns { status: 'ok' }

### Next Steps
→ Phase 2: Database schema (user-action required in Supabase Dashboard)

---

## [2026-05-08] — Phase 2: Database Schema — STATUS UNKNOWN (User Action Required)

### What Should Be Done
Run the SQL in IMPLEMENTATION_PLAN.md Phase 2 inside the Supabase SQL Editor.

### Tables Required
- users (id, name, phone, password_hash, is_verified, trust_points, created_at)
- reports (id, reporter_id, phone, business_name, scam_type, description,
           amount_lost, anonymous, status, risk_level, created_at)
- report_upvotes (report_id, user_id — composite PK)
- verifications (id, user_id, type, status, paystack_ref, amount_paid, created_at)
- Function: increment_trust_points(user_id, points)

### Verification Needed From User
- Confirm SQL has been executed in Supabase Dashboard
- Confirm RLS enabled on all 4 tables
- Confirm `increment_trust_points` function exists

### Risk If Skipped
The backend will start fine but every model query (signup, login, report submission,
verification) will return a "relation does not exist" error from Supabase. The
frontend will appear to work locally but every action will fail.

---

## [2026-05-09] — Phase 3 Complete: Utils Layer

### Files Created
- backend/src/utils/response.js — success() and error() HTTP helpers
- backend/src/utils/validators.js — Zod schemas (signup, login, report, verification)
  with Nigerian phone regex /^(0[7-9][0-1]\d{8})$/
- backend/src/utils/risk.js — computeRiskScore() pure function
- backend/src/utils/otp.js — generateOTP() and Twilio-backed sendOTP()

### Outstanding
- Unit tests for validators and risk score (Phase 11)

---

## [2026-05-09] — Phase 4 Complete: Middleware Layer

### Files Created
- backend/src/middlewares/auth.js — verifyToken + optionalAuth using jsonwebtoken
- backend/src/middlewares/validate.js — Zod schema validation factory
- backend/src/middlewares/rateLimit.js — auth (5/15min), search (60/min), report (10/hr)
- backend/src/middlewares/security.js — helmet, strict CORS, HPP, requestId
  (added beyond the original Phase 4 spec — see CLAUDE.md "Newly Added Files")

---

## [2026-05-10] — Phase 5 Complete: Model Layer

### Files Created
- backend/src/models/user.model.js
- backend/src/models/report.model.js
- backend/src/models/verification.model.js
- backend/src/models/company.model.js

All queries strip password_hash. PGRST116 (not found) returns null instead of throwing.

---

## [2026-05-11] — Phase 6 Complete: Service Layer

### Files Created
- backend/src/services/auth.service.js — signup, login, generateToken
- backend/src/services/report.service.js — submitReport, searchEntity
- backend/src/services/verification.service.js — initiateVerification,
  handlePaystackWebhook (HMAC-SHA512 on raw body), approveVerification

### Architecture Additions
- backend/src/errors/AppError.js — custom error class + factory functions
  (notFound, unauthorized, forbidden, conflict, badRequest, paymentRequired)
- backend/src/constants/index.js — magic numbers/strings centralized

---

## [2026-05-12] — Phases 7 + 8 Complete: Controllers + Routes

### Files Created
Controllers (backend/src/controllers/):
- auth.controller.js, user.controller.js, review.controller.js,
  verification.controller.js, company.controller.js (added beyond spec)

Routes (backend/src/routes/):
- authRoutes.js, userRoutes.js, reviewRoutes.js, companyRoutes.js, verifyRoutes.js
- index.js wires them all to /api/auth, /api/users, /api/reviews,
  /api/companies, /api/verify

### Outstanding
- No automated tests for any endpoint yet (Phase 11)
- Manual smoke tests not yet run (waiting on Phase 2 DB schema confirmation)

---

## [2026-05-13] — Phase 9 Complete: Socket.io

### Files Created
- backend/src/sockets/index.js — initSockets, emitNewReport, emitVerificationUpdate
- Wired into server.js — Socket.io shares the HTTP server (port 3000)

### Outstanding
- Frontend Socket.io client not yet wired (Phase 10i)

---

## [2026-05-18] — Phase 10 IN PROGRESS: Frontend Integration

### Done So Far
- trustbase/src/lib/api.js — fetch wrapper with JWT injection + 401 redirect

### In Progress (UNCOMMITTED CHANGES on main branch as of 2026-05-18)
- trustbase/src/pages/Home.jsx — partially wired to GET /api/reviews (uses useEffect,
  reads user from localStorage for initials)
- trustbase/src/pages/SearchResults.jsx — partially wired to GET /api/companies/search

### Outstanding (Phase 10 sub-tasks not yet started)
- Login.jsx — replace setTimeout mock with real POST /api/auth/login
- Signup.jsx — replace setTimeout mock with real POST /api/auth/signup
- App.jsx — useEffect to restore auth from localStorage on mount
- ReportScam.jsx — real POST /api/reviews
- ReportsList.jsx — real GET /api/reviews with pagination
- GetVerified.jsx — real POST /api/verify/initiate + Paystack redirect
- VerificationStatus.jsx — real GET /api/verify/status
- MyReports.jsx — real GET /api/users/me/reports
- Profile.jsx — real GET/PUT /api/users/me
- Notifications.jsx — Socket.io client + real notification feed
- Protected route guard component

### Workflow Notes
- Current uncommitted edits are on main branch, NOT in feature/frontend worktree
  — this violates the worktree rule in CLAUDE.md.
- These changes need to be moved to feature/frontend before continuing.

### Next Steps
→ Move uncommitted changes to feature/frontend worktree
→ Continue Phase 10 sub-tasks (Login.jsx + Signup.jsx + App.jsx are highest priority)

---

## [2026-05-22] — Sprint 0: Full Codebase Audit + Infrastructure Hardening

### Audit Summary
Full read of all 50+ backend and frontend files. 24 issues found across 4 priority levels.

### P1 — Security / Correctness Fixes (9 items)
- **server.js**: Removed console.log. Added startup crash guard — exits with code 1 if
  JWT_SECRET, SUPABASE_URL, or SUPABASE_KEY are missing.
- **config/supabase.js**: Throws immediately on load if SUPABASE_URL/SUPABASE_KEY missing.
- **services/auth.service.js**: Replaced hardcoded `12` and `'7d'` with `BCRYPT_SALT_ROUNDS`
  and `JWT_EXPIRY` imported from constants.
- **services/verification.service.js**: Replaced local `PRICES` object with
  `VERIFICATION_PRICES_KOBO` constant. Fixed Paystack webhook to use `setImmediate` — the
  controller now sends 200 to Paystack instantly, preventing timeout retries. Added
  `emitVerificationUpdate()` call on status change. Added `getVerificationStatus()` function
  to keep getStatus out of the controller layer.
- **services/report.service.js**: Replaced local `HIGH_RISK_TYPES` Set with
  `HIGH_RISK_SCAM_TYPES` and `MEDIUM_RISK_SCAM_TYPES` from constants. Added a `'low'` risk
  branch (the `'Other'` scam type now correctly resolves to low, not medium). Added
  `emitNewReport()` call after successful report creation. Added `listRecentReports()` and
  `upvoteReportById()` wrapper functions to keep models out of controllers.
- **middlewares/rateLimit.js**: All three rate limiters now use `RATE_LIMITS` constant values
  instead of hardcoded numbers.
- **utils/otp.js**: Removed console.warn — Twilio missing is now silent (graceful degradation).
- **.gitignore**: Added `.env`, `.env.*`, `*.env`, `dist/`, `build/`, `coverage/`, `.vercel/`.
- **backend/.env.example**: Added `ALLOWED_ORIGINS`, `FRONTEND_URL`, `SENTRY_DSN`.

### P2 — Architecture Violations Fixed (6 items)
- **controllers/review.controller.js**: Removed direct model imports. All calls now go through
  `reportService`. Added `getMyReports` handler.
- **controllers/verification.controller.js**: Removed direct model import in `getStatus` —
  now calls `verificationService.getVerificationStatus()`. Webhook handler made synchronous
  to match new fire-and-forget pattern.
- **controllers/user.controller.js**: Removed direct model imports. Now calls `userService`.
  `updateProfile` uses `req.validatedBody` instead of raw `req.body`.
- **services/user.service.js** (NEW): Created service layer for user operations. Whitelist
  of allowed update fields moved here from controller.
- **routes/userRoutes.js**: Added `validate(updateProfileSchema)` to PUT /me.
- **utils/validators.js**: Added `.strip()` to all schemas to reject unknown fields. Added
  `updateProfileSchema` (name-only update, strips phone — phone changes require re-verification).

### P3 — Missing Infrastructure Added (5 items)
- **backend/src/db/migrations/002_audit_logs.sql** (NEW): Creates `audit_logs` table with
  indexes on user_id, action, created_at. Includes RLS policy.
  [HUMAN ACTION REQUIRED]: Run in Supabase SQL Editor on BOTH trustbase-prod and trustbase-test.
- **backend/src/models/audit.model.js** (NEW): `createAuditLog()` — fire-and-forget, writes
  errors to stderr without blocking the response.
- **backend/src/config/logger.js** (NEW): Pino logger. JSON in production, pino-pretty in dev.
  Redacts password, token, authorization fields automatically.
- **backend/src/app.js**: Global error handler now logs all errors via pino (warn for
  operational, error for unexpected). `/health` endpoint enhanced with `version` and
  `environment` fields.
- **backend/src/sockets/index.js**: CORS fallback changed from `'*'` to
  `'http://localhost:5173'` — never allows all origins.

### P4 — New Endpoint: GET /api/reviews/mine
- **models/report.model.js**: Added `getReportsByUser(userId)`.
- **services/report.service.js**: Added `getMyReports(userId)`.
- **controllers/review.controller.js**: Added `getMyReports` handler.
- **routes/reviewRoutes.js**: Added `GET /mine` — protected by `verifyToken`,
  rate-limited by `searchRateLimit`.

### Other Files Created
- **backend/scripts/verify-schema.js**: One-off script to confirm all required Supabase
  tables exist. Run with `node scripts/verify-schema.js` after DB schema migrations.

### npm packages installed
- pino, pino-pretty (added to dependencies in backend/package.json)

### Human Actions Still Required
1. [HUMAN] Run `002_audit_logs.sql` in Supabase SQL Editor on BOTH projects.
2. [HUMAN] Enable RLS on audit_logs table in BOTH projects.
3. [HUMAN] Confirm `npm run dev` starts without errors.
4. [HUMAN] Hit GET /health — confirm response now includes `version` and `environment`.
5. [HUMAN] Run `node scripts/verify-schema.js` to confirm DB schema is deployed.

---

## TODO: Future Phase Entries (Update When Completed)

### Phase 11 — Tests
- backend/src/__tests__/auth.test.js — Supertest integration tests
- backend/src/__tests__/report.test.js — Supertest integration tests
- backend/src/__tests__/risk.unit.test.js — pure function tests
- backend/src/__tests__/validators.unit.test.js — Zod schema tests
- Target coverage: > 70% (SonarCloud quality gate threshold)

### Phase 12 — Pipeline (Cloud Connection)
NONE of the following has been done yet — see PIPELINE.md for the full walkthrough:
- ESLint + Prettier wiring beyond the install (rule files, VS Code settings)
- Husky pre-commit + commit-msg hooks installed and tested
- SonarCloud account created + SONAR_TOKEN added to GitHub Secrets
- Sentry account created + DSNs wired into app.js and main.jsx
- Test Supabase project created (separate from production)
- Vercel account + project linked + VERCEL_* secrets added
- Railway account + project linked + RAILWAY_TOKEN added
- All other GitHub Secrets (TEST_*, VITE_*, FRONTEND_URL) added
- Branch protection rules on main
- First successful production deploy
- Health check passes against live backend
