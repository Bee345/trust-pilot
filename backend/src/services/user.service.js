const { findUserById, updateUser } = require('../models/user.model');

async function getProfile(userId) {
  return findUserById(userId);
}

async function updateProfile(userId, fields) {
  const allowed = ['name'];
  const updates = Object.fromEntries(
    Object.entries(fields).filter(([k]) => allowed.includes(k)),
  );
  return updateUser(userId, updates);
}

module.exports = { getProfile, updateProfile };
