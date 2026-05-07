# TrustBase — Full Development Procedures
# Step-by-step guide from fresh machine to deployed production app.
# Written for someone who is learning as they build.

---

## PART A — Before You Touch Any Code

### What You Need Installed
1. Node.js v20+ — download from nodejs.org (install LTS version)
   Verify: open terminal, type: node --version  (should show v20.x.x)

2. Git — usually pre-installed. Check with: git --version
   Configure: git config --global user.name "Your Name"
              git config --global user.email "your@email.com"

3. VS Code — download from code.visualstudio.com

### VS Code Extensions to Install
Open VS Code → Extensions (Ctrl+Shift+X) → search and install:
  - ESLint (by Microsoft)
  - Prettier (by Prettier)
  - GitLens (by GitKraken) — see git history inline
  - Thunder Client — test API endpoints without leaving VS Code
  - Error Lens — see errors inline in your code
  - AntiGravity (see VS Code Extension section below)

---

## PART B — Getting the Project Running Locally

### 1. Clone the repository
```sh
git clone https://github.com/Bee345/trust-pilot.git
cd "trust pilot"
```

### 2. Install frontend dependencies
```sh
cd trustbase
npm install
```

### 3. Install backend dependencies
```sh
cd backend
npm install
```

### 4. Create your environment files

Frontend .env (create at trustbase/.env):
```
VITE_API_URL=http://localhost:3000
VITE_SENTRY_DSN=leave-empty-for-now
```

Backend .env (the file trustbase/backend/.env already exists):
Fill in the real values:
```
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...   ← service role key
DATABASE_URL=postgresql://postgres:yourpassword@db.your-project.supabase.co:5432/postgres
JWT_SECRET=make-this-very-long-and-random-at-least-32-chars
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=your-twilio-auth-token
TWILIO_PHONE=+1234567890
PAYSTACK_SECRET=sk_test_xxxxxxxxxxxx
SOCKET_PORT=3001
SENTRY_DSN=leave-empty-for-now
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Where to get these values:
- Supabase: supabase.com → your project → Settings → API
- Twilio: twilio.com → Console → Account Info
- Paystack: dashboard.paystack.com → Settings → API Keys (use test keys for dev)

### 5. Set up the database (one time)
- Go to supabase.com → your project → SQL Editor
- Copy and run all the SQL from IMPLEMENTATION_PLAN.md Phase 2
- This creates your 4 tables and the increment_trust_points function

### 6. Start development servers

Open two terminal tabs:

Terminal 1 — Backend:
```sh
cd "trust pilot/trustbase/backend"
npm run dev
```
You should see: "TrustBase API running on port 3000"
Test it: open browser at http://localhost:3000/health
Should show: {"status":"ok","timestamp":"..."}

Terminal 2 — Frontend:
```sh
cd "trust pilot/trustbase"
npm run dev
```
Should show: "Local: http://localhost:5173/"
Open that URL in your browser — you should see the TrustBase app

---

## PART C — Setting Up Quality Tools (One Time)

### Install Husky + lint-staged (from trustbase/ root)
```sh
cd trustbase
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

### Edit .husky/pre-commit to contain:
```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

### Install ESLint + Prettier in backend
```sh
cd trustbase/backend
npm install -D eslint eslint-config-prettier eslint-plugin-prettier prettier
```

### Create VS Code settings (from trustbase/ root)
```sh
mkdir .vscode
```
Then create .vscode/settings.json (content in PIPELINE.md Step 1)

---

## PART D — Daily Git Workflow

Every feature or fix follows this pattern:

### Start a new piece of work
```sh
git checkout main        # go to main branch
git pull                 # get latest changes
git checkout -b feature/what-you-are-building   # create new branch
```

### Make your changes
Write your code. VS Code ESLint will highlight problems as you type.

### Stage and commit
```sh
git status               # see what changed
git add path/to/file.js  # stage specific files (never git add .)
git commit -m "feat: add JWT authentication middleware"
```
When you commit:
1. Husky fires
2. lint-staged runs ESLint + Prettier on your staged files
3. commitlint checks your commit message format
4. If anything fails, the commit is BLOCKED until you fix it

### Push and open PR
```sh
git push origin feature/what-you-are-building
```
Go to GitHub → you'll see a "Compare & pull request" button.
Click it → write a description → create the PR.

GitHub Actions will run automatically (2-4 minutes).
When all checks are green → ask for review → merge.

---

## PART E — Testing Your API Endpoints

Before building the frontend connection, always test the backend directly.

### Using Thunder Client (VS Code Extension)
1. Open Thunder Client in VS Code sidebar
2. Create a new collection called "TrustBase"
3. Add requests:

Health check:
  GET http://localhost:3000/health

Signup:
  POST http://localhost:3000/api/auth/signup
  Headers: Content-Type: application/json
  Body:
  {
    "name": "Chioma Okonkwo",
    "phone": "08012345678",
    "password": "password123"
  }

Login:
  POST http://localhost:3000/api/auth/login
  Body: { "phone": "08012345678", "password": "password123" }
  → Copy the token from the response

Get profile (protected):
  GET http://localhost:3000/api/users/me
  Headers: Authorization: Bearer YOUR_TOKEN_HERE

Submit a report:
  POST http://localhost:3000/api/reviews
  Headers: Authorization: Bearer YOUR_TOKEN_HERE
  Body:
  {
    "phone": "07098765432",
    "scamType": "Online Marketplace Scam",
    "description": "Paid for phone worth 150000 naira, seller blocked me after payment"
  }

Search:
  GET http://localhost:3000/api/reviews/search?q=07098765432

---

## PART F — Using the AntiGravity VS Code Extension

AntiGravity is a VS Code extension that connects your editor to Claude Code.
When VS Code shows errors in the PROBLEMS tab, AntiGravity lets you send
those errors directly to Claude to fix — without copy-pasting.

### How to use it for TrustBase

1. Install AntiGravity from VS Code Extensions marketplace
   Search: "AntiGravity" or look for the Claude Code VS Code extension

2. When you see errors in the PROBLEMS tab (Ctrl+Shift+M):
   - Right-click any error
   - Click "Send to Agent" or "Fix with Claude"
   - Claude Code receives the full error context (file, line, message)
   - Claude fixes the issue directly in your file

3. For TypeScript/ESLint errors:
   - The red underlines in your code are problems
   - You can also click the lightbulb icon that appears on an error
   - Select "Ask Claude to fix" or similar option

4. For terminal errors:
   - If your backend crashes with an error, select the error text in terminal
   - Right-click → "Send to Claude" or use the AntiGravity command palette
   - Ctrl+Shift+P → "AntiGravity: Send selection to agent"

### Tips for TrustBase specifically
- Always have CLAUDE.md open context when sending errors
  (Claude Code reads CLAUDE.md automatically for project context)
- When sending an error, describe what you were trying to do:
  "I was trying to make the Paystack webhook work and got this error"
- The extension can see your open files — Claude knows the project structure

---

## PART G — Deployment Procedures

### Deploy for the first time

Frontend (Vercel):
1. Go to vercel.com → New Project
2. Import GitHub repo → set root: trustbase → deploy
3. Add env vars in Vercel dashboard (VITE_API_URL, VITE_SENTRY_DSN)

Backend (Railway):
1. Go to railway.app → New Project → Deploy from GitHub
2. Set root directory: trustbase/backend
3. Start command: node src/server.js
4. Add ALL env variables from backend/.env

### Every deploy after first setup
Just: git push origin main → GitHub Actions builds → auto-deploys to Vercel + Railway

### Check if deployment worked
1. Frontend: visit your Vercel URL → try signing up
2. Backend: visit your Railway URL + /health → should return ok
3. Check Sentry dashboard for any new errors

---

## PART H — Monitoring Production

### Sentry (error monitoring)
- sentry.io → your TrustBase project
- Set up email alerts: Alerts → Create Alert → when new error → email you
- Check weekly: how many errors, what types

### Supabase (database monitoring)
- app.supabase.com → your project → Database → Table editor
- Check report counts, user growth
- Reports tab shows slow queries

### Railway (backend monitoring)
- railway.app → your project → Deployments
- Click any deployment to see logs
- If backend crashes, logs show exactly why

### Vercel (frontend monitoring)
- vercel.com → your project → Deployments
- See build logs, preview deployments, function logs

---

## PART I — Useful Terminal Commands Reference

```sh
# Start everything
cd trustbase/backend && npm run dev        # start backend
cd trustbase && npm run dev                # start frontend

# Linting
npm run lint                               # check for errors
npm run lint:fix                           # auto-fix errors

# Testing
cd trustbase/backend && npm test           # run all tests
npm test -- --coverage                     # with coverage report
npm test -- --testNamePattern="signup"     # run specific test

# Git
git status                                 # see changed files
git diff                                   # see actual changes
git log --oneline -10                      # last 10 commits
git checkout -b feature/name              # new branch

# Dependencies
npm install package-name                   # add production dep
npm install -D package-name               # add dev dep
npm outdated                              # check for updates

# Reset if something goes wrong
rm -rf node_modules && npm install        # reinstall all deps
```
