const twilioClient = require('../config/twilio');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(phone, otp) {
  if (!twilioClient) {return;}

  const e164Phone = '+234' + phone.substring(1);

  await twilioClient.messages.create({
    body: `Your TrustBase verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: e164Phone,
  });
}

module.exports = { generateOTP, sendOTP };
