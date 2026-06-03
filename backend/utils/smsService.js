let twilio;
try {
  twilio = require('twilio');
} catch {
  twilio = null;
}

/**
 * Send an SMS via Twilio
 * Falls back to mock/log mode if Twilio credentials are not set
 * @param {string} to - Recipient phone number (with country code, e.g., +919876543210)
 * @param {string} message - SMS message body
 */
const sendSMS = async (to, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Mock mode if Twilio not configured
  if (!accountSid || accountSid === 'your_twilio_account_sid' || !twilio) {
    console.log('\n📱 [SMS MOCK] ────────────────────────────────');
    console.log(`   To: ${to}`);
    console.log(`   Message: ${message}`);
    console.log('──────────────────────────────────────────────\n');
    return { sid: `mock_sms_${Date.now()}` };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: to.startsWith('+') ? to : `+91${to}`,
    });
    return result;
  } catch (error) {
    console.error(`SMS send failed: ${error.message}`);
    // Non-blocking — don't throw, just log
    return null;
  }
};

module.exports = { sendSMS };
