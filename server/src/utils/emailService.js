import { BrevoClient } from '@getbrevo/brevo';

const API_KEY = process.env.BREVO_API_KEY || '';
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER || '';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Heed';

let brevoClient = null;

const getBrevoClient = () => {
  if (!API_KEY) {
    console.warn('[Email] BREVO_API_KEY is missing. Transactional emails are disabled.');
    return null;
  }

  if (!brevoClient) {
    brevoClient = new BrevoClient({ apiKey: API_KEY });
    console.log('[Email] Brevo transactional email client configured.');
  }

  return brevoClient;
};

const getErrorMessage = (error) => {
  const brevoBody = error?.response?.body;

  if (typeof brevoBody === 'string' && brevoBody) {
    return brevoBody;
  }

  if (brevoBody?.message) {
    return brevoBody.message;
  }

  return error?.message || 'Unknown email error';
};

const sendEmail = async ({ toEmail, subject, html }) => {
  const client = getBrevoClient();

  if (!client) {
    return { success: false, error: 'Email service is not configured' };
  }

  if (!SENDER_EMAIL) {
    console.warn('[Email] BREVO_SENDER_EMAIL is missing. Transactional emails are disabled.');
    return { success: false, error: 'Email sender is not configured' };
  }

  try {
    const response = await client.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: toEmail }],
    });

    const messageId = response?.data?.messageId || response?.messageId || null;

    return { success: true, messageId };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('[Email] Failed to send transactional email:', message);
    return { success: false, error: message };
  }
};

export const validateEmailConfiguration = () => {
  const missing = [];

  if (!process.env.BREVO_API_KEY) {
    missing.push('BREVO_API_KEY');
  }

  if (!process.env.BREVO_SENDER_EMAIL && !process.env.SMTP_FROM && !process.env.SMTP_USER) {
    missing.push('BREVO_SENDER_EMAIL');
  }

  if (missing.length > 0) {
    console.warn(
      `[Email] Brevo configuration incomplete. Missing: ${missing.join(', ')}. Email sending is disabled until configured.`,
    );
    return { configured: false, missing };
  }

  console.log('[Email] Brevo configuration validated. Transactional email is enabled.');
  return { configured: true, missing: [] };
};

export const sendPasswordResetEmail = async (toEmail, resetToken, clientOrigin) => {
  const resetLink = `${clientOrigin}/reset-password?token=${resetToken}`;

  const subject = 'Password Reset Request - Heed';
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 28px 24px; border-radius: 10px 10px 0 0; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #fff; }
            .content { background: #f9f9f9; padding: 32px 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 24px 0; }
            .link-box { background: #f0f0f0; padding: 12px; border-radius: 6px;
                         font-family: monospace; font-size: 12px; word-break: break-all; margin: 12px 0; }
            .footer { font-size: 12px; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
            .warning { background: #fffbeb; border: 1px solid #fcd34d; padding: 12px 16px;
                       border-radius: 6px; font-size: 14px; margin: 16px 0; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Heed</div>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">Password Reset Request</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; color: #111;">Reset your password</h2>
              <p>Hi,</p>
              <p>We received a request to reset your Heed password. Click the button below to create a new password:</p>
              
              <a href="${resetLink}" class="button">Reset Password</a>
              
              <p style="margin-top: 20px; color: #555; font-size: 14px;">Or copy and paste this link in your browser:</p>
              <div class="link-box">${resetLink}</div>
              
              <div class="warning">
                <strong>Security note:</strong> This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </div>
              
              <p style="margin-top: 28px; color: #666; font-size: 14px;">Best regards,<br/>The Heed Team</p>
            </div>
            <div class="footer">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
      </html>
    `;

  const result = await sendEmail({ toEmail, subject, html });

  if (result.success) {
    console.log('[Email] Password reset email sent:', result.messageId);
  }

  return result;
};

export const sendWelcomeEmail = async (toEmail, fullName, clientOrigin) => {
  const subject = 'Welcome to Heed!';
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 28px 24px; border-radius: 10px 10px 0 0; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #fff; }
            .content { background: #f9f9f9; padding: 32px 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee; }
            .footer { font-size: 12px; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Heed</div>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">Welcome onboard!</p>
            </div>
            <div class="content">
              <h2 style="margin-top: 0; color: #111;">Welcome to Heed, ${fullName}! 🎉</h2>
              <p>Thank you for joining Heed. We're excited to have you on board!</p>
              <p>You can now start collaborating with your team on projects and tasks. Explore the dashboard and create your first team to get started.</p>
              <p style="margin-top: 20px; color: #555; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
              <p style="margin-top: 28px; color: #666; font-size: 14px;">Best regards,<br/>The Heed Team</p>
            </div>
            <div class="footer">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
      </html>
    `;

  const result = await sendEmail({ toEmail, subject, html });

  if (result.success) {
    console.log('[Email] Welcome email sent:', result.messageId);
  }

  return result;
};

export const sendVerificationEmail = async (toEmail, fullName, verificationToken, clientOrigin) => {
  const verifyLink = `${clientOrigin}/verify-email?token=${verificationToken}`;

  const subject = 'Verify your Heed account';
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: white; padding: 28px 24px; border-radius: 10px 10px 0 0; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; color: #fff; }
            .content { background: #f9f9f9; padding: 32px 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px;
                      border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 24px 0; }
            .token-box { background: #f0f0f0; padding: 12px; border-radius: 6px;
                         font-family: monospace; font-size: 12px; word-break: break-all; margin: 12px 0; }
            .footer { font-size: 12px; color: #999; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
            .warning { background: #fffbeb; border: 1px solid #fcd34d; padding: 12px 16px;
                       border-radius: 6px; font-size: 14px; margin: 16px 0; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Heed</div>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">Team collaboration platform</p>
            </div>
            <div class="content">
              <h2 style="margin-top:0; color:#111;">Verify your email address</h2>
              <p>Hi ${fullName},</p>
              <p>Thanks for signing up for Heed! Click the button below to verify your email address and activate your account:</p>

              <a href="${verifyLink}" class="button">Verify my email</a>

              <p style="margin-top:20px; color:#555; font-size:14px;">Or paste this link in your browser:</p>
              <div class="token-box">${verifyLink}</div>

              <div class="warning">
                <strong>⏱ This link expires in 24 hours.</strong> If you did not create a Heed account, you can safely ignore this email.
              </div>

              <p style="margin-top:28px; color:#666; font-size:14px;">
                Best regards,<br/>The Heed Team
              </p>
            </div>
            <div class="footer">
              This is an automated message. Please do not reply to this email.
            </div>
          </div>
        </body>
      </html>
    `;

  const result = await sendEmail({ toEmail, subject, html });

  if (result.success) {
    console.log('[Email] Verification email sent:', result.messageId);
  }

  return result;
};
