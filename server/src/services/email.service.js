// ============================================================================
// SERVICES - Email Service
// ============================================================================

import nodemailer from 'nodemailer';
import config from '../config/index.js';
import { logger } from '../config/logger.js';

// Create transporter (lazy initialization)
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  // If SMTP is configured, use it
  if (config.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT || 587,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  } else {
    // Use Ethereal for development (fake SMTP)
    // eslint-disable-next-line no-unused-vars
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: config.SMTP_FROM || '"Heed Team" <noreply@heed.app>',
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your Heed account.</p>
        <p>Click the button below to reset your password:</p>
        <p><a href="${resetUrl}" class="button">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, 'Reset Your Password - Heed', html);
};

export default { sendEmail, sendPasswordResetEmail };
