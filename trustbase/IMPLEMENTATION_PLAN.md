# TrustBase Backend — Full Implementation Plan
# Follow phases in strict order. Do not skip ahead.
# Use CLAUDE.md for all rules. Use TASK_MODEL_MAP.txt to pick the right Claude model.

---

## Companion Documents

This file specifies WHAT to build for each phase. Three other documents handle
HOW to operate the project around the build work:

| Document | Purpose |
|---|---|
| `CLAUDE.md` | Architecture rules, Nigerian context, security architecture, rules to never violate |
| `PIPELINE.md` | Full beginner walkthrough for Phase 12 — ESLint, Husky, SonarCloud, Sentry, Supabase, Twilio, Paystack, GitHub Secrets, Vercel, Railway, branch protection |
| `PROCEDURES.md` | Step-by-step procedures (clone repo, install, env files, daily git flow) |
| `MCP_SETUP.md` | MCP server setup + token-saving guide (Postman, GitHub, Supabase MCP, scoping per project) |
| `BACKEND_RULES.md` | Backend coding rules (CommonJS, AppError, constants, model layer rules) |
| `TASK_MODEL_MAP.txt` | Which Claude model to use for each task type |
| `PROGRESS_LOG.md` | Append-only log of what was completed and when |
| `LEARN.md` | Glossary of technologies and concepts used |

If you are starting a new Claude session, read `CLAUDE.md` first, then this file
for the phase you're on, then the companion document(s) referenced by that phase.

---

## Current Status (verified on disk, as of 2026-05-18)

| Phase | Status | Notes |
|---|---|---|
| 0 — Fix ESM/CJS bugs | ✅ DONE | app.js + server.js converted to CommonJS |
| 1 — Config layer | ✅ DONE | supabase.js, twilio.js, paystack.js exist |
| 2 — Database schema | ⚠️ UNKNOWN | User must confirm SQL ran in Supabase Dashboard |
| 3 — Utils layer | ✅ DONE | response.js, validators.js, risk.js, otp.js exist |
| 4 — Middleware layer | ✅ DONE | auth.js, validate.js, rateLimit.js, security.js exist |
| 5 — Model layer | ✅ DONE | user, report, verification, company models exist |
| 6 — Service layer | ✅ DONE | auth, report, verification services exist |
| 7 — Controller layer | ✅ DONE | 5 controllers (incl. company.controller.js) |
| 8 — Route files | ✅ DONE | 5 route files wired through routes/index.js |
| 9 — Socket.io | ✅ DONE | sockets/index.js exists |
| 10 — Frontend integration | 🔄 IN PROGRESS | api.js + Login + Signup + App.jsx + Home + SearchResults + ReportScam + GetVerified done; ReportsList, MyReports, Profile, Notifications, VerificationStatus remaining |
| 11 — Tests | ⏳ NOT STARTED | No `__tests__/` folder yet |
| 12 — Pipeline (cloud connect) | ⏳ NOT STARTED | CI/CD YAML files exist but secrets + accounts not yet wired — see PIPELINE.md |

### Additional files beyond the original plan (already on disk)

- `backend/src/errors/AppError.js` — custom error class + factory functions
- `backend/src/middlewares/security.js` — helmet + strict CORS + HPP + requestId
- `backend/src/constants/index.js` — magic numbers / strings centralized
- `backend/src/controllers/company.controller.js` — companion to companyRoutes.js

---

## PHASE 0 — Fix Critical Bugs (Do This First — Day 1 Morning)

### 0.1 Fix ESM/CJS Mismatch in app.js

CURRENT (broken):
```js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => { res.json({ status: 'ok' }); });
app.use('/api', router);
export default app;
```

FIXED:
```js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const router = require('./routes/index.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', router);

module.exports = app;
```

### 0.2 Fix ESM/CJS Mismatch in server.js

CURRENT (broken):
```js
import app from './app.js';
import process from 'process';
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
```

FIXED:
```js
const app = require('./app.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TrustBase API running on port ${PORT}`);
});
```

### 0.3 Add Scripts to backend/package.json

Add to "scripts":
```json
"start": "node src/server.js",
"dev": "nodemon src/server.js",
"test": "jest --testEnvironment=node",
"lint": "eslint src/**/*.js",
"lint:fix": "eslint src/**/*.js --fix"
```

Add devDependencies:
```json
"jest": "^29.0.0",
"supertest": "^6.0.0",
"nodemon": "^3.0.0"
```

---

## PHASE 1 — Config Layer — backend/src/config/ (Day 1 Afternoon)

### src/config/supabase.js
```js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
```

### src/config/twilio.js
```js
const twilio = require('twilio');

let client = null;

if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

module.exports = client;
```

### src/config/paystack.js
```js
const axios = require('axios');

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

module.exports = paystackApi;
```

---

## PHASE 2 — Database Schema (Day 2)

Run these SQL statements in your Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_type TEXT CHECK (verification_type IN ('individual', 'business')),
  trust_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (scam submissions)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  phone TEXT,
  business_name TEXT,
  scam_type TEXT NOT NULL CHECK (scam_type IN (
    'Online Marketplace Scam',
    'Fake Product / Non-delivery',
    'POS Fraud',
    'Investment / Ponzi',
    'Romantic Scam',
    'Loan / Finance Fraud',
    'Job / Recruitment Scam',
    'Other'
  )),
  description TEXT NOT NULL,
  amount_lost NUMERIC,
  anonymous BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upvotes on reports
CREATE TABLE report_upvotes (
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (report_id, user_id)
);

-- Verification applications
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('individual', 'business')),
  status TEXT DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment',
    'payment_received',
    'under_review',
    'approved',
    'rejected'
  )),
  paystack_ref TEXT UNIQUE,
  amount_paid NUMERIC,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reports_phone ON reports(phone);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_users_phone ON users(phone);
```

After running SQL:
- Go to Supabase Dashboard → Authentication → Policies
- Enable Row Level Security on all 4 tables
- The backend uses the service role key which bypasses RLS (this is correct)
- RLS protects your tables if the service role key is ever leaked from client side

---

## PHASE 3 — Utils Layer — backend/src/utils/ (Day 3 Morning)

### src/utils/response.js
```js
const success = (res, data, code = 200) =>
  res.status(code).json({ success: true, data });

const error = (res, message, code = 400) =>
  res.status(code).json({ success: false, message });

module.exports = { success, error };
```

### src/utils/validators.js
```js
const { z } = require('zod');

const nigerianPhone = z
  .string()
  .regex(/^(0[7-9][0-1]\d{8})$/, 'Must be a valid Nigerian phone number (e.g. 08012345678)');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: nigerianPhone,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  phone: nigerianPhone,
  password: z.string().min(1),
});

const reportSchema = z.object({
  phone: nigerianPhone.optional(),
  businessName: z.string().optional(),
  scamType: z.enum([
    'Online Marketplace Scam',
    'Fake Product / Non-delivery',
    'POS Fraud',
    'Investment / Ponzi',
    'Romantic Scam',
    'Loan / Finance Fraud',
    'Job / Recruitment Scam',
    'Other',
  ]),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  amountLost: z.number().positive().optional(),
  anonymous: z.boolean().default(false),
});

const verificationSchema = z.object({
  type: z.enum(['individual', 'business']),
});

module.exports = { signupSchema, loginSchema, reportSchema, verificationSchema };
```

### src/utils/risk.js
```js
const HIGH_RISK_TYPES = new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud']);
const MEDIUM_RISK_TYPES = new Set(['Online Marketplace Scam', 'Loan / Finance Fraud', 'Romantic Scam']);
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function computeRiskScore(reports) {
  if (!reports || reports.length === 0) {
    return { score: 0, level: 'low', tags: [] };
  }

  const now = Date.now();
  let score = 0;
  const tags = new Set();

  reports.forEach((report) => {
    const basePoints = HIGH_RISK_TYPES.has(report.scam_type)
      ? 25
      : MEDIUM_RISK_TYPES.has(report.scam_type)
      ? 15
      : 10;

    const isRecent = now - new Date(report.created_at).getTime() < THIRTY_DAYS_MS;
    score += isRecent ? basePoints * 1.5 : basePoints;

    if (report.scam_type) tags.add(report.scam_type.replace(' Scam', '').replace(' Fraud', ''));
    if (report.amount_lost > 100000) tags.add('Large Amount Lost');
  });

  if (reports.length >= 3) {
    score += 10;
    tags.add('Multiple Victims');
  }

  if (reports.some((r) => r.anonymous === false)) tags.add('Verified Reporter');

  score = Math.min(Math.round(score), 100);

  const level = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return { score, level, tags: [...tags] };
}

module.exports = { computeRiskScore };
```

### src/utils/otp.js
```js
const twilioClient = require('../config/twilio');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(phone, otp) {
  if (!twilioClient) {
    console.warn('Twilio not configured — OTP not sent');
    return;
  }

  const e164Phone = '+234' + phone.substring(1);

  await twilioClient.messages.create({
    body: `Your TrustBase verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: e164Phone,
  });
}

module.exports = { generateOTP, sendOTP };
```

---

## PHASE 4 — Middleware Layer — backend/src/middlewares/ (Day 3 Afternoon)

### src/middlewares/auth.js
```js
const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401);
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = header.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
}

module.exports = { verifyToken, optionalAuth };
```

### src/middlewares/validate.js
```js
const { error } = require('../utils/response');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      return error(res, messages, 422);
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = { validate };
```

### src/middlewares/rateLimit.js
Install first: npm install express-rate-limit
```js
const rateLimit = require('express-rate-limit');

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests. Slow down.' },
});

const reportRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Report limit reached. Try again in 1 hour.' },
});

module.exports = { authRateLimit, searchRateLimit, reportRateLimit };
```

---

## PHASE 5 — Model Layer — backend/src/models/ (Day 4)

### src/models/user.model.js
```js
const supabase = require('../config/supabase');

async function createUser({ name, phone, passwordHash }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, phone, password_hash: passwordHash })
    .select('id, name, phone, is_verified, trust_points, created_at')
    .single();
  if (error) throw error;
  return data;
}

async function findUserByPhone(phone) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, is_verified, verification_type, trust_points, created_at')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function updateUser(id, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', id)
    .select('id, name, phone, is_verified, trust_points')
    .single();
  if (error) throw error;
  return data;
}

async function incrementTrustPoints(id, points) {
  const { error } = await supabase.rpc('increment_trust_points', {
    user_id: id,
    points,
  });
  if (error) throw error;
}

module.exports = { createUser, findUserByPhone, findUserById, updateUser, incrementTrustPoints };
```

Note: Create this Supabase function in SQL editor:
```sql
CREATE OR REPLACE FUNCTION increment_trust_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
  UPDATE users SET trust_points = trust_points + points WHERE id = user_id;
$$ LANGUAGE SQL;
```

### src/models/report.model.js
```js
const supabase = require('../config/supabase');

async function createReport(data) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return report;
}

async function getReportsByPhone(phone) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('phone', phone)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function getRecentReports({ page = 1, limit = 20 } = {}) {
  const from = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);
  if (error) throw error;
  return { reports: data, total: count };
}

async function upvoteReport(reportId, userId) {
  const { error } = await supabase
    .from('report_upvotes')
    .upsert({ report_id: reportId, user_id: userId });
  if (error) throw error;
}

async function getUpvoteCount(reportId) {
  const { count, error } = await supabase
    .from('report_upvotes')
    .select('*', { count: 'exact', head: true })
    .eq('report_id', reportId);
  if (error) throw error;
  return count;
}

module.exports = { createReport, getReportsByPhone, getRecentReports, upvoteReport, getUpvoteCount };
```

### src/models/verification.model.js
```js
const supabase = require('../config/supabase');

async function createVerification({ userId, type, paystackRef }) {
  const { data, error } = await supabase
    .from('verifications')
    .insert({ user_id: userId, type, paystack_ref: paystackRef })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getVerificationByUserId(userId) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

async function updateVerificationStatus(id, status) {
  const { data, error } = await supabase
    .from('verifications')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getVerificationByPaystackRef(ref) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('paystack_ref', ref)
    .single();
  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

module.exports = {
  createVerification,
  getVerificationByUserId,
  updateVerificationStatus,
  getVerificationByPaystackRef,
};
```

### src/models/company.model.js
```js
const supabase = require('../config/supabase');

async function searchEntities(query) {
  const { data, error } = await supabase
    .from('reports')
    .select('phone, business_name, scam_type, risk_level, created_at')
    .or(`phone.ilike.%${query}%,business_name.ilike.%${query}%`)
    .eq('status', 'published')
    .limit(20);
  if (error) throw error;
  return data;
}

async function getVerifiedUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('is_verified', true)
    .order('trust_points', { ascending: false });
  if (error) throw error;
  return data;
}

async function getVerifiedUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, phone, verification_type, trust_points, created_at')
    .eq('id', id)
    .eq('is_verified', true)
    .single();
  if (error) throw error;
  return data;
}

module.exports = { searchEntities, getVerifiedUsers, getVerifiedUserById };
```

---

## PHASE 6 — Service Layer — backend/src/services/ (Day 5)

### src/services/auth.service.js
```js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByPhone } = require('../models/user.model');

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function signup({ name, phone, password }) {
  const existing = await findUserByPhone(phone);
  if (existing) {
    const err = new Error('Phone number already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ name, phone, passwordHash });
  const token = generateToken(user.id);

  return { token, user };
}

async function login({ phone, password }) {
  const user = await findUserByPhone(phone);
  if (!user) {
    const err = new Error('Invalid phone number or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid phone number or password');
    err.statusCode = 401;
    throw err;
  }

  const { password_hash, ...safeUser } = user;
  const token = generateToken(user.id);

  return { token, user: safeUser };
}

module.exports = { signup, login };
```

### src/services/report.service.js
```js
const { createReport, getReportsByPhone, getRecentReports } = require('../models/report.model');
const { incrementTrustPoints } = require('../models/user.model');
const { computeRiskScore } = require('../utils/risk');

async function submitReport(data, userId) {
  const HIGH_RISK_TYPES = new Set(['Investment / Ponzi', 'Job / Recruitment Scam', 'POS Fraud']);
  const riskLevel = HIGH_RISK_TYPES.has(data.scamType) ? 'high' : 'medium';

  const report = await createReport({
    reporter_id: userId || null,
    phone: data.phone || null,
    business_name: data.businessName || null,
    scam_type: data.scamType,
    description: data.description,
    amount_lost: data.amountLost || null,
    anonymous: data.anonymous || false,
    risk_level: riskLevel,
    status: 'pending',
  });

  if (userId) {
    await incrementTrustPoints(userId, 10);
  }

  return report;
}

async function searchEntity(query) {
  const existingReports = await getReportsByPhone(query);
  const riskAssessment = computeRiskScore(existingReports);

  return {
    query,
    reports: existingReports,
    riskAssessment,
  };
}

module.exports = { submitReport, searchEntity };
```

### src/services/verification.service.js
```js
const crypto = require('crypto');
const paystackApi = require('../config/paystack');
const {
  createVerification,
  getVerificationByUserId,
  updateVerificationStatus,
  getVerificationByPaystackRef,
} = require('../models/verification.model');
const { updateUser } = require('../models/user.model');

const PRICES = { individual: 200000, business: 500000 };

async function initiateVerification(userId, type) {
  const existing = await getVerificationByUserId(userId);
  if (existing && existing.status === 'approved') {
    const err = new Error('Already verified');
    err.statusCode = 409;
    throw err;
  }

  const paystackRef = `TB-${userId.slice(0, 8)}-${Date.now()}`;

  const response = await paystackApi.post('/transaction/initialize', {
    amount: PRICES[type],
    currency: 'NGN',
    reference: paystackRef,
    callback_url: `${process.env.FRONTEND_URL}/verification-status`,
    metadata: { userId, type },
  });

  await createVerification({ userId, type, paystackRef });

  return {
    paymentUrl: response.data.data.authorization_url,
    reference: paystackRef,
  };
}

async function handlePaystackWebhook(rawBody, signature) {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    const err = new Error('Invalid webhook signature');
    err.statusCode = 401;
    throw err;
  }

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const ref = event.data.reference;
    const verification = await getVerificationByPaystackRef(ref);

    if (verification) {
      await updateVerificationStatus(verification.id, 'payment_received');
    }
  }
}

async function approveVerification(verificationId, userId, type) {
  await updateVerificationStatus(verificationId, 'approved');
  await updateUser(userId, { is_verified: true, verification_type: type });
}

module.exports = { initiateVerification, handlePaystackWebhook, approveVerification };
```

---

## PHASE 7 — Controller Layer — backend/src/controllers/ (Day 6)

### src/controllers/auth.controller.js
```js
const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.validatedBody);
    success(res, result, 201);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.validatedBody);
    success(res, result);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
}

module.exports = { signup, login };
```

### src/controllers/user.controller.js
```js
const { findUserById, updateUser } = require('../models/user.model');
const { success, error } = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const user = await findUserById(req.user.sub);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'phone'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const user = await updateUser(req.user.sub, updates);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
```

### src/controllers/review.controller.js
```js
const reportService = require('../services/report.service');
const { getRecentReports, upvoteReport } = require('../models/report.model');
const { success, error } = require('../utils/response');

async function submitReport(req, res, next) {
  try {
    const userId = req.user ? req.user.sub : null;
    const report = await reportService.submitReport(req.validatedBody, userId);
    success(res, { report }, 201);
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await getRecentReports({ page, limit });
    success(res, result);
  } catch (err) {
    next(err);
  }
}

async function searchEntity(req, res, next) {
  try {
    const { q } = req.query;
    if (!q || q.length < 3) return error(res, 'Query must be at least 3 characters', 400);
    const result = await reportService.searchEntity(q);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

async function upvote(req, res, next) {
  try {
    await upvoteReport(req.params.id, req.user.sub);
    success(res, { message: 'Upvoted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitReport, getReports, searchEntity, upvote };
```

### src/controllers/verification.controller.js
```js
const verificationService = require('../services/verification.service');
const { getVerificationByUserId } = require('../models/verification.model');
const { success, error } = require('../utils/response');

async function initiate(req, res, next) {
  try {
    const { type } = req.validatedBody;
    const result = await verificationService.initiateVerification(req.user.sub, type);
    success(res, result);
  } catch (err) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    next(err);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature'];
    await verificationService.handlePaystackWebhook(req.rawBody, signature);
    res.sendStatus(200);
  } catch (err) {
    if (err.statusCode === 401) return res.sendStatus(401);
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const verification = await getVerificationByUserId(req.user.sub);
    success(res, { verification });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiate, webhook, getStatus };
```

---

## PHASE 8 — Route Files — backend/src/routes/ (Day 6)

### src/routes/authRoutes.js
```js
const { Router } = require('express');
const { signup, login } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate');
const { authRateLimit } = require('../middlewares/rateLimit');
const { signupSchema, loginSchema } = require('../utils/validators');

const router = Router();

router.post('/signup', authRateLimit, validate(signupSchema), signup);
router.post('/login', authRateLimit, validate(loginSchema), login);

module.exports = router;
```

### src/routes/userRoutes.js
```js
const { Router } = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);

module.exports = router;
```

### src/routes/reviewRoutes.js
```js
const { Router } = require('express');
const { submitReport, getReports, searchEntity, upvote } = require('../controllers/review.controller');
const { verifyToken, optionalAuth } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { reportRateLimit, searchRateLimit } = require('../middlewares/rateLimit');
const { reportSchema } = require('../utils/validators');

const router = Router();

router.post('/', optionalAuth, reportRateLimit, validate(reportSchema), submitReport);
router.get('/', searchRateLimit, getReports);
router.get('/search', searchRateLimit, searchEntity);
router.post('/:id/upvote', verifyToken, upvote);

module.exports = router;
```

### src/routes/companyRoutes.js
```js
const { Router } = require('express');
const { searchCompanies, getVerified, getById } = require('../controllers/company.controller');
const { searchRateLimit } = require('../middlewares/rateLimit');

const router = Router();

router.get('/search', searchRateLimit, searchCompanies);
router.get('/verified', getVerified);
router.get('/:id', getById);

module.exports = router;
```

### Update src/routes/index.js (fix to use local files)
```js
const { Router } = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');
const companyRoutes = require('./companyRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/companies', companyRoutes);

module.exports = router;
```

Also create verifyRoutes.js:
```js
const { Router } = require('express');
const { initiate, webhook, getStatus } = require('../controllers/verification.controller');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { verificationSchema } = require('../utils/validators');

const router = Router();

router.post('/initiate', verifyToken, validate(verificationSchema), initiate);
router.post('/webhook', webhook);
router.get('/status', verifyToken, getStatus);

module.exports = router;
```

Add to routes/index.js:
```js
const verifyRoutes = require('./verifyRoutes');
router.use('/verify', verifyRoutes);
```

---

## PHASE 9 — Socket.io — backend/src/sockets/index.js (Day 7)

```js
const { Server } = require('socket.io');

let io = null;

function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {});
  });

  return io;
}

function emitNewReport(payload) {
  if (io) io.emit('new_report', payload);
}

function emitVerificationUpdate(payload) {
  if (io) io.emit('verification_update', payload);
}

module.exports = { initSockets, emitNewReport, emitVerificationUpdate };
```

---

## PHASE 10 — Frontend Integration (Day 8)

### Create trustbase/src/lib/api.js
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const token = localStorage.getItem('trustbase_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (res.status === 401) {
    localStorage.removeItem('trustbase_token');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) throw new Error(data.message || 'Request failed');

  return data.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
};
```

### Update App.jsx — Restore auth on mount
Add to App.jsx:
```jsx
import { useEffect } from 'react';
import { api } from './lib/api';

// Inside App():
useEffect(() => {
  const token = localStorage.getItem('trustbase_token');
  if (token) {
    api.get('/api/users/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => localStorage.removeItem('trustbase_token'));
  }
}, []);
```

### Update Login.jsx — Real API call
Replace handleSubmit:
```jsx
import { api } from '../lib/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await api.post('/api/auth/login', formData);
    localStorage.setItem('trustbase_token', result.token);
    onLogin();
    navigate('/home');
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};
```

Do the same pattern for Signup.jsx (POST /api/auth/signup).

---

## PHASE 11 — Tests (Day 9)

### Install test deps
```sh
cd backend
npm install -D jest supertest
```

### Create backend/src/__tests__/auth.test.js
```js
const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/signup', () => {
  it('returns 422 for invalid phone', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      phone: '12345',
      password: 'password123',
    });
    expect(res.status).toBe(422);
  });

  it('returns 201 for valid signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      phone: `080${Date.now().toString().slice(-8)}`,
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
  });
});
```

---

## PHASE 12 — Pipeline / Cloud Connection

**See `PIPELINE.md` for the full step-by-step beginner walkthrough.** That document
covers:

1. ESLint + Prettier (rules, VS Code integration)
2. Husky + lint-staged + commitlint (commit-time enforcement)
3. SonarCloud (account, project import, token, quality gate)
4. Sentry (frontend + backend DSN, init code, verification)
5. Supabase test project (separate from production)
6. Twilio account + phone number + .env wiring
7. Paystack test mode + webhook URL + ngrok for local testing
8. GitHub repository secrets (the master vault — full list of 13 secrets)
9. Vercel deploy (project link, env vars, getting Vercel IDs)
10. Railway deploy (root dir, start command, env vars, getting token)
11. Branch protection rules on `main`
12. Custom domain (optional — defer until launch)

Required outcomes of Phase 12:
- `git push origin main` triggers a successful deploy to Vercel + Railway
- `/health` returns 200 on the live backend URL
- A test commit on a PR runs through CI green: frontend build + backend test +
  SonarCloud + CodeQL
- A forced error in production is captured in Sentry within 1 minute
- A test signup creates a row in the production Supabase `users` table

Use Sonnet 4.6 for the code edits (Sentry init, .env updates).
Use Haiku 4.5 for the documentation work after each sub-step.
Use Opus 4.7 only for the branch-protection-rules decision and
Paystack webhook security verification.

---

## Implementation Timeline

| Day | Phase | Description |
|-----|-------|-------------|
| 1 AM | 0 | Fix ESM/CJS bugs |
| 1 PM | 1 | Config layer |
| 2 | 2 | Database schema in Supabase |
| 3 AM | 3 | Utils (validators, response, OTP, risk) |
| 3 PM | 4 | Middlewares (auth, validate, rateLimit) |
| 4 | 5 | Models (DB queries) |
| 5 | 6 | Services (business logic) |
| 6 | 7+8 | Controllers + Routes |
| 7 | 9 | Socket.io + manual API testing |
| 8 | 10 | Frontend integration (see Phase 10 sub-tasks in TASK_MODEL_MAP Part C) |
| 9 | 11 | Tests (Jest + Supertest, target 70% coverage) |
| 10 | 12 | Pipeline (see PIPELINE.md — accounts + secrets + first deploy) |

---

## Phase 10 — Remaining Sub-tasks (as of 2026-05-18)

Phase 10 is partially done. The remaining frontend pages each need a small
swap from mock data / setTimeout to real `api.get` / `api.post` calls.

| Sub-task | File | Endpoint | Status |
|---|---|---|---|
| 10a | `src/lib/api.js` | — | ✅ DONE |
| 10b | `Login.jsx` | POST /api/auth/login | ✅ DONE |
| 10c | `Signup.jsx` | POST /api/auth/signup | ✅ DONE |
| 10d | `App.jsx` | localStorage token restore | ✅ DONE |
| 10e | `Home.jsx` | GET /api/reviews | 🔄 UNCOMMITTED |
| 10e | `SearchResults.jsx` | GET /api/companies/search | 🔄 UNCOMMITTED |
| 10f | `ReportScam.jsx` | POST /api/reviews | ✅ DONE |
| 10g | `GetVerified.jsx` | POST /api/verify/initiate | ✅ DONE |
| 10h | `ReportsList.jsx` | GET /api/reviews (paginated) | ⏳ TODO |
| 10i | `MyReports.jsx` | GET /api/reviews/mine (need endpoint) | ⏳ TODO |
| 10j | `Profile.jsx` | GET/PUT /api/users/me | ⏳ TODO |
| 10k | `VerificationStatus.jsx` | GET /api/verify/status | ⏳ TODO |
| 10l | `Notifications.jsx` | Socket.io client `new_report` event | ⏳ TODO |
| 10m | Protected route guard | wraps each protected `<Route>` | ⏳ TODO |

All "TODO" sub-tasks above should be done in the `trustbase-frontend` worktree
on the `feature/frontend` branch using Sonnet 4.6. Each is a single-file
change under ~30 lines once you know the pattern (see `Login.jsx` or
`ReportScam.jsx` for the template).
