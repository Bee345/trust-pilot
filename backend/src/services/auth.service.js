const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByPhone } = require('../models/user.model');
const { conflict, unauthorized } = require('../errors/AppError');
const { BCRYPT_SALT_ROUNDS, JWT_EXPIRY } = require('../constants');

function generateToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

async function signup({ name, phone, password }) {
  const existing = await findUserByPhone(phone);
  if (existing) {throw conflict('Phone number already registered');}

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await createUser({ name, phone, passwordHash });
  const token = generateToken(user.id);

  return { token, user };
}

async function login({ phone, password }) {
  const user = await findUserByPhone(phone);
  if (!user) {throw unauthorized('Invalid phone number or password');}

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {throw unauthorized('Invalid phone number or password');}

  const { password_hash, ...safeUser } = user;
  const token = generateToken(user.id);

  return { token, user: safeUser };
}

module.exports = { signup, login };
