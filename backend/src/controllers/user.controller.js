const userService = require('../services/user.service');
const { success } = require('../utils/response');

async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.sub);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateProfile(req.user.sub, req.validatedBody);
    success(res, { user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
