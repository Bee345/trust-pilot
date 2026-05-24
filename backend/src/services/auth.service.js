'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByPhone } = require('../models/user.model');
const { createAuditLog } = require('../models/audit.model');
const { conflict, unauthorized } = require('../errors/AppError');
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRY, AUDIT_ACTIONS } = require('../constants');

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
  const user = await findUserByPhone(phone);
  if (!user) {
    createAuditLog({ action: AUDIT_ACTIONS.USER_LOGIN_FAILED, entity: 'users', ipAddress: context.ipAddress, userAgent: context.userAgent, metadata: { reason: 'invalid_credentials' } });
    throw unauthorized('Invalid phone number or password');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    createAuditLog({ action: AUDIT_ACTIONS.USER_LOGIN_FAILED, entity: 'users', ipAddress: context.ipAddress, userAgent: context.userAgent, metadata: { reason: 'invalid_credentials' } });
    throw unauthorized('Invalid phone number or password');
  }

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
