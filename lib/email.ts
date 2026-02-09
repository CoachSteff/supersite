import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

// Configure nodemailer
export function configureMailer(): Transporter {
  if (transporter) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'noreply@supersite.example.com';

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('[Email] SMTP not configured. Emails will be logged to console.');
    // Create a test transporter that logs to console
    transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true,
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

// Send OTP email
export async function sendOTP(email: string, code: string): Promise<boolean> {
  const mailer = configureMailer();
  const smtpFrom = process.env.SMTP_FROM || 'noreply@supersite.example.com';

  const mailOptions = {
    from: smtpFrom,
    to: email,
    subject: 'Your SuperSite login code',
    text: `Hi there!

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

---
SuperSite`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your Login Code</h2>
        <p style="color: #666; font-size: 16px;">Hi there!</p>
        <p style="color: #666; font-size: 16px;">Your verification code is:</p>
        <div style="background: #f5f5f5; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
        </div>
        <p style="color: #999; font-size: 14px;">This code will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">SuperSite</p>
      </div>
    `,
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log('[Email] OTP sent:', info.messageId);
    
    // If using test transporter, log the email
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('[Email] OTP Code for', email, ':', code);
    }
    
    return true;
  } catch (error) {
    console.error('[Email] Failed to send OTP:', error);
    
    // In development, still log the code even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('[Email] OTP Code for', email, ':', code);
      return true;
    }
    
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  const mailer = configureMailer();
  const smtpFrom = process.env.SMTP_FROM || 'noreply@supersite.example.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';

  const mailOptions = {
    from: smtpFrom,
    to: email,
    subject: 'Welcome to SuperSite!',
    text: `Welcome to SuperSite, @${username}!

We're excited to have you on board.

You can now:
- Customize your profile
- Connect with the community
- Explore all features

Visit your profile: ${siteUrl}/profile

If you have any questions, feel free to reach out.

---
The SuperSite Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to SuperSite!</h2>
        <p style="color: #666; font-size: 16px;">Hi <strong>@${username}</strong>,</p>
        <p style="color: #666; font-size: 16px;">We're excited to have you on board! 🎉</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Get Started:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Customize your profile</li>
            <li>Connect with the community</li>
            <li>Explore all features</li>
          </ul>
        </div>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${siteUrl}/profile" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Your Profile</a>
        </p>
        <p style="color: #999; font-size: 14px;">If you have any questions, feel free to reach out.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">The SuperSite Team</p>
      </div>
    `,
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log('[Email] Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send welcome email:', error);
    return false;
  }
}
