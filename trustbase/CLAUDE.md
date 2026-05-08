# TrustBase — CLAUDE.md
# Rules, context and architecture for every Claude session on this project.
# Read this file first before doing anything in this codebase.

## What This Project Is
TrustBase is a Nigerian scam-reporting and trust-verification mobile-first web app.
Users search phone numbers and businesses for fraud reports, submit scam reports,
and purchase identity or business verification badges. Think "Trustpilot for Nigeria."
Target audience: everyday Nigerians transacting online ("Verify before you pay").

---

## Tech Stack

### Frontend — trustbase/src/
- React 19, Vite 8, React Router v7
- lucide-react (icons), clsx, tailwind-merge
- Plain JSX — no TypeScript on frontend
- All current styling is inline styles (no CSS modules or Tailwind classes yet)
- State management: React useState only (no Redux/Zustand yet)

### Backend — trustbase/backend/src/
- Node.js, Express v5, CommonJS modules ("type": "commonjs" in package.json)
- Supabase (primary DB via @supabase/supabase-js + service role key)
- pg (direct PostgreSQL fallback for complex queries)
- JWT (jsonwebtoken) — 7-day expiry, signed with JWT_SECRET
- bcrypt — password hashing, cost factor 12
- Zod — all input validation at boundary layer
- Twilio — SMS OTP for phone verification
- Paystack — payments for verification badges (₦2,000 / ₦5,000)
- Socket.io — real-time notifications on port SOCKET_PORT
- TypeScript tsconfig.json exists but code is written in JavaScript

---

## Bug Status

### BUG 1: ESM/CJS Mismatch — ✅ FIXED (2026-05-07)
app.js and server.js converted to CommonJS (require/module.exports).

### BUG 2: Missing Route Files — ✅ FIXED (2026-05-07)
All route files created in Phase 8. routes/index.js now requires them directly.
loadRoute() stub wrapper removed — no longer needed.

---

## Architecture Rules — Never Violate These

### Layered Architecture (strict order)
```
HTTP Request
    ↓
routes/         ← wire endpoints to controllers + middlewares ONLY
    ↓
middlewares/    ← auth, validation, rate limiting
    ↓
controllers/    ← read req, call service, send res. NO business logic here.
    ↓
services/       ← ALL business logic lives here. Call models. Call external APIs.
    ↓
models/         ← ALL database queries (Supabase calls). No business logic.
    ↓
config/         ← initialized external clients (Supabase, Twilio, Paystack)
    ↓
Database (Supabase / PostgreSQL)
```

### Utils Layer — src/utils/
- validators.js — Zod schemas only
- response.js — success() and error() HTTP helpers
- otp.js — OTP generation and Twilio SMS sending
- risk.js — computeRiskScore() pure function

### Sockets Layer — src/sockets/
- Socket.io server initialization and event definitions

---

## Code Rules

- Write ZERO comments unless the WHY is genuinely non-obvious
- No docstrings. No multi-line comment blocks
- Add no features beyond what is explicitly requested
- No error handling for impossible internal scenarios
- No console.log anywhere (use pino logger when added)
- Never commit .env files — .env.example is the source of truth
- Validate only at system boundaries (user input, Paystack webhooks, Twilio webhooks)
- Never expose internal error messages or stack traces in API responses
- Never return password_hash in any API response — strip it at the model layer
- Use CommonJS (require/module.exports) everywhere in backend. Never use import/export.

---

## Nigerian Context — Critical, Never Change

- Currency: Naira (₦), not dollars or euros
- Phone format: 080XXXXXXXX, 081XXXXXXXX, 070XXXXXXXX, 090XXXXXXXX, 091XXXXXXXX
- Regex: /^(0[7-9][0-1]\d{8})$/
- Scam types (exact strings, used in DB CHECK constraint):
    'Online Marketplace Scam'
    'Fake Product / Non-delivery'
    'POS Fraud'
    'Investment / Ponzi'
    'Romantic Scam'
    'Loan / Finance Fraud'
    'Job / Recruitment Scam'
    'Other'
- Verification pricing:
    Individual: ₦2,000 = 200000 kobo (Paystack uses kobo)
    Business: ₦5,000 = 500000 kobo
- Primary Nigerian cities referenced: Lagos, Abuja, Port Harcourt, Kano, Ibadan

---

## Environment Variables (from backend/.env.example)

Required (app crashes without these):
  PORT              — Express server port (default 3000)
  SUPABASE_URL      — Supabase project URL
  SUPABASE_KEY      — Service role key (bypasses RLS)
  DATABASE_URL      — Direct PostgreSQL connection string
  JWT_SECRET        — Must be long random string (min 32 chars)

Optional (features degrade gracefully if missing):
  TWILIO_SID        — OTP SMS (disabled if missing)
  TWILIO_TOKEN      — OTP SMS
  TWILIO_PHONE      — Sender phone number in E.164 format
  PAYSTACK_SECRET   — Verification payments (disabled if missing)
  SOCKET_PORT       — Real-time notifications (default 3001)
  SENTRY_DSN        — Backend error tracking

Frontend env (trustbase/.env):
  VITE_API_URL      — Backend base URL (http://localhost:3000 for dev)
  VITE_SENTRY_DSN   — Frontend error tracking

---

## API Route Structure

```
POST   /api/auth/signup
POST   /api/auth/login

GET    /api/users/me            (protected — requires JWT)
PUT    /api/users/me            (protected)

POST   /api/reviews             (optional auth — anonymous allowed)
GET    /api/reviews             (public — recent reports, paginated)
GET    /api/reviews/phone/:phone (public — search by phone number)
POST   /api/reviews/:id/upvote  (protected)

GET    /api/companies/search    (public — ?q=query)
GET    /api/companies/verified  (public — list all verified)
GET    /api/companies/:id       (public)

POST   /api/verify/initiate     (protected — start verification payment)
POST   /api/verify/webhook      (no auth — Paystack webhook)
GET    /api/verify/status       (protected — check verification status)
```

Health check (no auth): GET /health

---

## Frontend Auth State

Current state: mock (isAuthenticated useState, no real API calls).

Real implementation target:
1. POST /api/auth/signup or /api/auth/login → receive JWT
2. Store JWT in localStorage under key 'trustbase_token'
3. On app mount (useEffect in App.jsx): read token, validate, restore isAuthenticated
4. Create src/lib/api.js: axios/fetch wrapper that attaches Authorization: Bearer <token>
5. Handle 401 responses: clear token + redirect to /login

---

## Testing Rules

- NEVER mock the database in integration tests
- Unit tests: Zod schemas and pure utility functions ONLY
- Integration tests: must hit a real Supabase test project (not production)
- E2E tests: Playwright, run against staging environment only
- Test file location: backend/src/__tests__/ (mirrors src structure)
- Test command: npm test (Jest)

---

## Git Workflow

Branch naming:
  feature/description   — new functionality
  fix/description       — bug fixes
  chore/description     — setup, config, tooling
  docs/description      — documentation changes
  test/description      — test additions only

Commit format (enforced by commitlint + Husky):
  feat: add JWT authentication middleware
  fix: resolve ESM/CJS import error in app.js
  chore: configure Husky pre-commit hooks
  test: add signup integration test
  docs: update CLAUDE.md

---

## Git Worktree Workflow — Work Frontend + Backend in Parallel

Two worktrees let you have two terminal sessions open simultaneously without
switching branches and losing in-progress work.

### Worktree Paths
- **Backend work**: `C:\Users\HP\Documents\GitHub\trustbase-backend\`  (branch: feature/backend)
- **Frontend work**: `C:\Users\HP\Documents\GitHub\trustbase-frontend\` (branch: feature/frontend)
- **Main repo**: `C:\Users\HP\Documents\GitHub\trust pilot\` (branch: main)

### How to Use Worktrees
```sh
# Open two terminals — one for each:
cd "C:\Users\HP\Documents\GitHub\trustbase-backend"
claude        # start Claude Code here for backend work

cd "C:\Users\HP\Documents\GitHub\trustbase-frontend"
claude        # start Claude Code here for frontend work
```

### PR Workflow — Create a PR Every Time You Finish a Task
After completing any task on either branch:
```sh
git add <specific files>
git commit -m "feat: <what you built>"
git push origin feature/frontend   # or feature/backend
gh pr create --title "<short title>" --body "<description>"
```
Then wait for review/merge before starting the next phase on that branch.

### Rules for Worktrees
- NEVER commit backend code in the frontend worktree or vice versa
- Always run `git status` before committing to confirm you're on the right branch
- If main gets new commits (merges), pull into your worktree:
  `git fetch origin && git rebase origin/main`
- Keep each PR focused on ONE phase or ONE task — no bundling multiple phases

---

## Implementation Order (see IMPLEMENTATION_PLAN.md for details)

Phase 0:  ✅ Fix bugs (ESM/CJS + missing route files) — DONE
Phase 1:  ✅ Config layer (supabase.js, twilio.js, paystack.js) — DONE
Phase 2:  ⏳ Database schema in Supabase SQL Editor — NEEDS USER ACTION
Phase 3:  ✅ Utils layer (validators, response helpers, OTP, risk scoring) — DONE
Phase 4:  ✅ Middleware layer (auth, validate, rateLimit, security) — DONE
Phase 5:  ✅ Model layer (all DB queries) — DONE
Phase 6:  ✅ Service layer (all business logic) — DONE
Phase 7:  ✅ Controller layer — DONE
Phase 8:  ✅ Route files — DONE
Phase 9:  ✅ Socket.io — DONE
Phase 10: Frontend integration (connect React pages to real API)
Phase 11: Tests
Phase 12: Pipeline (Husky, ESLint, SonarQube, GitHub Actions, Sentry)

---

## Interaction Rules — ALWAYS Follow These

### Rule 0: Read These Four Files at the Start of EVERY Session
Before doing ANYTHING in this codebase, read all four files in this order:
1. `trustbase/CLAUDE.md` — this file (architecture rules, tech stack, code rules)
2. `trustbase/TASK_MODEL_MAP.txt` — which Claude model to use for each task + model switching guide
3. `trustbase/IMPLEMENTATION_PLAN.md` — what each phase builds, the exact specs
4. `trustbase/PROCEDURES.md` — step-by-step development procedures

After reading, state:
- Which worktree you are working in (frontend or backend)
- Which phase/task is being worked on
- Which Claude model is correct for this task (per TASK_MODEL_MAP.txt Part C)
- If the wrong model is active: STOP and tell the user which model to open instead

**Model switching rule**: The model cannot be changed mid-session without losing context.
Open a NEW terminal with the correct model BEFORE starting the task:
  - Haiku tasks: `claude --model claude-haiku-4-5-20251001`
  - Sonnet tasks: `claude` (default)
  - Opus tasks:   `claude --model claude-opus-4-7`

### Rule 1: Always Ask Before Starting the Next Phase
After completing any task or phase, ALWAYS:
1. State clearly what was just completed and what changed
2. Use the AskUserQuestion tool to present the next options
3. NEVER automatically start the next phase without asking
4. Give the user a choice of: proceed to next phase / do something else / review first

### Rule 2b: Commit and PR Messages Must Reflect What Was Done
Every commit message and PR description must be generated from the actual work
carried out before the commit — not a generic or template message.

Before every commit:
1. Claude generates 3 suggested commit messages based on what was just built
2. User picks one (or provides their own)
3. Never use "Co-Authored-By: Claude" lines — the message is the user's

### Rule 2: Always Document New Features
Whenever a new feature, file, or endpoint is added:
1. Update PROGRESS_LOG.md with what was done (use Haiku for this)
2. Update LEARN.md if a new technology or concept was introduced
3. Add an entry to backend/BACKEND_RULES.md if a new pattern was established
4. Add inline explanation in the file itself if the WHY is non-obvious

### Rule 3: Read Before Building
Before writing ANY code (backend OR frontend):
1. Read CLAUDE.md (this file) — architecture rules and tech stack
2. Read TASK_MODEL_MAP.txt — confirm correct model for this task
3. Read the relevant phase section in IMPLEMENTATION_PLAN.md — exact specs
4. Read PROCEDURES.md — if setting up anything new or unfamiliar
5. Check PROGRESS_LOG.md — to know what is already done
6. Read BACKEND_RULES.md — backend coding rules (backend tasks only)

---

## MVC + Clean Code Architecture (Strict)

### What MVC Means in This Backend
- **Model** (models/) — ONLY talks to the database. Returns plain data objects.
  No business logic. No HTTP. No external API calls.
- **Controller** (controllers/) — ONLY handles HTTP. Reads req, calls one service, sends res.
  Thin layer — max 20 lines per function. No logic.
- **View** — Not applicable (REST API returns JSON, no templates).
  The "view" IS the JSON response shape, defined by services.
- **Service** (services/) — ALL business logic. Orchestrates models + external APIs.
  No req/res access. Pure JavaScript functions. Fully testable.

### Clean Code Principles Applied
1. **Single Responsibility** — every file does ONE thing
   - models/user.model.js: only user database queries
   - services/auth.service.js: only authentication logic
2. **No Magic Numbers/Strings** — use constants/index.js
   WRONG: bcrypt.hash(password, 12)
   RIGHT: bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
3. **Custom Error Classes** — use errors/AppError.js
   WRONG: const err = new Error('Not found'); err.statusCode = 404;
   RIGHT: throw notFound('User')
4. **Consistent naming** — functions are verbs, files are nouns
   - Functions: createUser(), findUserByPhone(), computeRiskScore()
   - Files: user.model.js, auth.service.js, auth.controller.js
5. **Small functions** — max 30 lines per function. Split if longer.
6. **No deep nesting** — max 3 levels of indentation. Use early returns.
7. **Fail fast** — validate and throw at the top of functions, happy path at the bottom.

### Repository Pattern (already implemented)
Models act as repositories — they abstract away database details.
Services never write raw Supabase calls — they call model functions.
This means you can swap databases without touching services.

---

## Security Architecture (Strict)

### Security Layers (in order, all in app.js)
1. attachRequestId — UUID for every request, in logs and responses
2. securityHeaders (helmet) — 11+ HTTP security headers
3. cors(corsOptions) — strict origin whitelist, not '*'
4. preventParamPollution (hpp) — block ?x=a&x=b attacks
5. express.raw for webhook — before express.json, preserves raw body
6. express.json({ limit: '10kb' }) — prevents large payload attacks
7. authRateLimit / searchRateLimit — per-endpoint rate limits
8. validate(schema) — Zod validates all user input
9. verifyToken / optionalAuth — JWT checks on protected routes
10. Paystack webhook HMAC-SHA512 verification — in service layer
11. Global error handler — never leaks stack traces in production

### AppError Usage (enforce this everywhere)
```js
// WRONG — generic Error with bolted-on property
throw Object.assign(new Error('Not found'), { statusCode: 404 });

// RIGHT — AppError with factory function
const { notFound } = require('../errors/AppError');
throw notFound('User');

// Available factories: notFound, unauthorized, forbidden, conflict, badRequest, paymentRequired
```

### Constants Usage (no magic values anywhere)
```js
// WRONG
const hash = await bcrypt.hash(password, 12);
jwt.sign({}, secret, { expiresIn: '7d' });

// RIGHT
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRY } = require('../constants');
const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
jwt.sign({}, secret, { expiresIn: JWT_EXPIRY });
```

### Newly Added Files (Security + Clean Code)
- backend/src/errors/AppError.js — custom error class + factory functions
- backend/src/middlewares/security.js — helmet, strict CORS, HPP, request ID
- backend/src/constants/index.js — all magic numbers and strings in one place
