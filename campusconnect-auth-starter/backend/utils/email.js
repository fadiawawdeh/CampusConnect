import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();

const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

export const sendEmail = async ({ to, subject, html, fallbackUrl = null }) => {
  if (!smtpConfigured) {
    console.log('\n[CampusConnect email skipped: SMTP not configured]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (fallbackUrl) console.log(`Action URL: ${fallbackUrl}`);
    return {
      sent: false,
      mode: 'development',
      fallbackUrl
    };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || smtpUser,
    to,
    subject,
    html
  });

  return {
    sent: true,
    mode: 'smtp',
    fallbackUrl: null
  };
};
