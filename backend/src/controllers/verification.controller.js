const verificationService = require('../services/verification.service');
const { success, error } = require('../utils/response');

async function initiate(req, res, next) {
  try {
    const { type } = req.validatedBody;
    const result = await verificationService.initiateVerification(req.user.sub, type);
    return success(res, result);
  } catch (err) {
    if (err.isOperational) {return error(res, err.message, err.statusCode);}
    return next(err);
  }
}

function webhook(req, res, next) {
  try {
    const signature = req.headers['x-paystack-signature'];
    verificationService.handlePaystackWebhook(req.body, signature);
    return res.sendStatus(200);
  } catch (err) {
    if (err.isOperational && err.statusCode === 401) {return res.sendStatus(401);}
    return next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const verification = await verificationService.getVerificationStatus(req.user.sub);
    success(res, { verification });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiate, webhook, getStatus };
