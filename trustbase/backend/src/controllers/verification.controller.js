const verificationService = require('../services/verification.service');
const { getVerificationByUserId } = require('../models/verification.model');
const { success, error } = require('../utils/response');

async function initiate(req, res, next) {
  try {
    const { type } = req.validatedBody;
    const result = await verificationService.initiateVerification(req.user.sub, type);
    success(res, result);
  } catch (err) {
    if (err.isOperational) return error(res, err.message, err.statusCode);
    next(err);
  }
}

async function webhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature'];
    // req.body is a Buffer from express.raw() — passed directly for HMAC computation
    await verificationService.handlePaystackWebhook(req.body, signature);
    res.sendStatus(200);
  } catch (err) {
    if (err.isOperational && err.statusCode === 401) return res.sendStatus(401);
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
