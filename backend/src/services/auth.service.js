'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByPhone } = require('../models/user.model');
const { createAuditLog } = require('../models/audit.model');
const { conflict, unauthorized, tooManyRequests } = require('../errors/AppError');
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRY, AUDIT_ACTIONS } = require('../constants');

const LOCKOUT_WINDOWS_MS = [
  5 * 60 * 1000,
  20 * 60 * 1000,
  40 * 60 * 1000,
  120 * 60 * 1000,
];

const loginAttempts = new Map();

function checkLockout(phone) {
  const record = loginAttempts.get(phone);
  if (!record || !record.lockUntil || record.lockUntil <= Date.now()) {return;}
  const minutesLeft = Math.ceil((record.lockUntil - Date.now()) / 60000);
  throw tooManyRequests(`Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`);
}

function recordFailedAttempt(phone) {
  const record = loginAttempts.get(phone) || { count: 0, lockUntil: null };
  record.count += 1;
  const windowIdx = Math.min(record.count - 1, LOCKOUT_WINDOWS_MS.length - 1);
  record.lockUntil = Date.now() + LOCKOUT_WINDOWS_MS[windowIdx];
  loginAttempts.set(phone, record);
}

function handleLoginFailure(phone, context) {
  recordFailedAttempt(phone);
  createAuditLog({
    action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
    entity: 'users',
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    metadata: { reason: 'invalid_credentials' },
  });
  throw unauthorized('Invalid phone number or password');
}

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

async function signup({ name, phone, password }, context = {}) {
  const existing = await findUserByPhone(phone);
  if (existing) {throw conflict('Phone number already registered');}

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({ name, phone, passwordHash });
  const token = generateToken(user.id);

  createAuditLog({
    userId: user.id,
    action: AUDIT_ACTIONS.USER_SIGNUP,
    entity: 'users',
    entityId: user.id,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return { token, user };
}

async function login({ phone, password }, context = {}) {
  checkLockout(phone);

  const user = await findUserByPhone(phone);
  if (!user) {handleLoginFailure(phone, context);}

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {handleLoginFailure(phone, context);}

  loginAttempts.delete(phone);
  const { password_hash, ...safeUser } = user;
  const token = generateToken(user.id);

  createAuditLog({
    userId: user.id,
    action: AUDIT_ACTIONS.USER_LOGIN,
    entity: 'users',
    entityId: user.id,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  return { token, user: safeUser };
}

module.exports = { signup, login };
