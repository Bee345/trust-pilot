# TrustBase — Development to Production Pipeline (Beginner Walkthrough)

> This is the complete, plain-English guide for taking TrustBase from code on your
> laptop to a live app on the internet. It is written for someone who has never
> set up CI/CD before. Read it top to bottom on your first pass — every step
> assumes you've done the steps above it.
>
> **Estimated time end-to-end:** ~6 hours spread across two days. About 90 minutes
> of that is sitting in browser dashboards clicking buttons. The rest is waiting
> for builds, copying tokens between sites, and verifying things work.

---

## TABLE OF CONTENTS

- [0. What CI/CD Means and Why You Care](#0-what-cicd-means-and-why-you-care)
- [1. The Big Picture Flow](#1-the-big-picture-flow)
- [2. Accounts You Need to Create (One Time)](#2-accounts-you-need-to-create-one-time)
- [3. Step 1 — ESLint + Prettier (Code Quality While You Type)](#3-step-1--eslint--prettier-code-quality-while-you-type)
- [4. Step 2 — Husky + Commitlint (Guards on Every Commit)](#4-step-2--husky--commitlint-guards-on-every-commit)
- [5. Step 3 — SonarCloud (Quality Gate on Every PR)](#5-step-3--sonarcloud-quality-gate-on-every-pr)
- [6. Step 4 — Sentry (Production Error Monitoring)](#6-step-4--sentry-production-error-monitoring)
- [7. Step 5 — Supabase (Test + Production Databases)](#7-step-5--supabase-test--production-databases)
- [8. Step 6 — Twilio (SMS OTP)](#8-step-6--twilio-sms-otp)
- [9. Step 7 — Paystack (Payments)](#9-step-7--paystack-payments)
- [10. Step 8 — GitHub Repository Secrets (The Master Vault)](#10-step-8--github-repository-secrets-the-master-vault)
- [11. Step 9 — Vercel Frontend Deploy](#11-step-9--vercel-frontend-deploy)
- [12. Step 10 — Railway Backend Deploy](#12-step-10--railway-backend-deploy)
- [13. Step 11 — Branch Protection (Stop Yourself From Breaking Main)](#13-step-11--branch-protection-stop-yourself-from-breaking-main)
- [14. Step 12 — Custom Domain (Optional)](#14-step-12--custom-domain-optional)
- [15. The Daily Workflow Once Everything Is Set Up](#15-the-daily-workflow-once-everything-is-set-up)
- [16. Troubleshooting](#16-troubleshooting)

---

## 0. What CI/CD Means and Why You Care

**CI = Continuous Integration.** Every time you push code to GitHub, an automated
robot runs your tests, linter, and security scanners. If anything fails, you
get told before the bad code reaches the main branch.

**CD = Continuous Deployment.** When code lands on `main`, a different robot
takes your code and ships it to the live internet automatically. No SSH'ing
into a server, no manual upload.

**Why this matters for TrustBase:** you are building a payments-handling app.
A broken deploy could mean someone pays ₦2,000 for a verification that never
gets recorded, or a scam report endpoint that silently swallows submissions.
Automated tests + deploy guards = you sleep at night.

---

## 1. The Big Picture Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│  YOU (writing code in VS Code on your laptop)                          │
│  └─ ESLint underlines bugs in red as you type                          │
│  └─ Prettier auto-formats on save                                      │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │ git commit
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  HUSKY (local pre-commit hook on YOUR machine)                         │
│  └─ lint-staged: ESLint + Prettier on staged files                     │
│  └─ commitlint: rejects commits not matching "feat:", "fix:", etc.     │
│  └─ If any of these fail, the commit NEVER HAPPENS                     │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │ git push
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  GITHUB ACTIONS (runs on GitHub's servers, defined in .github/workflows)│
│  ├─ Frontend job: npm ci → eslint → vite build                          │
│  ├─ Backend job:  npm ci → eslint → jest --coverage                     │
│  ├─ SonarCloud job: code quality + security + coverage analysis         │
│  └─ CodeQL job: GitHub's free static security scan                      │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │ all green + PR review approved
                           ▼
                  merge to main branch
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  DEPLOYMENT (deploy.yml workflow)                                       │
│  ├─ Frontend: build + push to Vercel  → https://trustbase.vercel.app   │
│  ├─ Backend: build + push to Railway → https://trustbase-be.up.railway.app│
│  └─ Health check: curl /health on backend, fail loud if not 200         │
└──────────────────────────┬─────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  PRODUCTION                                                             │
│  ├─ Supabase: stores users, reports, verifications                     │
│  ├─ Sentry: catches every error, emails you                             │
│  ├─ Twilio: sends OTP SMS to Nigerian phones                            │
│  └─ Paystack: charges users ₦2,000 / ₦5,000 for verification badges    │
└────────────────────────────────────────────────────────────────────────┘
```

Memorize one thing: **the only way code reaches production is through this
pipeline.** No manual deploys, no scp, no "let me just hotfix it on the server."

---

## 2. Accounts You Need to Create (One Time)

Do all of these BEFORE starting Step 1. They are all free.

| Account | URL | What it does | Free tier limit |
|---|---|---|---|
| GitHub | github.com | Hosts your code, runs CI | 2000 Actions minutes/month |
| Supabase | supabase.com | Postgres database + auth | 500MB DB, 2 projects |
| SonarCloud | sonarcloud.io | Code quality analysis | Free for public repos |
| Sentry | sentry.io | Production error tracking | 5k errors/month |
| Vercel | vercel.com | Frontend hosting | Unlimited personal projects |
| Railway | railway.app | Backend hosting | $5 free credit/month |
| Twilio | twilio.com | SMS OTP | $15 trial credit |
| Paystack | paystack.com | Payments (Nigerian) | Test mode is free forever |

**Tip:** Sign up to each with the same email so notifications all land in one inbox.
Use a password manager (1Password, Bitwarden) for every token you'll generate today.

---

## 3. Step 1 — ESLint + Prettier (Code Quality While You Type)

### Why this exists

ESLint is a robot that reads your JavaScript and flags bad patterns: unused
variables, `==` instead of `===`, missing React hook dependencies, accidentally
mutating props, etc. It catches roughly half of all bugs before you even commit.

Prettier is a robot that reformats your code into a consistent style: same
indentation, same quote style, same line length. It removes all "style debates"
from your team because everyone's code looks identical after Prettier runs.

Together they mean: you write rough code, save the file, and your editor
silently turns it into clean, error-free code.

### Frontend setup

The frontend (`trustbase/`) already has `eslint.config.js`. Open it and make
sure it includes these rules under the existing `rules` object:

```js
rules: {
  'no-console': 'error',
  'no-unused-vars': 'error',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
}
```

Install Prettier:

```sh
cd trustbase
npm install -D prettier
```

Create `trustbase/.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true,
  "tabWidth": 2
}
```

Create `trustbase/.prettierignore`:

```
node_modules
dist
backend
```

Add to `trustbase/package.json` under `"scripts"`:

```json
"format": "prettier --write src/**/*.{js,jsx}",
"format:check": "prettier --check src/**/*.{js,jsx}"
```

### Backend setup

The backend already has ESLint + Prettier installed (see `backend/package.json`
devDependencies). Verify these files exist; create them if not:

`trustbase/backend/.eslintrc.js`:

```js
module.exports = {
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prettier/prettier': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
};
```

`trustbase/backend/.prettierrc`:

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "semi": true
}
```

`trustbase/backend/.eslintignore`:

```
node_modules
dist
```

### VS Code integration (the magic part)

Install these two VS Code extensions:
- `dbaeumer.vscode-eslint`
- `esbenp.prettier-vscode`

Create `trustbase/.vscode/settings.json`:

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

Now every time you press Ctrl+S, your file is auto-formatted and ESLint
auto-fixes are applied.

### Verify it works

In VS Code, open `trustbase/src/pages/Home.jsx`, add `var foo = 1` somewhere,
and save. You should see:
1. `var` gets underlined red (ESLint hates `var`)
2. After save, formatting snaps to 2-space indentation
3. Save again — the rule may auto-fix to `const`

If none of that happens, restart VS Code and check the ESLint extension status
in the bottom-right corner. It should say "ESLint" with no error icon.

---

## 4. Step 2 — Husky + Commitlint (Guards on Every Commit)

### Why this exists

ESLint in your editor is a suggestion. Husky is enforcement. Husky installs
"git hooks" — tiny scripts that run automatically before `git commit` completes.
If any hook fails, the commit is rejected and your changes stay unstaged.

`lint-staged` only runs the linter on files you actually touched (fast, vs
re-linting the whole repo).

`commitlint` enforces commit message format. No more `"fixed stuff"` commits.

### Install (run from `trustbase/` root, NOT from backend/)

```sh
cd trustbase
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

`npx husky init` creates a `.husky/` folder with a `pre-commit` file.

### Configure the hooks

Open `.husky/pre-commit` and replace its contents with:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

Create `.husky/commit-msg`:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx --no -- commitlint --edit "$1"
```

On Windows, you don't need `chmod +x` — Git Bash treats them as executable.
On macOS/Linux, run:

```sh
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### lint-staged config — add to `trustbase/package.json`

```json
"lint-staged": {
  "src/**/*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "backend/src/**/*.js": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

### Commit message rules (enforced by commitlint)

`commitlint.config.js` already exists at the trustbase root. The allowed
commit message types are:

| Type | When to use |
|---|---|
| `feat:` | A new user-facing feature ("feat: add signup endpoint") |
| `fix:` | A bug fix ("fix: resolve ESM/CJS import error") |
| `chore:` | Setup, tooling, dependency bumps ("chore: install husky") |
| `docs:` | Documentation only ("docs: expand PIPELINE.md") |
| `test:` | Tests only ("test: add auth integration test") |
| `refactor:` | Code change with no behavior change |
| `style:` | Whitespace / formatting only |
| `ci:` | CI/CD pipeline changes |

**Format:** `<type>: <short description in lowercase, present tense>`

Good: `feat: add signup endpoint with bcrypt hashing`
Bad: `Added signup` — missing type, past tense
Bad: `feat: Stuff` — useless description
Bad: `I fixed the thing` — no type at all

### Verify it works

Try this:

```sh
cd trustbase
echo "// test" >> src/App.jsx
git add src/App.jsx
git commit -m "broken message"
```

The commit should be **rejected** with a commitlint error explaining the
format. Now try:

```sh
git commit -m "chore: test husky setup"
```

This should succeed (and you'll see ESLint + Prettier running automatically).

If hooks don't fire at all, run `npx husky install` again from the `trustbase/`
root.

---

## 5. Step 3 — SonarCloud (Quality Gate on Every PR)

### Why this exists

SonarCloud is a robot that reads your entire codebase after every push and
flags:

- **Bugs** — patterns proven to cause production crashes
- **Vulnerabilities** — security issues (SQL injection, weak crypto, etc.)
- **Code smells** — maintainability problems (functions too long, etc.)
- **Test coverage** — % of code your tests actually exercise
- **Duplication** — copy-pasted code that should be a function

It's like a senior dev reviewing every PR for you. Free for public GitHub repos.

### One-time setup

1. Go to **sonarcloud.io**
2. Click "Log in" → "With GitHub"
3. Authorize SonarCloud to read your GitHub account
4. Click "+ Analyze new project"
5. Click "Import an organization from GitHub"
6. Select your GitHub account → choose the `trust-pilot` repository
7. Click "Set Up"
8. On the "Analysis Method" screen, choose **"With GitHub Actions"** (NOT the
   automatic SonarCloud scan — we want it driven by our workflow file)

### Generate the token (you'll need this in Step 8)

1. In SonarCloud, click your avatar (top right) → **My Account**
2. Click the **Security** tab
3. Under "Generate Tokens", give it a name like `TRUSTBASE_SONAR`
4. Click "Generate" — **copy the token immediately**, you can never see it again
5. Save it to your password manager. You'll paste this into GitHub secrets in Step 8.

### Verify `sonar-project.properties`

This file already exists at `trustbase/sonar-project.properties`. Open it
and verify the `sonar.organization` and `sonar.projectKey` match what
SonarCloud assigned you (check the URL of your project page —
`https://sonarcloud.io/project/overview?id=YOUR_PROJECT_KEY`).

### Configure the quality gate (the "pass/fail" rules)

1. In SonarCloud → your project → **Administration** → **Quality Gates**
2. Click "Create" → name it `TrustBase Gate`
3. Add these conditions on **New Code**:
   - Coverage > 70%
   - Duplicated lines < 3%
   - Bugs = 0
   - Vulnerabilities = 0
   - Security Hotspots Reviewed = 100%
   - Maintainability Rating = A
4. Save, then set this as your project's quality gate

Now any PR that drops coverage below 70% or introduces a bug will be
**blocked from merging** (once you add the branch protection rule in Step 11).

---

## 6. Step 4 — Sentry (Production Error Monitoring)

### Why this exists

Without Sentry: a user in Lagos gets a 500 error when submitting a report.
They close the tab. You never know it happened.

With Sentry: you get an email within 30 seconds with the full stack trace,
the user's browser, the request payload, and a button to reopen the issue.

### One-time setup

1. Go to **sentry.io** → Sign up
2. When asked "What platform?" choose to create **two separate projects**:
   - Project 1: name `trustbase-frontend`, platform: **React**
   - Project 2: name `trustbase-backend`, platform: **Node.js / Express**
3. Each project gives you a DSN. It looks like:
   ```
   https://abcdef1234567890@o123456.ingest.sentry.io/7654321
   ```
4. Save BOTH DSNs to your password manager:
   - `VITE_SENTRY_DSN` = frontend DSN
   - `SENTRY_DSN` = backend DSN

### Wire it into the backend

`@sentry/node` is already in `backend/package.json`. Open `backend/src/app.js`
and add at the very top, BEFORE any routes:

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

Sentry v8 auto-instruments Express — no need for manual `requestHandler` /
`errorHandler` middleware anymore. Just make sure your existing global error
handler comes LAST in the middleware chain.

### Wire it into the frontend

```sh
cd trustbase
npm install @sentry/react
```

Open `trustbase/src/main.jsx` and add BEFORE `ReactDOM.createRoot`:

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

### Add DSNs to your local `.env` files (for local testing)

`trustbase/.env`:
```
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=https://YOUR_FRONTEND_DSN
```

`trustbase/backend/.env`:
```
SENTRY_DSN=https://YOUR_BACKEND_DSN
NODE_ENV=development
```

### Verify it works

Add this temporary route to `backend/src/app.js`:

```js
app.get('/debug-sentry', () => {
  throw new Error('Sentry test error');
});
```

Restart the backend, hit `http://localhost:3000/debug-sentry`, then refresh
your Sentry dashboard. You should see the error appear within 30 seconds.
Delete the test route after.

---

## 7. Step 5 — Supabase (Test + Production Databases)

### Why two projects

You need a **production** database (real users) and a **test** database
(GitHub Actions runs tests against this — it can be wiped at any time).
Mixing them = the day your CI suite deletes a real user.

### Create the production project

1. **supabase.com** → New project
2. Name: `trustbase-prod`, region: `EU West (Ireland)` (closest to Nigeria
   with stable latency)
3. Set a strong database password — save it to your password manager
4. Wait ~2 minutes for provisioning

### Create the test project

Repeat the above with name `trustbase-test`. Yes, you'll have two projects.
This is the right structure.

### Run the schema in BOTH projects

Open `IMPLEMENTATION_PLAN.md` Phase 2. Copy the full SQL block. Run it in:

- `trustbase-prod` → SQL Editor → paste → Run
- `trustbase-test` → SQL Editor → paste → Run

### Collect the credentials from each project

Per project, go to **Settings → API** and copy:

- Project URL → `SUPABASE_URL`
- `service_role` key (NOT anon key) → `SUPABASE_KEY`

Go to **Settings → Database** and copy:

- Connection string (URI format) → `DATABASE_URL`

Save these to your password manager under two entries:

```
TRUSTBASE PROD SUPABASE
  url:          https://abc.supabase.co
  service_key:  eyJhbG...
  db_url:       postgresql://postgres:PWD@db.abc.supabase.co:5432/postgres

TRUSTBASE TEST SUPABASE
  url:          https://xyz.supabase.co
  service_key:  eyJhbG...
  db_url:       postgresql://postgres:PWD@db.xyz.supabase.co:5432/postgres
```

> **Why the service_role key and not the anon key:** the backend bypasses
> Row Level Security because it does its own authorization via JWT middleware.
> NEVER expose the service_role key to the frontend or commit it.

---

## 8. Step 6 — Twilio (SMS OTP)

### Why this exists

When a user signs up, you send them a 6-digit code over SMS to prove they
own the phone number. Twilio is the SMS sending service. It costs roughly
$0.05 per SMS to a Nigerian number. The trial gives $15 credit which is
~300 SMSes — plenty for the prototype.

### Setup

1. **twilio.com** → Sign up → confirm your email
2. Verify your own phone number (Twilio sends YOU a code first)
3. From the Console Dashboard, copy:
   - **Account SID** → `TWILIO_SID`
   - **Auth Token** → `TWILIO_TOKEN`
4. Buy a phone number:
   - Console → **Phone Numbers → Buy a Number**
   - Filter: Country = United States, capability = SMS
   - (Why US not Nigeria: Nigerian Twilio numbers require regulatory paperwork
     and a Nigerian business address. US numbers send to Nigeria fine.)
   - Cost: $1.15/month, charged from your trial credit
   - Copy the purchased number (e.g. `+13105551234`) → `TWILIO_PHONE`

### Local `.env` update

In `trustbase/backend/.env`:

```
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your-auth-token
TWILIO_PHONE=+13105551234
```

### Verify

Once Phase 10 OTP flow is wired up, sign up with your own real Nigerian
number. You should receive an SMS within 10 seconds with a 6-digit code.

If you get "the number is unverified" — Twilio trial accounts can only send
to numbers you've added to **verified caller IDs**. Add your test number
under Console → Phone Numbers → Verified Caller IDs.

---

## 9. Step 7 — Paystack (Payments)

### Why this exists

Verification badges cost ₦2,000 (individual) or ₦5,000 (business).
Paystack handles the card/bank transfer/USSD payment and notifies your
backend when payment succeeds (via a webhook).

### Setup

1. **paystack.com** → Sign up with your business email
2. Complete the basic profile (no Nigerian bank account needed yet for test mode)
3. Go to **Settings → API Keys & Webhooks**
4. Copy the **Test Secret Key** (starts with `sk_test_`) → `PAYSTACK_SECRET`
5. Set the test webhook URL (you'll fill this in after Railway deploy):
   - Webhook URL: `https://trustbase-be.up.railway.app/api/verify/webhook`
   - Click "Save"

### Local `.env` update

```
PAYSTACK_SECRET=sk_test_xxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

### Test payments locally with ngrok

Paystack can't call `localhost` for webhooks. Use **ngrok** to expose your
local backend to the public internet for testing:

```sh
npm install -g ngrok
ngrok http 3000
```

ngrok prints a URL like `https://abc123.ngrok.io`. Paste that + `/api/verify/webhook`
into Paystack's test webhook URL field. Now when you test a payment, Paystack
calls your local backend through ngrok.

### Test card numbers

Paystack provides test cards that always succeed/fail. Most useful:
- **Success:** `4084 0840 8408 4081`, CVV `408`, expiry any future date
- **Insufficient funds:** `5060 6666 6666 6666 666`

---

## 10. Step 8 — GitHub Repository Secrets (The Master Vault)

### Why this exists

GitHub Actions runs on GitHub's servers, not your laptop. It needs your
Supabase URL, JWT secret, etc. — but you NEVER commit these into the repo.
Instead, you store them in GitHub's encrypted "Secrets" vault, and the
workflow YAML pulls them in at runtime.

### How to add a secret

1. Go to your GitHub repo (`github.com/Bee345/trust-pilot`)
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `TEST_SUPABASE_URL`, Value: paste the URL
5. Click "Add secret"
6. Repeat for every secret in the list below

### The full list (add every single one)

| Secret name | Value source | Required for |
|---|---|---|
| `TEST_SUPABASE_URL` | Test Supabase project URL | Backend CI tests |
| `TEST_SUPABASE_KEY` | Test Supabase service_role key | Backend CI tests |
| `TEST_DATABASE_URL` | Test Supabase Postgres connection string | Backend CI tests |
| `TEST_JWT_SECRET` | Any 32+ char random string for CI | Backend CI tests |
| `SONAR_TOKEN` | From SonarCloud Step 3 | SonarCloud job |
| `VITE_API_URL` | Production backend URL (after Step 10) | Frontend prod build |
| `VITE_SENTRY_DSN` | Frontend Sentry DSN from Step 4 | Frontend prod build |
| `SENTRY_DSN` | Backend Sentry DSN from Step 4 | Backend deploy |
| `VERCEL_TOKEN` | From vercel.com → Account Settings → Tokens | Frontend deploy |
| `VERCEL_ORG_ID` | From `.vercel/project.json` (after Step 9) | Frontend deploy |
| `VERCEL_PROJECT_ID` | From `.vercel/project.json` (after Step 9) | Frontend deploy |
| `RAILWAY_TOKEN` | From railway.app → Account Settings → Tokens | Backend deploy |
| `FRONTEND_URL` | Your Vercel URL (after Step 9) | Backend CORS |

### Generate `TEST_JWT_SECRET`

In any terminal:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output. That's your test JWT secret.

> Some of these (Vercel IDs, FRONTEND_URL, VITE_API_URL) require Step 9
> and Step 10 to be done first. Add them in two passes: pre-deploy secrets
> first, then come back after deploy.

---

## 11. Step 9 — Vercel Frontend Deploy

### Why Vercel for the frontend

Vercel was made by the people who made Next.js. It's purpose-built for hosting
React/Vite apps. Zero config, global CDN, auto-SSL, deploys in 90 seconds.
Free for personal projects.

### One-time setup

1. **vercel.com** → Sign up with GitHub
2. Click **Add New → Project**
3. Select your `trust-pilot` repo → Click **Import**
4. On the configuration screen:
   - Framework Preset: **Vite**
   - Root Directory: **trustbase** (click "Edit" and type this)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `http://localhost:3000` (you'll change this after Step 10)
   - `VITE_SENTRY_DSN` = your frontend Sentry DSN
6. Click **Deploy**

After 60-90 seconds, you'll get a URL like `https://trust-pilot-abc123.vercel.app`.
That's your frontend live on the internet.

### Get the project IDs for GitHub Actions

```sh
cd trustbase
npm install -g vercel
vercel login          # logs in via browser
vercel link           # links this folder to your Vercel project
```

This creates `.vercel/project.json`. Open it — you'll see two values:

```json
{
  "projectId": "prj_xxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxx"
}
```

Add both to GitHub Secrets:
- `VERCEL_PROJECT_ID` = `prj_xxxxxxxxxxxx`
- `VERCEL_ORG_ID` = `team_xxxxxxxxxxxx`

Then get a Vercel token:
- vercel.com → Settings → Tokens → Create
- Add to GitHub Secrets as `VERCEL_TOKEN`

> **Add `.vercel/` to `.gitignore`** — never commit this folder.

---

## 12. Step 10 — Railway Backend Deploy

### Why Railway for the backend

Railway is the easiest way to deploy a Node.js Express server. It's basically
"Heroku, but currently maintained." $5 free credit per month covers a small
prototype.

### One-time setup

1. **railway.app** → Sign in with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select `Bee345/trust-pilot`
4. After it imports, click the service tile to open it
5. Go to **Settings**:
   - **Root Directory:** `trustbase/backend`
   - **Start Command:** `node src/server.js`
   - **Build Command:** leave blank (auto-detected)
6. Go to **Variables**:
   - Click "Raw Editor"
   - Paste your entire `backend/.env` contents (Railway parses it)
   - Make sure to use the **PRODUCTION** Supabase credentials here, not test
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL=https://your-vercel-url.vercel.app`
7. Go to **Settings → Networking → Public Networking**:
   - Click "Generate Domain"
   - You'll get a URL like `trustbase-backend-production.up.railway.app`
8. Click **Deploy**

After 2-3 minutes, hit `https://your-railway-url/health` in your browser.
You should see `{"status":"ok",...}`.

### Get the Railway token

1. railway.app → Account Settings → Tokens → Create Token
2. Name: `github-actions-deploy`
3. Copy the token, add to GitHub Secrets as `RAILWAY_TOKEN`

### Update Vercel + GitHub with the real backend URL

Now that the backend has a public URL:

- Vercel: change the `VITE_API_URL` env var to your Railway URL → trigger a
  redeploy
- GitHub Secrets: update `VITE_API_URL` and `FRONTEND_URL` to the real URLs

### Update Paystack webhook URL

Go back to Paystack dashboard → Settings → Webhooks. Change the webhook URL
to:
```
https://your-railway-url/api/verify/webhook
```

---

## 13. Step 11 — Branch Protection (Stop Yourself From Breaking Main)

This makes it **impossible** to push directly to `main` or merge a PR with
failing tests. It's the final lock on the gate.

1. GitHub repo → Settings → Branches → **Add branch protection rule**
2. Branch name pattern: `main`
3. Check these boxes:
   - ☑ Require a pull request before merging
   - ☑ Require approvals: 1 (or 0 if you're solo, but enable it later)
   - ☑ Require status checks to pass before merging
   - ☑ Require branches to be up to date before merging
   - In the search box, add these required checks (they must have run at
     least once before they appear):
     - `Frontend Lint & Build`
     - `Backend Lint & Test`
     - `SonarCloud Analysis`
     - `CodeQL Security Scan`
   - ☑ Do not allow bypassing the above settings
4. Click **Create**

Now any PR that doesn't pass CI literally cannot be merged. Even by you.

---

## 14. Step 12 — Custom Domain (Optional)

### Should you buy a domain?

**For the prototype phase: NO.** Use `https://trustbase.vercel.app` and
`https://trustbase-be.up.railway.app`. They're free, instant, get HTTPS,
and work on any device. Show investors and test users this URL.

**For public launch:** buy a domain like `trustbase.ng` or `trustbase.app`.
Roughly ₦15,000/year on Namecheap or Cloudflare. (Cloudflare is slightly
cheaper and the DNS panel is friendlier.)

### When you buy one

1. Cloudflare → Register domain → search `trustbase.app` or similar → checkout
2. Once registered, in **Cloudflare DNS** add:
   - `A` record: `@` → Vercel's IP (Vercel will show you the IP when you add
     the domain there)
   - `CNAME` record: `api` → Railway's domain
3. In **Vercel**: project → Settings → Domains → Add → `trustbase.app`
4. In **Railway**: service → Settings → Networking → Custom Domain → `api.trustbase.app`
5. Wait 5-30 minutes for DNS propagation
6. Update env vars:
   - `VITE_API_URL=https://api.trustbase.app`
   - `FRONTEND_URL=https://trustbase.app`

---

## 15. The Daily Workflow Once Everything Is Set Up

```sh
# 1. Start your day
git checkout main
git pull
git checkout -b feature/whatever-you-are-building

# 2. Make your changes
# ... edit code in VS Code ...
# ESLint flags issues in red as you type, Prettier formats on save

# 3. Commit (Husky auto-runs lint-staged + commitlint)
git status                                    # see what changed
git add path/to/specific/file.js              # NEVER use git add .
git commit -m "feat: add JWT verification middleware"
# Husky validates: lint passes? commit message format correct?
# If yes → commit succeeds. If no → BLOCKED, fix and re-commit.

# 4. Push
git push origin feature/whatever-you-are-building

# 5. Open Pull Request
gh pr create --title "Add JWT middleware" --body "..."
# OR open GitHub in browser, click "Compare & pull request"

# 6. Wait for CI (2-4 minutes)
# - Frontend Lint & Build       ✅
# - Backend Lint & Test         ✅
# - SonarCloud Analysis         ✅
# - CodeQL Security Scan        ✅

# 7. Request review (if you have a team), merge once approved

# 8. Merge triggers deploy.yml
# - Vercel: rebuilds + redeploys frontend (90 seconds)
# - Railway: rebuilds + redeploys backend (2 minutes)
# - Health check: curl /health on backend (must return 200)

# 9. Check Sentry dashboard for any new errors
# Check Supabase dashboard for any DB anomalies
```

---

## 16. Troubleshooting

### "Husky hook not firing on Windows"

Run from the `trustbase/` root:
```sh
rm -rf .husky
npx husky init
```
Recreate the hook files.

### "ESLint complains about my Prettier formatting"

Your ESLint and Prettier are fighting. Make sure ESLint extends `prettier`
LAST in the `extends` array — that turns off any ESLint rules that conflict
with Prettier.

### "SonarCloud says coverage is 0%"

The backend test workflow uploads `lcov.info` as an artifact. If the upload
or download step fails, SonarCloud has no coverage file. Check the CI logs
for the "Upload coverage to artifacts" step.

### "Vercel deploy succeeded but the page is blank"

Open browser DevTools → Console. Most common cause: `VITE_API_URL` env var
not set in Vercel → frontend calls `http://localhost:3000` which doesn't
exist in production. Fix in Vercel project settings, redeploy.

### "Railway deploy crashed immediately"

Railway → service → Deployments → click latest → View Logs. Most common
causes: missing required env var (e.g. `JWT_SECRET`), Supabase URL pointing
at the wrong project, or `start` script not finding `src/server.js`.

### "Paystack webhook isn't being received"

1. Paystack dashboard → Settings → Webhooks → check delivery log
2. Verify the URL has no typos and points at Railway (not localhost)
3. Verify your webhook handler responds with a 2xx status — if it 500s,
   Paystack retries 3 times then gives up
4. Check Railway logs for the request hitting `/api/verify/webhook`

### "Sentry shows no errors but the app definitely crashes"

DSN typo. Verify `process.env.SENTRY_DSN` is set on Railway and
`import.meta.env.VITE_SENTRY_DSN` is set on Vercel. Add a temporary
`/debug-sentry` route to force an error and verify it lands in Sentry.

### "commitlint rejects all my messages"

Read the rejection message carefully — it tells you exactly which rule
failed. Most common: missing the `:`, type not in the allowed list, or
description starts with a capital letter.

---

## Appendix — The Pipeline File Reference

| File | Purpose |
|---|---|
| `.github/workflows/ci.yml` | Runs on every push/PR — lint, test, SonarCloud, CodeQL |
| `.github/workflows/deploy.yml` | Runs on merge to main — deploys to Vercel + Railway |
| `commitlint.config.js` | Defines allowed commit message types |
| `sonar-project.properties` | SonarCloud project key + analysis paths |
| `.husky/pre-commit` | Hook that runs lint-staged before every commit |
| `.husky/commit-msg` | Hook that runs commitlint on every commit message |
| `eslint.config.js` (frontend) | Frontend lint rules |
| `backend/.eslintrc.js` | Backend lint rules |
| `.prettierrc` (both) | Prettier formatting config |
| `package.json > lint-staged` | Which files lint-staged should process |

If any of these files are missing, the pipeline degrades silently —
hooks just don't fire, jobs report green without doing anything. The first
time you set everything up, manually trigger a failure (commit something
broken) to confirm the gates actually catch it.
