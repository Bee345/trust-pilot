'use strict';

const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');

async function signup(req, res, next) {
  try {
    const context = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.signup(req.validatedBody, context);
    return success(res, result, 201);
  } catch (err) {
    if (err.isOperational) {return error(res, err.message, err.statusCode);}
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const context = { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
    const result = await authService.login(req.validatedBody, context);
    return success(res, result);
  } catch (err) {
    if (err.isOperational) {return error(res, err.message, err.statusCode);}
    return next(err);
  }
}

module.exports = { signup, login };
