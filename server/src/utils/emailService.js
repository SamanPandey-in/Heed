// Email sending utility using Nodemailer

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP configuration on startup
transporter.verify((err, success) => {
  if (err) {
    console.warn('[Email] SMTP not configured or connection failed:', err.message);
  } else if (success) {
    console.log('[Email] SMTP configured and ready');
  }
});

/**
 * Send password reset email
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} clientOrigin - Frontend origin for reset link
 */
export const sendPasswordResetEmail = async (toEmail, resetToken, clientOrigin) => {
  const resetLink = `${clientOrigin}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Password Reset Request - Heed',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 4px; margin: 15px 0; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hi,</p>
              <p>We received a request to reset your Heed password. Click the button below to create a new password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p style="margin-top: 20px;">Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <strong>Security note:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </div>
              
              <p style="margin-top: 30px; color: #666;">Best regards,<br/>The Heed Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send password reset email:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send welcome email on user registration
 * @param {string} toEmail - User email
 * @param {string} fullName - User full name
 * @param {string} clientOrigin - Frontend origin
 */
export const sendWelcomeEmail = async (toEmail, fullName, clientOrigin) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Welcome to Heed!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">Welcome to Heed, ${fullName}! 🎉</h2>
            </div>
            <div class="content">
              <p>Thank you for joining Heed. We're excited to have you on board!</p>
              <p>You can now start collaborating with your team on projects and tasks. Explore the dashboard and create your first team to get started.</p>
              <p style="margin-top: 30px; color: #666;">If you have any questions, feel free to reach out to our support team.</p>
              <p style="margin-top: 30px; color: #666;">Best regards,<br/>The Heed Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send welcome email:', err);
    return { success: false, error: err.message };
  }
};
