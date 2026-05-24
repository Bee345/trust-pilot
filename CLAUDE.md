# CLAUDE.md — TrustBase Master Operating File
# Read this ENTIRE file before executing anything in a session.
# This is the single source of truth. Nothing overrides it.
# Last updated: 2026-05-23

---

## DECISION PROTOCOL — READ THIS FIRST

Nothing gets built without approval. The workflow is:

  1. Claude Code reads this file and the current sprint definition.
  2. Claude Code produces a PROPOSAL: a plain-text list of exactly what it
     plans to do, files it will create or modify, decisions it will make.
  3. Human pastes that proposal into Claude.ai for review.
  4. Claude.ai reviews it against architecture rules and flags issues.
  5. Human says "approved" or requests changes.
  6. Only after approval does Claude Code execute.

Claude Code NEVER starts writing code without generating a proposal first.
Claude Code NEVER makes architecture decisions autonomously.
Claude Code NEVER decides folder structure, naming conventions, or patterns
without them being in this file or explicitly approved via Claude.ai.

When Claude Code needs a decision it cannot make alone, it must produce:
  DECISION NEEDED: [what the decision is]
  OPTION A: [description + tradeoffs]
  OPTION B: [description + tradeoffs]
  RECOMMENDATION: [which option and why]
  → Paste this to Claude.ai before proceeding.

---


## PROMPT COMPLIANCE — NON-NEGOTIABLE

READ EVERY LINE OF THIS FILE BEFORE ACTING.
READ EVERY LINE OF THE SPRINT DEFINITION BEFORE ACTING.
READ EVERY LINE OF THE THREE-LIST PROPOSAL BEFORE EXECUTING.

Do not skim. Do not skip sections because they seem familiar.
Do not assume you remember the rules from a previous session.
Every session starts fresh. Every line gets read fresh.

If you find yourself about to do something not explicitly
covered in this file or the sprint definition — STOP.
Generate a DECISION NEEDED block and paste it to Claude.ai.
Do not fill in gaps with assumptions.

Skipping any line of instruction is a protocol violation.
A protocol violation means the sprint output is invalid
and must be redone from the point of the skip.

---

## Project Identity

TrustBase — Nigerian scam-reporting and trust-verification mobile-first web app.
"Trustpilot for Nigeria." Users verify phone numbers and businesses before transacting.
Prototype stack: Node.js + React 19. Production successor: Laravel.
Build at enterprise level. Every pattern documented here transfers to Laravel.

Repository: https://github.com/Bee345/trust-pilot

---

## Six Active Roles (All Sessions)

ARCHITECT         — owns layer boundaries, naming, scalability, structure.
SECURITY ENGINEER — owns AppError, secrets, validation, audit logs, RLS.
BACKEND DEVELOPER — owns Node.js / Express v5 / CommonJS code quality.
FRONTEND DEVELOPER — owns React 19 / Vite / React Router v7 / WCAG compliance.
DEVOPS ENGINEER   — owns CI/CD, env hygiene, .gitignore, pipeline health.
QA ENGINEER       — owns test coverage, security test cases, integration hygiene.

When flagging something to the human, state which role is flagging it.

---

## Folder Structure (Canonical — Never Deviate)

```
trust pilot/                          (git root — main branch)
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .husky/
├── commitlint.config.js
├── sonar-project.properties
├── CLAUDE.md                         (this file — stays in root always)
│
├── frontend/                         (React 19 / Vite app)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/               (shared UI components)
│   │   │   └── ui/                   (atomic: Button, Input, Card, Spinner)
│   │   ├── context/                  (React Context providers)
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                    (custom hooks — all data fetching lives here)
│   │   │   ├── useAuth.js
│   │   │   ├── useReports.js
│   │   │   └── useVerification.js
│   │   ├── lib/
│   │   │   ├── api.js                (fetch wrapper, JWT injection, 401 redirect)
│   │   │   └── socket.js             (Socket.io client singleton)
│   │   ├── pages/                    (one file per route)
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx         (all route definitions)
│   │   │   └── ProtectedRoute.jsx    (auth guard)
│   │   └── utils/
│   │       ├── format.js             (date, naira, phone formatters)
│   │       └── validators.js         (client-side validation helpers)
│   ├── docs/                         (ALL frontend documentation lives here)
│   │   ├── ARCHITECTURE.md
│   │   ├── API_REFERENCE.md
│   │   ├── SECURITY.md
│   │   ├── SERVICES_DIRECTORY.md
│   │   └── FEATURE_LOG.md            (per-feature docs, append only)
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── backend/                          (Node.js / Express v5)
    ├── scripts/
    │   └── verify-schema.js
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── config/
    │   │   ├── supabase.js
    │   │   ├── twilio.js
    │   │   ├── paystack.js
    │   │   └── logger.js             (pino instance)
    │   ├── constants/
    │   │   └── index.js
    │   ├── db/
    │   │   └── migrations/
    │   │       ├── 001_initial_schema.sql
    │   │       ├── 002_audit_logs.sql
    │   │       └── 003_search_vectors.sql
    │   ├── errors/
    │   │   └── AppError.js
    │   ├── middlewares/
    │   │   ├── auth.js
    │   │   ├── validate.js
    │   │   ├── rateLimit.js
    │   │   └── security.js
    │   ├── models/                   (DB queries only — zero logic)
    │   │   ├── user.model.js
    │   │   ├── report.model.js
    │   │   ├── verification.model.js
    │   │   ├── company.model.js
    │   │   └── audit.model.js
    │   ├── services/                 (all business logic)
    │   │   ├── auth.service.js
    │   │   ├── report.service.js
    │   │   └── verification.service.js
    │   ├── controllers/              (thin — max 20 lines each)
    │   │   ├── auth.controller.js
    │   │   ├── user.controller.js
    │   │   ├── review.controller.js
    │   │   ├── verification.controller.js
    │   │   └── company.controller.js
    │   ├── routes/
    │   │   ├── index.js
    │   │   ├── authRoutes.js
    │   │   ├── userRoutes.js
    │   │   ├── reviewRoutes.js
    │   │   ├── companyRoutes.js
    │   │   └── verifyRoutes.js
    │   ├── sockets/
    │   │   └── index.js
    │   └── utils/
    │       ├── response.js
    │       ├── validators.js
    │       ├── risk.js
    │       └── otp.js
    ├── docs/                         (ALL backend documentation lives here)
    │   ├── ARCHITECTURE.md
    │   ├── API_REFERENCE.md
    │   ├── SECURITY.md
    │   ├── SERVICES_DIRECTORY.md
    │   └── FEATURE_LOG.md            (per-feature docs, append only)
    ├── .env.example
    ├── .eslintrc.js
    └── package.json
```

DOCUMENTATION RULE: Every .md file for this project lives inside docs/ in either
frontend/ or backend/. No markdown files at the repo root except CLAUDE.md.
Documentation files are NEVER added to .gitignore. They are versioned and tracked.

MIGRATION FROM OLD STRUCTURE (Sprint 0 one-time task for Claude Code):
  trustbase/           → frontend/
  trustbase/backend/   → backend/
  Update: package.json scripts, vite.config.js, CI YAML files, all import paths.
  Human must update: Vercel root to "frontend", Railway root to "backend".

---

## Tech Stack (Never Suggest Alternatives)

Frontend:  React 19, Vite, React Router v7, plain JSX, inline styles, lucide-react, clsx
Backend:   Node.js, Express v5, CommonJS (require/module.exports — never import/export)
Database:  Supabase (service role key), SQL migrations in backend/src/db/migrations/
Auth:      JWT (7-day expiry), bcrypt cost 12
Validation: Zod (backend at system boundaries only)
SMS:       Twilio (graceful null if missing)
Payments:  Paystack (HMAC-SHA512 webhook verification on raw body)
Sockets:   Socket.io (shares HTTP server on port 3000)
Logger:    Pino (JSON in production, pino-pretty in development)
Errors:    AppError factory functions only (backend), ErrorBoundary (frontend)
Monitoring: Sentry (@sentry/node backend, @sentry/react frontend)
Quality:   SonarCloud (quality gate: 70% coverage, no critical issues)

---

## Architecture — Backend (Strict Layering)

routes → middlewares → controllers (max 20 lines) → services (all logic) → models (all DB) → config

Utils: validators.js (Zod only), response.js, otp.js, risk.js
Errors: errors/AppError.js (factory functions only)
Constants: constants/index.js (all magic numbers and strings)
Logger: config/logger.js (pino instance)
Audit: models/audit.model.js → called from services, fire-and-forget

Never collapse layers. Never skip layers. Never write Supabase calls in controllers.
Never write business logic in models. Never import io directly in services.

Dependency Injection rule: services receive dependencies as parameters, not
hardcoded require() inside function bodies.

  RIGHT — injectable, testable:
    const createAuthService = ({ userModel, bcryptRounds, jwtSecret }) => ({
      signup: async (data) => { ... }
    });
    module.exports = createAuthService;

  WRONG — hardcoded, untestable:
    const userModel = require('../models/user.model');
    const signup = async (data) => { ... };

---

## Architecture — Frontend (Clean Code + Feature-Based)

Data fetching: always in custom hooks (hooks/). Never in page components directly.
Global state: React Context (context/). No external state library for MVP.
Components: presentational only. Receive props. No direct API calls.
Pages: compose hooks + components. No business logic inline.
API calls: always through lib/api.js. Never raw fetch() in components or hooks.
Socket: always through lib/socket.js singleton. Never new io() in components.

WCAG compliance required on all UI components:
  - All interactive elements have aria-label or visible label text.
  - Color contrast: minimum 4.5:1 for normal text, 3:1 for large text.
  - All forms have associated <label> elements.
  - Error messages associated with inputs via aria-describedby.
  - Focus visible on all interactive elements — no outline: none without replacement.
  - Loading states announced via aria-live="polite".

---

## ESLint Rules — Backend (backend/.eslintrc.js)

```js
module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 2021 },
  rules: {
    'no-console': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-var': 'error',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],
    'no-shadow': 'error',
    'consistent-return': 'error',
    'no-throw-literal': 'error',
    'no-new': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-implicit-coercion': 'error',
    'radix': 'error',
    'curly': ['error', 'all'],
    'max-lines-per-function': ['warn', { max: 30 }],
    'max-depth': ['error', 3],
    'no-else-return': 'error',
  },
};
```

---

## ESLint Rules — Frontend (frontend/eslint.config.js)

```js
import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      'no-console': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'react/prop-types': 'warn',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-shadow': 'error',
      'no-param-reassign': ['error', { props: false }],
      'max-depth': ['error', 3],
      'no-else-return': 'error',
    },
  },
];
```

---

## Code Quality Rules

Zero comments unless the WHY is genuinely non-obvious.
No docstrings. No console.log. No features beyond what was asked.
No error handling for impossible internal states.
CommonJS only on backend (require/module.exports). Never import/export.
Max 30 lines per function. Max 3 levels of nesting. Early returns.
Fail fast — validate and throw at the top of functions, happy path at the bottom.

Consistent naming:
  Functions are verbs: createUser(), findUserByPhone(), computeRiskScore()
  Files are nouns: user.model.js, auth.service.js, auth.controller.js

Repository pattern: models abstract database details. Services never write
raw Supabase calls — they call model functions. This means swapping databases
does not touch services.

---

## Security Architecture — Backend

Middleware order in app.js (never change this order):
  1. Sentry.init()                    — captures startup errors, before everything
  2. attachRequestId                  — UUID per request, in all logs and responses
  3. securityHeaders (helmet)         — 11+ HTTP headers, removes X-Powered-By
  4. cors(corsOptions)                — strict whitelist from FRONTEND_URL, never '*'
  5. preventParamPollution (hpp)      — blocks ?x=a&x=b attacks
  6. express.raw({ type: 'application/json' }) — ONLY for /api/verify/webhook
  7. express.json({ limit: '10kb' })  — body size limit
  8. pino request logger              — logger.child({ requestId }) attached to req
  9. rate limiters                    — authRateLimit, searchRateLimit, reportRateLimit
  10. validate(schema)                — Zod at all input boundaries
  11. verifyToken / optionalAuth      — JWT per route
  12. Paystack HMAC-SHA512            — in verification.service.js on raw body
  13. Global error handler            — LAST, never leaks stack in production

AppError usage (no exceptions):
  RIGHT: throw notFound('User')
  WRONG: throw Object.assign(new Error('Not found'), { statusCode: 404 })
  WRONG: const err = new Error('Conflict'); err.statusCode = 409;

Available factories: notFound, unauthorized, forbidden, conflict, badRequest, paymentRequired

Constants usage (no magic values):
  RIGHT: bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
  WRONG: bcrypt.hash(password, 12)

---

## Error Handling Rules — Backend

Global error handler strips stack traces when NODE_ENV=production.
No service or controller catches errors to re-throw with new Error().
AppError.isOperational = true — known, expected error. Client gets the message.
AppError.isOperational = false (or plain Error) — unexpected. Goes to Sentry.
  Client gets only: { success: false, message: 'Something went wrong', requestId }
Sentry receives all non-operational errors automatically via the error handler.
Every error response includes the requestId. Never includes stack, query details,
env var names, or internal system information.

---

## Global Error Handling — Frontend

Sentry.ErrorBoundary from @sentry/react wraps the entire App in main.jsx.
Every page has its own local error state — never lets a single page crash the app.

Standard error state pattern (required on every page):
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // On catch: setError(err.message || 'Something went wrong')
  // In render: if (error) return <ErrorMessage message={error} />

api.js handles errors by HTTP status:
  401 → clear trustbase_token from localStorage → redirect to /login
  429 → show 'Too many requests, please wait'
  500 → show 'Something went wrong' (never show server error text)
  Network failure → show 'Check your connection and try again'

---

## Logging Rules

Logger: pino. Attach logger.child({ requestId: req.requestId }) to every req.
Every log entry must include: requestId, timestamp, level, message.
Never log: password, password_hash, JWT token, service_role key, PAYSTACK_SECRET.
In production: JSON output (fast, structured, machine-readable).
In development: pino-pretty (human-readable, coloured).

Log levels:
  info  — normal operations (request received, response sent)
  warn  — degraded state (Twilio missing, optional service unavailable)
  error — AppError.isOperational = false (unexpected errors)
  fatal — startup failures (missing required env vars)

---

## Audit Logging

All significant actions write to audit_logs table via createAuditLog() in
models/audit.model.js. Always fire-and-forget. Never block the response.

Required events:
  USER_SIGNUP, USER_LOGIN, USER_LOGIN_FAILED (include ip, user_agent)
  REPORT_SUBMITTED (include scam_type, risk_level)
  VERIFICATION_INITIATED, VERIFICATION_APPROVED, VERIFICATION_REJECTED
  UPVOTE_ADDED, USER_PROFILE_UPDATED, RATE_LIMIT_HIT (include ip)

---

## Nigerian Context — Never Change

Currency: Naira (₦). Never dollars or euros.
Phone regex: /^(0[7-9][0-1]\d{8})$/
Twilio E.164 conversion: '+234' + phone.substring(1)

Scam types (exact DB enum strings — never invent new ones):
  'Online Marketplace Scam'
  'Fake Product / Non-delivery'
  'POS Fraud'
  'Investment / Ponzi'
  'Romantic Scam'
  'Loan / Finance Fraud'
  'Job / Recruitment Scam'
  'Other'

Paystack kobo: ₦2,000 = 200000 kobo | ₦5,000 = 500000 kobo
Primary cities: Lagos, Abuja, Port Harcourt, Kano, Ibadan

---

## Database Migrations

All schema changes go in numbered SQL files at backend/src/db/migrations/.
001_initial_schema.sql — users, reports, report_upvotes, verifications,
                         indexes, increment_trust_points function
002_audit_logs.sql     — audit_logs table with indexes
003_search_vectors.sql — tsvector column and GIN index on reports

[HUMAN ACTION REQUIRED for every migration]:
  Open the SQL file → copy its contents → paste into Supabase SQL Editor
  for BOTH trustbase-prod AND trustbase-test → Run → confirm Success.
  Enable RLS on every new table after creation.
  Never run the migration until the SQL file exists on disk.

---

## Environment Variables

Backend required (app crashes at startup if missing):
  PORT, SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, JWT_SECRET

Backend optional (features degrade gracefully if missing):
  TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE
  PAYSTACK_SECRET
  SOCKET_PORT (default 3000, shares HTTP server)
  SENTRY_DSN
  NODE_ENV

Frontend (.env in frontend/):
  VITE_API_URL      — backend URL (http://localhost:3000 in dev)
  VITE_SENTRY_DSN   — frontend Sentry DSN

.env files are NEVER committed. .env.example is the documented contract.
Every new env var must be added to .env.example immediately.

---

## API Routes

POST   /api/auth/signup             (public + authRateLimit + validate)
POST   /api/auth/login              (public + authRateLimit + validate)
GET    /api/users/me                (verifyToken)
PUT    /api/users/me                (verifyToken + validate)
POST   /api/reviews                 (optionalAuth + reportRateLimit + validate)
GET    /api/reviews                 (public + searchRateLimit)
GET    /api/reviews/phone/:phone    (public + searchRateLimit)
GET    /api/reviews/mine            (verifyToken + searchRateLimit)
POST   /api/reviews/:id/upvote      (verifyToken)
GET    /api/companies/search        (public + searchRateLimit)
GET    /api/companies/verified      (public)
GET    /api/companies/:id           (public)
POST   /api/verify/initiate         (verifyToken + validate)
POST   /api/verify/webhook          (raw body — no auth — Paystack only)
GET    /api/verify/status           (verifyToken)
GET    /health                      (public — status, version, env, requestId)

---

## Testing Rules

Unit tests: Zod schemas, pure functions (risk.js), AppError factories.
Integration tests: Supertest against real trustbase-test Supabase project.
NEVER mock the database in integration tests.
Test files: backend/src/__tests__/unit/ and backend/src/__tests__/integration/
Coverage target: 70%+ (SonarCloud quality gate blocks merge below this).

Security test cases required every sprint:
  - Unauthenticated access to protected routes returns 401 (not 403, not 500).
  - Wrong HMAC on Paystack webhook returns 401.
  - Invalid Zod input returns 422 with field-level error messages.
  - Duplicate phone signup returns 409.
  - Wrong password login returns 401 (never 404 — do not reveal account existence).
  - Rate limit exceeded returns 429.

---

## Sprint Workflow — Three Lists Per Sprint

Each sprint is 3 days. Sprints run in order:
  Sprint 0 — Folder Migration + Audit + Infrastructure
  Sprint 1 — Database Verification + Backend Completion
  Sprint 2 — Frontend Completion
  Sprint 3 — Security Hardening + Full-Text Search
  Sprint 4 — Tests
  Sprint 5 — DevOps Pipeline Completion
  Sprint 6 — Documentation Sprint
  Sprint 7 — Security Audit Sprint

Every sprint is presented as exactly three lists BEFORE execution:

  LIST 1 — CLAUDE CODE TASKS
    What Claude Code will write, create, modify, run, and commit.
    Specific. File names included. No vague entries.

  LIST 2 — HUMAN TASKS
    What the developer must do in browser, terminal, or third-party dashboard.
    Cannot be automated. Tagged:
    [HUMAN — BROWSER] | [HUMAN — TERMINAL] | [HUMAN — DASHBOARD]

  LIST 3 — CLAUDE.AI DISCUSSION ITEMS
    Decisions or reviews that happen in Claude.ai before or during the sprint.
    Human pastes these to Claude.ai, gets guidance, returns with conclusion.
    Tagged: [DISCUSS — ARCHITECTURE] | [DISCUSS — SECURITY] | [DISCUSS — APPROACH]

Claude Code generates all three lists as a PROPOSAL. Human pastes to Claude.ai
for review. Human approves. Then Claude Code executes. This is non-negotiable.

At the end of each sprint: update FEATURE_LOG.md and PROGRESS_LOG.md in docs/.
Open a PR. Wait for merge before starting the next sprint.

---

## PR Rule — Every Sprint, Every Task

Every completed sprint task gets its own commit and PR on the feature branch.
No bundling multiple sprints into one PR. No direct commits to main. Ever.

PR format:
  Title: "sprint-N: <what was built>"
  Body must include:
    - What was built (specific, not generic)
    - Files created or modified
    - Human tasks required BEFORE merge
    - Human tasks required AFTER merge
    - Test command to verify the change

After every PR is merged:
  git fetch origin
  git rebase origin/main
Then continue on the feature branch for the next sprint.

Create the PR using GitHub CLI:
  git add <specific files — never git add .>
  git commit -m "<type>: <description>"
  git push origin feature/backend   (or feature/frontend)
  gh pr create --title "sprint-N: <title>" --body "<description>"

Then wait for CI to pass. Never merge a PR with failing CI.

---

## Commit Cadence

Every 2 days minimum — regardless of work state. Partial work gets wip: prefix.
Never git add . — always stage specific files by name.
Never commit directly to main.

Commit format (enforced by commitlint + Husky pre-commit hook):
  feat:     new functionality
  fix:      bug fix
  chore:    config, tooling, non-code change
  docs:     documentation only
  test:     test additions or changes
  ci:       CI/CD pipeline changes
  refactor: restructure without behaviour change
  security: security-specific changes
  wip:      work in progress (squashed before merge to main)

---

## Worktree Paths and Branch Check

Backend:  C:\Users\HP\Documents\GitHub\trustbase-backend\  (branch: feature/backend)
Frontend: C:\Users\HP\Documents\GitHub\trustbase-frontend\ (branch: feature/frontend)
Main:     C:\Users\HP\Documents\GitHub\trust pilot\        (branch: main)

Never commit backend code from the frontend worktree. Never commit frontend code
from the backend worktree.

Branch check is mandatory at the start of every session:
  git status
  git branch
  git log --oneline -5
If not on the expected branch, stop and report before doing anything else.

If main gets new commits (from merged PRs), pull into the worktree:
  git fetch origin && git rebase origin/main

Keep each PR focused on ONE sprint task — never bundle multiple tasks.

---

## Documentation Protocol

After completing any feature, before committing, in this order:
  1. Append to docs/FEATURE_LOG.md: date, feature name, files changed, what it does.
  2. Update docs/API_REFERENCE.md if a new endpoint was added.
  3. Update docs/ARCHITECTURE.md if the data flow changed.
  4. Update .env.example if a new env var was added.
  5. Update docs/SERVICES_DIRECTORY.md if a new third-party service was wired.

FEATURE_LOG.md is append-only. Never delete entries. This is the feature-by-feature
history of the project.

General project overview (what TrustBase is, how it works end to end) lives in
docs/ARCHITECTURE.md in both frontend/ and backend/. Both sides are independently
readable but may cross-reference each other.

---

## Phase Implementation Order (reference)

Phase 0:  Fix bugs (ESM/CJS mismatch + missing route files) — DONE
Phase 1:  Config layer (supabase.js, twilio.js, paystack.js, logger.js) — DONE
Phase 2:  Database schema in Supabase SQL Editor — NEEDS CONFIRMATION
Phase 3:  Utils layer (validators, response helpers, OTP, risk scoring) — DONE
Phase 4:  Middleware layer (auth, validate, rateLimit, security) — DONE
Phase 5:  Model layer (all DB queries) — DONE
Phase 6:  Service layer (all business logic) — DONE
Phase 7:  Controller layer — DONE
Phase 8:  Route files — DONE
Phase 9:  Socket.io — DONE
Phase 10: Frontend integration (connect React pages to real API) — IN PROGRESS
Phase 11: Tests
Phase 12: Pipeline (Husky, ESLint, SonarCloud, GitHub Actions, Sentry, Railway, Vercel)

---

## What Claude Code vs Claude.ai Handles

CLAUDE CODE handles:
  Writing code, running code, auditing files, creating migrations, running tests,
  updating documentation, committing, pushing, opening PRs, generating proposals.

CLAUDE.AI handles:
  Reviewing proposals before execution, architectural decisions, security design,
  debugging reasoning, sprint scope planning, PDF generation, explaining why
  something is designed a certain way, deciding on approach before work begins.

Rule: Claude Code generates the proposal. Claude.ai approves it.
Rule: Claude Code never acts on architecture decisions autonomously.
Rule: Claude Code generates the three-list sprint proposal, human pastes it
      to Claude.ai, human returns with approval. Only then does execution begin.
Rule: Any decision not covered by this file goes to Claude.ai before proceeding.

---

## Production Requirements

Every feature is built production-ready from day one:
  - All env vars validated at startup
  - All errors handled: no unhandled promise rejections, no uncaught exceptions
  - All inputs sanitised before processing
  - All outputs sanitised before sending
  - Rate limits applied before any endpoint goes live
  - Audit log written for every state-changing action
  - Sentry notified on every non-operational error
  - WCAG compliance checked on every frontend component before PR
  - No TODO comments left in committed code
  - ESLint passes with zero errors before any commit

---

## Things That Never Happen

No raw Error objects — AppError factories only.
No console.log — pino logger only (backend), silence (frontend).
No password_hash in any API response.
No stack traces in production responses.
No magic numbers or strings outside constants/index.js.
No import/export in backend files — CommonJS only.
No business logic in models.
No direct Supabase calls in controllers.
No direct io import in services.
No .env committed to git.
No features beyond sprint scope.
No mocking the database in integration tests.
No anon Supabase key in backend.
No service_role key in frontend.
No documentation files in .gitignore.
No sprint execution without three-list proposal reviewed in Claude.ai.
No architectural decision made by Claude Code autonomously.
No PR merged without CI passing.
No commit directly to main.
No WCAG violation in any frontend component shipped in a PR.
No unhandled promise rejection in backend.
No TODO comment left in committed code.
No markdown files at the repo root except CLAUDE.md.
No work started in a session without running the branch check first.
