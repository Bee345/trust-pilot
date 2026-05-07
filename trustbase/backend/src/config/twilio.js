const twilio = require('twilio');

let client = null;

if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

module.exports = client;
