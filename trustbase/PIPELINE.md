# TrustBase — Development to Production Pipeline
# Complete setup guide: ESLint → Husky → SonarQube → Sentry → GitHub Actions → Deploy
# Follow in strict order. Each step builds on the previous one.

---

## The Full Flow (Big Picture)

```
You write code
    ↓
ESLint + Prettier fix your code automatically (while you type in VS Code)
    ↓
git commit → Husky pre-commit hook runs → lint-staged formats staged files
    ↓
commitlint checks your commit message format
    ↓
git push → GitHub Actions CI triggers
    ↓
CI: lint check → run tests → generate coverage → SonarCloud analysis
    ↓
SonarCloud quality gate: coverage > 70%, no new bugs, no security issues
    ↓
PR merged to main → deploy.yml triggers
    ↓
Frontend auto-deploys to Vercel
Backend auto-deploys to Railway
    ↓
Sentry monitors live errors in both frontend and backend
    ↓
You get notified of production errors via email/Slack
```

---

## STEP 1 — ESLint + Prettier (Code Quality)

### Why
ESLint catches bugs and bad patterns while you code.
Prettier enforces consistent formatting automatically.
Together they prevent most style debates and common mistakes.

### Frontend Setup (trustbase/)

The frontend already has eslint.config.js. Add these rules to it:
```js
// eslint.config.js — add to existing rules object
{
  rules: {
    'no-console': 'error',
    'no-unused-vars': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  }
}
```

Install Prettier:
```sh
cd trustbase
npm install -D prettier
```

Create trustbase/.prettierrc:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true,
  "tabWidth": 2
}
```

Create trustbase/.prettierignore:
```
node_modules
dist
backend
```

Add to trustbase/package.json scripts:
```json
"format": "prettier --write src/**/*.{js,jsx}",
"format:check": "prettier --check src/**/*.{js,jsx}"
```

### Backend Setup (trustbase/backend/)

Install:
```sh
cd trustbase/backend
npm install -D eslint @eslint/js eslint-config-prettier eslint-plugin-prettier prettier
```

Create trustbase/backend/.eslintrc.js:
```js
module.exports = {
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prettier/prettier': 'error',
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
```

Create trustbase/backend/.prettierrc:
```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true
}
```

Create trustbase/backend/.eslintignore:
```
node_modules
dist
```

### VS Code Integration
Install VS Code extension: "ESLint" (dbaeumer.vscode-eslint)
Install VS Code extension: "Prettier" (esbenp.prettier-vscode)

Create trustbase/.vscode/settings.json:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": [".", "./backend"]
}
```

---

## STEP 2 — Husky Git Hooks (Quality Gates on Commit)

### Why
Husky runs scripts automatically when you commit.
lint-staged only processes files you've actually changed (fast).
This means bad code can never be committed — caught before it reaches GitHub.

### Install (run from trustbase/ root)
```sh
cd trustbase
npm install -D husky lint-staged
npx husky init
```

This creates a .husky/ folder. Now edit the hooks:

### .husky/pre-commit (replaces generated content)
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

### .husky/commit-msg
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx --no -- commitlint --edit "$1"
```

Make hooks executable:
```sh
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### lint-staged config — add to trustbase/package.json
```json
"lint-staged": {
  "src/**/*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "backend/src/**/*.js": [
    "eslint --fix --rulesdir backend/.eslintrc.js",
    "prettier --write"
  ]
}
```

### Commit Message Format (enforced by commitlint)

Install:
```sh
npm install -D @commitlint/cli @commitlint/config-conventional
```

The commitlint.config.js is already created at trustbase root.

Format:
```
<type>: <description>

Types allowed:
  feat     — new feature
  fix      — bug fix
  chore    — setup, tooling, config changes
  docs     — documentation only
  test     — tests only
  refactor — code changes that don't add features or fix bugs
  style    — formatting only
  ci       — CI/CD changes

Examples:
  feat: add POST /api/auth/signup endpoint
  fix: resolve ESM/CJS mismatch in app.js
  chore: set up Husky pre-commit hooks
  test: add auth integration tests
  docs: update CLAUDE.md with backend rules
```

---

## STEP 3 — SonarCloud (Code Quality Analysis)

### Why
SonarCloud analyses your code for bugs, security vulnerabilities, code smells,
and test coverage. It blocks PRs if quality drops below your standard.
Free for public GitHub repos.

### Setup
1. Go to sonarcloud.io
2. Sign in with GitHub
3. Click "Import an organization" → select your GitHub account
4. Import the trust-pilot repository
5. Go to Administration → Analysis Method → set to "GitHub Actions"
6. Generate a token: My Account → Security → Generate Token
   Name it "TRUSTBASE_SONAR" — copy the value
7. Add to GitHub repo secrets: Settings → Secrets → SONAR_TOKEN = your token

### sonar-project.properties (already created at trustbase root)
Verify it contains the correct organization and project key from SonarCloud.

### Quality Gate Thresholds (configure in SonarCloud dashboard)
Go to: Quality Gates → Create a gate named "TrustBase Gate"
Set:
  - Coverage on new code: > 70%
  - Duplicated lines on new code: < 3%
  - New bugs: 0
  - New vulnerabilities: 0
  - New security hotspots reviewed: 100%
  - Maintainability rating: A

---

## STEP 4 — Sentry (Production Error Monitoring)

### Why
Sentry captures every unhandled error in production with full stack traces,
request data, and user context. You get notified immediately when something breaks.
Free for small projects.

### Sentry Account Setup
1. Go to sentry.io → Create free account
2. Create two projects: one "React" (frontend), one "Node.js" (backend)
3. Copy the DSN for each project

### Backend Sentry Setup
```sh
cd trustbase/backend
npm install @sentry/node
```

Add to backend/src/app.js (BEFORE any routes):
```js
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}
```

Add after all middleware, before routes:
```js
app.use(Sentry.Handlers.requestHandler());
```

Add after all routes (must be before other error handlers):
```js
app.use(Sentry.Handlers.errorHandler());
```

Add global error handler as last middleware:
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

### Frontend Sentry Setup
```sh
cd trustbase
npm install @sentry/react
```

Update trustbase/src/main.jsx — add BEFORE ReactDOM.createRoot:
```jsx
import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
}
```

Add to trustbase/.env:
```
VITE_SENTRY_DSN=https://xxxxxx@oxxxxx.ingest.sentry.io/xxxxxxx
```

Add to backend/.env:
```
SENTRY_DSN=https://xxxxxx@oxxxxx.ingest.sentry.io/xxxxxxx
NODE_ENV=development
```

---

## STEP 5 — GitHub Actions CI/CD

### Why
GitHub Actions runs your tests, linting, and SonarCloud analysis automatically
on every push and pull request. No more "it works on my machine."
Deployment happens automatically when code merges to main.

### Required GitHub Secrets
Go to: GitHub repo → Settings → Secrets and variables → Actions → New secret

Add all of these:
```
TEST_SUPABASE_URL        — URL of your test Supabase project (not production!)
TEST_SUPABASE_KEY        — Service role key of test project
TEST_DATABASE_URL        — PostgreSQL URL of test project
TEST_JWT_SECRET          — Any long random string for testing
SONAR_TOKEN              — From SonarCloud (Step 3)
VITE_API_URL             — https://your-backend.railway.app
VITE_SENTRY_DSN          — Frontend Sentry DSN
SENTRY_DSN               — Backend Sentry DSN (different from frontend)
VERCEL_TOKEN             — From vercel.com → Settings → Tokens
VERCEL_ORG_ID            — From .vercel/project.json after running vercel --prod
VERCEL_PROJECT_ID        — From .vercel/project.json
RAILWAY_TOKEN            — From railway.app → Account Settings → Tokens
FRONTEND_URL             — https://your-frontend.vercel.app
```

### Branch Protection (GitHub → Settings → Branches → Add rule)
Branch name pattern: main
Check:
  ✅ Require a pull request before merging
  ✅ Require status checks to pass:
       Add: "Frontend Lint & Build"
       Add: "Backend Lint & Test"
       Add: "SonarCloud"
  ✅ Require branches to be up to date before merging
  ✅ Do not allow bypassing the above settings

---

## STEP 6 — Deployment Targets

### Frontend → Vercel (free tier is fine)

First-time setup:
1. Go to vercel.com → New Project
2. Import your GitHub repository
3. Framework preset: Vite
4. Root directory: trustbase
5. Build command: npm run build
6. Output directory: dist
7. Add environment variables:
   VITE_API_URL = https://your-backend.railway.app
   VITE_SENTRY_DSN = your frontend sentry DSN

After that, every merge to main auto-deploys.

### Backend → Railway (recommended for Node.js)

First-time setup:
1. Go to railway.app → New Project
2. Deploy from GitHub repo → select trust-pilot
3. Select branch: main
4. Root directory: trustbase/backend
5. Start command: node src/server.js
6. Add all environment variables from backend/.env
   (PORT, SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, JWT_SECRET, etc.)

After that, every merge to main auto-deploys.

### Database → Supabase (already cloud-hosted)

Environments:
- dev: your main Supabase project (use while building)
- production: create a separate Supabase project for live data
  (do NOT use the same project for dev and production)

---

## STEP 7 — Additional Helpful Tools

### Dependabot (automatic dependency updates)
Create .github/dependabot.yml:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/trustbase"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/trustbase/backend"
    schedule:
      interval: "weekly"
```

### CodeQL (GitHub's free security scanning)
Add to .github/workflows/ci.yml (under jobs):
```yaml
  codeql:
    name: CodeQL Security Scan
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```

### PR Templates
Create .github/pull_request_template.md:
```markdown
## What does this PR do?
(Brief description)

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Documentation
- [ ] Tests

## Checklist
- [ ] CI is passing
- [ ] SonarCloud quality gate passes
- [ ] No console.log in production code
- [ ] No .env files committed
- [ ] PROGRESS_LOG.md updated
```

---

## Daily Development Workflow (After Everything Is Set Up)

```sh
# 1. Start your day
git checkout main && git pull
git checkout -b feature/what-you-are-building

# 2. Make your changes
# ... write code ...

# 3. Commit (Husky auto-runs lint-staged)
git add backend/src/services/auth.service.js
git commit -m "feat: add signup service with bcrypt hashing"
# Husky runs: ESLint fix + Prettier format on staged files
# commitlint checks: "feat: ..." ✓

# 4. Push
git push origin feature/what-you-are-building

# 5. Open Pull Request on GitHub
# GitHub Actions runs: lint → test → SonarCloud

# 6. All checks pass → get review → merge to main

# 7. main merge triggers deploy.yml
# Frontend deploys to Vercel (2-3 minutes)
# Backend deploys to Railway (2-3 minutes)

# 8. Check Sentry dashboard for any new production errors
```
