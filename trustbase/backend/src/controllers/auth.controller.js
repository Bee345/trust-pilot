const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

async function signup(req, res, next) {
  try {
    const result = await authService.signup(req.validatedBody);
    success(res, result, 201);
  } catch (err) {
    if (err.isOperational) return error(res, err.message, err.statusCode);
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.validatedBody);
    success(res, result);
  } catch (err) {
    if (err.isOperational) return error(res, err.message, err.statusCode);
    next(err);
  }
}

module.exports = { signup, login };
