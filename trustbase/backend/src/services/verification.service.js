const crypto = require('crypto');
const paystackApi = require('../config/paystack');
const {
  createVerification,
  getVerificationByUserId,
  updateVerificationStatus,
  getVerificationByPaystackRef,
} = require('../models/verification.model');
const { updateUser } = require('../models/user.model');
const { conflict, unauthorized } = require('../errors/AppError');

const PRICES = { individual: 200000, business: 500000 };

async function initiateVerification(userId, type) {
  const existing = await getVerificationByUserId(userId);
  if (existing && existing.status === 'approved') throw conflict('Already verified');

  const paystackRef = `TB-${userId.slice(0, 8)}-${Date.now()}`;

  const response = await paystackApi.post('/transaction/initialize', {
    amount: PRICES[type],
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

async function handlePaystackWebhook(rawBody, signature) {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) throw unauthorized('Invalid webhook signature');

  const event = JSON.parse(rawBody);

  if (event.event === 'charge.success') {
    const ref = event.data.reference;
    const verification = await getVerificationByPaystackRef(ref);

    if (verification) {
      await updateVerificationStatus(verification.id, 'payment_received');
    }
  }
}

async function approveVerification(verificationId, userId, type) {
  await updateVerificationStatus(verificationId, 'approved');
  await updateUser(userId, { is_verified: true, verification_type: type });
}

module.exports = { initiateVerification, handlePaystackWebhook, approveVerification };
