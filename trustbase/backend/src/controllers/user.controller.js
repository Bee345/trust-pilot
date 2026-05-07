const { findUserById, updateUser } = require('../models/user.model');
const { success } = require('../utils/response');

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
