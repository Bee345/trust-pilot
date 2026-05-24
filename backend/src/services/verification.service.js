const crypto = require('crypto');
const paystackApi = require('../config/paystack');
const {
  createVerification,
  getVerificationByUserId,
  updateVerificationStatus,
  getVerificationByPaystackRef,
} = require('../models/verification.model');
const { updateUser } = require('../models/user.model');
const { emitVerificationUpdate } = require('../sockets');
const { conflict, unauthorized } = require('../errors/AppError');
const { VERIFICATION_PRICES_KOBO, VERIFICATION_STATUS } = require('../constants');

async function initiateVerification(userId, type) {
  const existing = await getVerificationByUserId(userId);
  if (existing && existing.status === VERIFICATION_STATUS.APPROVED) {
    throw conflict('Already verified');
  }

  const paystackRef = `TB-${userId.slice(0, 8)}-${Date.now()}`;

  const response = await paystackApi.post('/transaction/initialize', {
    amount: VERIFICATION_PRICES_KOBO[type],
    currency: 'NGN',
    reference: paystackRef,
    callback_url: `${process.env.FRONTEND_URL}/verification-status`,
    metadata: { userId, type },
  });

  await createVerification({ userId, type, paystackRef });

  return {
    paymentUrl: response.data.data.authorization_url,
    reference: paystackRef,
  };
}

function verifyHmac(rawBody, signature) {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex');
  if (hash !== signature) {throw unauthorized('Invalid webhook signature');}
}

async function processWebhookEvent(rawBody) {
  const event = JSON.parse(rawBody);
  if (event.event !== 'charge.success') {return;}

  const ref = event.data.reference;
  const verification = await getVerificationByPaystackRef(ref);
  if (!verification) {return;}

  const updated = await updateVerificationStatus(
    verification.id,
    VERIFICATION_STATUS.PAYMENT_RECEIVED,
  );
  emitVerificationUpdate({ verificationId: updated.id, status: updated.status });
}

function handlePaystackWebhook(rawBody, signature) {
  verifyHmac(rawBody, signature);
  // Respond 200 immediately — process async so Paystack never times out
  setImmediate(() => processWebhookEvent(rawBody));
}

async function getVerificationStatus(userId) {
  return getVerificationByUserId(userId);
}

async function approveVerification(verificationId, userId, type) {
  const updated = await updateVerificationStatus(verificationId, VERIFICATION_STATUS.APPROVED);
  await updateUser(userId, { is_verified: true, verification_type: type });
  emitVerificationUpdate({ verificationId, status: VERIFICATION_STATUS.APPROVED });
  return updated;
}

module.exports = {
  initiateVerification,
  handlePaystackWebhook,
  getVerificationStatus,
  approveVerification,
};
