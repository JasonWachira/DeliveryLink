// packages/auth/email.ts
// Purpose: helper to send "magic link" sign-in emails for DeliveryLink using Nodemailer.
// Usage: import { sendMagicLinkEmail } from './email';
// Security: DO NOT commit credentials—use environment variables (e.g. process.env.SMTP_USER, process.env.SMTP_PASS).
// Notes:
// - This module constructs both HTML and plain-text versions of the email.
// - The HTML uses an inline-styled template; keep markup small and compatible with common email clients.
// - Consider switching to an email provider (SendGrid, SES, Mailgun) or OAuth2 for Gmail in production.
// - This file currently contains an embedded Gmail username/password (unsafe). Replace with secure credentials storage.

import nodemailer from "nodemailer";
// Nodemailer transporter configuration
// - host/port/secure: for Gmail over TLS use host 'smtp.gmail.com' and port 587 with secure=false (STARTTLS).
// - auth: don't hard-code credentials. Use process.env and, ideally, application-specific passwords or OAuth2 tokens.
// - In production prefer a managed email service (SendGrid/AWS SES) to improve deliverability and avoid Gmail limits.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'zshkelvin@gmail.com',
    pass: 'xmpt ahrp gsol sybm',
  },
});

export async function sendMagicLinkEmail(email: string, url: string) {
  try {
    await transporter.sendMail({
      from: '"DeliveryLink" <zshkelvin@gmail.com>',
      to: email,
      subject: "Sign in to DeliveryLink",
      html: `
        <div style="font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="padding: 48px 40px; text-align: center; background: linear-gradient(135deg, oklch(0.6 0.22 260) 0%, oklch(0.55 0.18 155) 100%);">
            <h1 style="color: #ffffff; font-size: 48px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">DeliveryLink</h1>
          </div>
          <div style="padding: 48px 40px;">
            <h2 style="color: oklch(0.25 0.02 260); font-size: 24px; font-weight: 500; margin: 0 0 16px 0;">Sign in to your account</h2>
            <p style="color: oklch(0.52 0.01 260); font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-weight: 400;">
              Click the button below to securely access your DeliveryLink account and manage your deliveries.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${url}" style="background: linear-gradient(135deg, oklch(0.6 0.22 260) 0%, oklch(0.55 0.18 155) 100%); color: #ffffff; padding: 16px 48px; text-decoration: none; font-weight: 500; font-size: 16px; display: inline-block; letter-spacing: 0.5px; border-radius: 0.625rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                Sign In
              </a>
            </div>
            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid oklch(0.92 0.01 260);">
              <p style="color: oklch(0.52 0.01 260); font-size: 14px; margin: 0 0 12px 0; font-weight: 400;">
                Or copy this link into your browser:
              </p>
              <div style="background-color: oklch(0.96 0.005 260); padding: 16px; word-break: break-all; font-size: 13px; color: oklch(0.25 0.02 260); border: 1px solid oklch(0.92 0.01 260); border-radius: 0.625rem;">
                ${url}
              </div>
            </div>
          </div>
          <div style="padding: 32px 40px; background-color: oklch(0.96 0.005 260); text-align: center; border-top: 1px solid oklch(0.92 0.01 260);">
            <p style="color: oklch(0.52 0.01 260); font-size: 14px; margin: 0 0 8px 0; font-weight: 400;">
              This link will expire in 10 minutes.
            </p>
            <p style="color: oklch(0.52 0.01 260); font-size: 13px; margin: 0; font-weight: 400; opacity: 0.8;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
      text: `
Sign in to DeliveryLink

Click this link to sign in: ${url}

This link will expire in 5 minutes.
If you didn't request this, please ignore this email.
      `,
    });
    console.log(`Magic link sent to ${email}`);
  } catch (error) {
    console.error('Failed to send magic link:', error);
    throw new Error('Failed to send magic link email');
  }
}
