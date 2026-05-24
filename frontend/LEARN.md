# TrustBase — Technology Glossary
# What every tool in this project is, what it does, and WHY it's here.
# Written for someone learning Node.js backend development.

---

## THE BACKEND CORE

### Node.js
WHAT: A runtime that lets you run JavaScript outside the browser (on a server).
WHY HERE: TrustBase's server (API) is written in JavaScript. Node.js is what
          makes the backend JavaScript code actually run.
ANALOGY: The browser runs JS in your Chrome tab. Node.js runs JS on a server.
LEARN MORE: nodejs.org/en/learn

### Express.js (v5)
WHAT: A minimal web framework for Node.js. Handles HTTP requests and responses.
WHY HERE: When someone calls /api/auth/login, Express decides what code runs.
          It is the "traffic director" for your API.
KEY CONCEPTS:
  - Route: a URL pattern + a handler function
    app.get('/health', (req, res) => res.json({ ok: true }))
  - Middleware: code that runs BEFORE your route handler
    app.use(express.json())  ← parses request body as JSON
  - req: the incoming request (url, body, headers, params)
  - res: the outgoing response (what you send back)
  - next: a function to pass control to the next middleware

### CommonJS (require/module.exports)
WHAT: Node.js's original module system for splitting code into files.
WHY HERE: TrustBase backend uses CommonJS because package.json says
          "type": "commonjs". This is intentional.
HOW IT WORKS:
  // In file A:
  const helper = require('./utils/response');
  // In file B (utils/response.js):
  module.exports = { success, error };
DIFFERENCE FROM ES MODULES:
  ES Modules use: import helper from './utils/response.js'  ← NOT used here
  CommonJS uses:  const helper = require('./utils/response') ← USE THIS

---

## AUTHENTICATION

### JWT — JSON Web Token (jsonwebtoken package)
WHAT: A way to prove "I am who I say I am" without sending a password every time.
WHY HERE: After a user logs in, the server gives them a JWT token.
          On every future request, the user sends that token.
          The server verifies the token WITHOUT hitting the database.

HOW IT WORKS (3 parts, separated by dots):
  eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyMTIzIn0.SIGNATURE
  [      HEADER      ].[       PAYLOAD        ].[SIGNATURE]

  - Header: says what algorithm was used (HS256)
  - Payload: the data (user ID, expiry time)
  - Signature: proves the token hasn't been tampered with
    (created using your JWT_SECRET — keep this secret!)

CREATING A TOKEN:
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

READING A TOKEN (verifying):
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // decoded.sub = the userId you put in

WHERE IT'S STORED:
  Client (React app) stores token in localStorage.
  Client sends it as: Authorization: Bearer eyJ...

IF TOKEN EXPIRES OR IS INVALID:
  jwt.verify() throws an error → return 401 Unauthorized

### bcrypt
WHAT: A password hashing algorithm.
WHY HERE: You never store a user's actual password. You store a "hash" — a
          scrambled version. If your database is ever stolen, attackers can't
          read the passwords.
HOW IT WORKS:
  // When user signs up:
  const hash = await bcrypt.hash('myPassword123', 12);
  // 12 is the "cost factor" — higher = slower = harder to crack
  // Store the hash in the database

  // When user logs in:
  const valid = await bcrypt.compare('myPassword123', storedHash);
  // valid = true if password matches

KEY POINT: bcrypt is a ONE-WAY function. You cannot recover the original
           password from the hash. You can only check if a given password
           matches the stored hash.

---

## DATABASE

### Supabase
WHAT: A cloud database service built on top of PostgreSQL.
      Also provides: authentication, file storage, real-time subscriptions.
WHY HERE: TrustBase needs to store users, reports, and verifications.
          Supabase gives us a PostgreSQL database + a JavaScript SDK to query it.
HOW WE USE IT:
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Insert a row
  await supabase.from('reports').insert({ phone: '08012345678', ... });

  // Query rows
  const { data } = await supabase.from('users').select('*').eq('phone', phone);

  // The service role key bypasses Row Level Security (RLS)
  // — this is correct because the backend is trusted code

### PostgreSQL
WHAT: A powerful open-source relational database.
WHY HERE: All TrustBase data lives in PostgreSQL (via Supabase).
KEY CONCEPTS:
  - Table: like a spreadsheet. users, reports, verifications are tables.
  - Row: one record in a table (one user, one report)
  - Column: a field (name, phone, created_at)
  - UUID: a unique ID (random string like 550e8400-e29b-41d4-a716...)
  - Foreign Key: links rows across tables
    reports.reporter_id references users.id
  - INDEX: makes queries faster on frequently searched columns
    CREATE INDEX idx_reports_phone ON reports(phone);
  - CONSTRAINT: enforces rules
    CHECK (status IN ('pending', 'published', 'rejected'))

### Row Level Security (RLS)
WHAT: A PostgreSQL feature that adds access control rules at the database level.
WHY: If someone gets direct database access (not through your API), RLS limits
     what they can see. The backend's service role key bypasses RLS (intentional).

---

## VALIDATION

### Zod
WHAT: A TypeScript/JavaScript library for validating data shapes.
WHY HERE: Users send data to your API. You CANNOT trust that data.
          Zod checks that the data is the right shape before your code uses it.

HOW IT WORKS:
  const schema = z.object({
    phone: z.string().regex(/^(0[7-9][0-1]\d{8})$/),
    name: z.string().min(2),
  });

  const result = schema.safeParse(req.body);
  if (!result.success) {
    // result.error.errors tells you exactly what's wrong
  }
  // result.data is the cleaned, validated data

WHY NOT JUST CHECK req.body MANUALLY:
  Manual validation is error-prone. Zod is declarative, catches edge cases,
  and gives clear error messages to send back to the user.

---

## EXTERNAL SERVICES

### Twilio
WHAT: A cloud service for sending SMS messages.
WHY HERE: TrustBase sends OTP (one-time passwords) to Nigerian phone numbers
          to verify they are real phone numbers.
HOW IT WORKS:
  1. User submits their phone number
  2. Backend generates a 6-digit OTP: Math.floor(100000 + Math.random() * 900000)
  3. Backend calls Twilio API to send SMS to that number
  4. User enters the OTP they received
  5. Backend verifies the OTP matches → phone is confirmed real
IMPORTANT: Nigerian numbers must be in E.164 format:
  '08012345678' → '+2348012345678'

### Paystack
WHAT: A Nigerian payment gateway (like Stripe but for Nigeria and Africa).
WHY HERE: TrustBase charges for verification badges:
          ₦2,000 for individuals, ₦5,000 for businesses.
          Paystack handles card payments, bank transfers, and USSD.
HOW THE FLOW WORKS:
  1. User clicks "Get Verified"
  2. Backend calls Paystack to create a payment link (transaction/initialize)
  3. User is redirected to the Paystack payment page
  4. User pays
  5. Paystack sends a webhook to your backend (a POST request saying "payment done")
  6. Backend verifies the webhook signature (security check)
  7. Backend marks user as verified in the database
IMPORTANT: Paystack uses KOBO not Naira.
  ₦2,000 = 200,000 kobo (multiply by 100)

### Webhook (concept)
WHAT: A way for external services to notify your backend when something happens.
      Instead of your backend asking "did the payment go through?" repeatedly,
      Paystack sends a POST request to your backend saying "payment complete!"
WHY IT MATTERS: Your backend must verify the webhook is really from Paystack
                (using HMAC-SHA512 signature with your PAYSTACK_SECRET)

---

## REAL-TIME FEATURES

### Socket.io
WHAT: A library for real-time bidirectional communication between server and browser.
      Unlike HTTP (request → response), Socket.io keeps a persistent connection
      and the server can push data to the browser at any time.
WHY HERE: When someone submits a new scam report, all connected users see it
          immediately without refreshing the page.
HOW IT WORKS:
  Server: io.emit('new_report', { phone, scamType, riskLevel })
  Client: socket.on('new_report', (data) => updateUI(data))
KEY EVENTS FOR TRUSTBASE:
  'new_report'          — a new scam report was submitted
  'verification_update' — a verification status changed

---

## CODE QUALITY TOOLS

### ESLint
WHAT: A "linter" — a tool that reads your code and finds problems.
      It can find bugs (using undefined variables), bad patterns (no-var),
      and style issues (missing semicolons).
WHY HERE: Catches bugs before you run the code. Enforces consistent code style
          across the whole team.
HOW IT RUNS:
  npm run lint            → show all errors
  npm run lint:fix        → auto-fix fixable errors
  In VS Code: errors appear as red underlines as you type

### Prettier
WHAT: A code formatter. It rewrites your code to have consistent spacing,
      indentation, and style automatically.
WHY HERE: You never argue about code style. Just run Prettier — everyone's
          code looks the same.
HOW IT RUNS:
  npm run format          → format all files
  Saves on file in VS Code (if set up in .vscode/settings.json)
DIFFERENCE FROM ESLINT:
  ESLint catches bugs and logic errors.
  Prettier only cares about formatting (spaces, commas, quotes).

### Husky
WHAT: Runs scripts on git events (before commit, before push).
WHY HERE: Prevents bad code from being committed. Before every commit,
          Husky runs lint-staged to check and fix your files.
HOW IT WORKS:
  You run: git commit -m "feat: add login"
  Husky fires: runs lint-staged → ESLint fixes → Prettier formats
  If there's an unfixable error → commit is BLOCKED

### lint-staged
WHAT: Runs linters only on files you've staged for commit (not all files).
WHY: Running ESLint on thousands of files would be very slow. lint-staged
     only runs on the 1-3 files you actually changed.

### commitlint
WHAT: Checks that your commit messages follow the conventional commits format.
WHY HERE: Consistent commit messages make the git history readable.
          It enables automatic changelog generation.
FORMAT ENFORCED:
  type: description
  feat: add user profile page
  fix: correct phone validation regex
  chore: update dependencies

---

## TESTING

### Jest
WHAT: A JavaScript test framework from Meta.
WHY HERE: Automated tests verify your code works correctly.
          A test suite prevents bugs from coming back after you fix them.
TWO TYPES USED:
  1. Unit tests — test a single pure function in isolation
     Example: test computeRiskScore() with 3 high-risk reports → expect score > 60
  2. Integration tests — test a full API endpoint with real database
     Example: POST /api/auth/signup → expect 201 + token in response

### Supertest
WHAT: Makes HTTP requests to your Express app in tests without starting a real server.
WHY HERE: Used with Jest to test API endpoints.
EXAMPLE:
  const request = require('supertest');
  const app = require('../app');

  test('returns 201 on valid signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({ ... });
    expect(res.status).toBe(201);
  });

---

## CI/CD

### GitHub Actions
WHAT: Automated workflows that run on your GitHub repository.
WHY HERE: Every time you push code, GitHub Actions automatically:
          - runs your linters
          - runs your tests
          - runs SonarCloud analysis
          - deploys to Vercel/Railway if CI passes
WORKFLOW FILES: .github/workflows/ci.yml and deploy.yml

### CI (Continuous Integration)
WHAT: The practice of automatically testing code every time it's merged.
WHY: Catches bugs before they reach production. Everyone's code is tested
     against the same standard automatically.

### CD (Continuous Deployment)
WHAT: Automatically deploying passing code to production.
WHY: No manual deployment steps = faster releases = less human error.

### SonarQube / SonarCloud
WHAT: Code quality analysis platform.
WHY HERE: Measures test coverage, finds bugs, spots security vulnerabilities,
          identifies duplicate code (DRY violations), and "code smells".
QUALITY GATE: A set of rules that code must pass before being merged.
              If coverage drops below 70%, or a security vulnerability is
              found, the PR is blocked from merging.

### Sentry
WHAT: Error monitoring and crash reporting for production apps.
WHY HERE: When your app crashes in production (which happens), Sentry
          captures the full error, stack trace, request data, and user context.
          You get an email notification immediately.
          Without Sentry, you wouldn't know your app crashed until a user
          complains. With Sentry, you know before they do.
HOW IT WORKS:
  Sentry wraps your app's error handler.
  Any unhandled error is automatically sent to Sentry's servers.
  You see it in the Sentry dashboard within seconds.

---

## DEPLOYMENT

### Vercel
WHAT: A cloud platform that deploys frontend apps (React, Next.js, etc.)
WHY HERE: Free for personal projects, auto-deploys on every git push,
          gives you HTTPS automatically, fast CDN globally.
WHAT IT DOES: Runs npm run build → hosts the dist/ folder as a static website
              with HTTPS and a global CDN.

### Railway
WHAT: A cloud platform for running backend services (Node.js, Python, etc.)
WHY HERE: Simple to use, auto-deploys from GitHub, scales easily.
          Better for backend than Vercel because your Express server needs
          to stay running (not just static files).
WHAT IT DOES: Runs node src/server.js continuously. If it crashes, Railway
              restarts it automatically.

### CDN (Content Delivery Network)
WHAT: A global network of servers that serve your frontend files.
WHY: Without CDN, every Nigerian user downloading your React app would
     connect to one server (maybe in the US). With CDN, they connect to the
     nearest server (maybe in South Africa or Europe), so it loads faster.
     Vercel includes CDN automatically.

### Environment Variables
WHAT: Configuration values that change between development and production.
WHY: You don't want to hardcode database passwords in your code.
     In development you use test credentials.
     In production you use real credentials.
     Environment variables let you change these without changing code.
HOW:
  .env file → read by dotenv → available as process.env.VARIABLE_NAME
  NEVER commit .env to git (it's in .gitignore)

---

## THE DATABASE TABLES EXPLAINED

### users table
  id            — unique identifier (UUID)
  name          — full name ("Chioma Okonkwo")
  phone         — Nigerian phone number (unique, used to login)
  password_hash — bcrypt hash of their password (never the real password)
  is_verified   — true if they paid for verification
  trust_points  — earned by submitting helpful reports (gamification)

### reports table
  id            — unique identifier
  reporter_id   — which user submitted this (null if anonymous)
  phone         — phone number being reported
  business_name — business name (optional)
  scam_type     — one of the 8 scam categories
  description   — what happened (min 20 chars)
  amount_lost   — in Naira (optional)
  anonymous     — if true, reporter_id is hidden from public
  status        — pending → published → rejected (moderation pipeline)
  risk_level    — low / medium / high (computed from scam type)

### report_upvotes table
  report_id + user_id — composite primary key
  Meaning: "user X found report Y helpful"
  Can't upvote the same report twice (primary key prevents duplicates)

### verifications table
  user_id       — who applied for verification
  type          — 'individual' (₦2,000) or 'business' (₦5,000)
  status        — tracks the flow:
                  pending_payment → payment_received → under_review → approved/rejected
  paystack_ref  — the unique Paystack reference (used to match webhook events)
  amount_paid   — in kobo (200000 = ₦2,000)
