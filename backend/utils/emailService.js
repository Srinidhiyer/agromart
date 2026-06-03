const nodemailer = require('nodemailer');

/**
 * Create Nodemailer transporter
 * Falls back to mock/log mode if SMTP credentials are not set
 */
const createTransporter = () => {
  if (!process.env.SMTP_EMAIL || process.env.SMTP_EMAIL === 'your_email@gmail.com') {
    // Mock transporter for development
    return {
      sendMail: async (options) => {
        console.log('\n📧 [EMAIL MOCK] ─────────────────────────────');
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log('─────────────────────────────────────────────\n');
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send an email
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'AgroMart'}" <${process.env.FROM_EMAIL || 'noreply@agromart.com'}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''), // strip HTML for plain text
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendEmail };
