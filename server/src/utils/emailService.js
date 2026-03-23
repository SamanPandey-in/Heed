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

transporter.verify((err, success) => {
  if (err) {
    console.warn('[Email] SMTP not configured or connection failed:', err.message);
  } else if (success) {
    console.log('[Email] SMTP configured and ready');
  }
});

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

export const sendVerificationEmail = async (toEmail, fullName, verificationToken, clientOrigin) => {
  const verifyLink = `${clientOrigin}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Verify your Heed account',
    html: `
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
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[Email] Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send verification email:', err);
    return { success: false, error: err.message };
  }
};
