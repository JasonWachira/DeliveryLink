import nodemailer from "nodemailer";

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
      from: '"Noty" <zshkelvin@gmail.com>',
      to: email,
      subject: "Sign in to Noty",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">

          <div style="padding: 48px 40px; text-align: center; border-bottom: 1px solid #e5e5e5;">
            <h1 style="color: #000000; font-size: 48px; font-weight: 300; margin: 0; letter-spacing: -1px;">Noty</h1>
          </div>

          <div style="padding: 48px 40px;">
            <h2 style="color: #000000; font-size: 24px; font-weight: 300; margin: 0 0 16px 0;">Sign in to your account</h2>

            <p style="color: #737373; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; font-weight: 300;">
              Click the button below to securely access your Noty account and start recording your classes.
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${url}" style="background-color: #000000; color: #ffffff; padding: 16px 48px; text-decoration: none; font-weight: 300; font-size: 16px; display: inline-block; letter-spacing: 0.5px;">
                Sign In
              </a>
            </div>

            <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f5f5f5;">
              <p style="color: #737373; font-size: 14px; margin: 0 0 12px 0; font-weight: 300;">
                Or copy this link into your browser:
              </p>
              <div style="background-color: #fafafa; padding: 16px; word-break: break-all; font-size: 13px; color: #525252; border: 1px solid #e5e5e5;">
                ${url}
              </div>
            </div>
          </div>

          <div style="padding: 32px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="color: #525252; font-size: 14px; margin: 0 0 8px 0; font-weight: 300;">
              This link will expire in 10 minutes.
            </p>
            <p style="color: #a3a3a3; font-size: 13px; margin: 0; font-weight: 300;">
              If you didn't request this, please ignore this email.
            </p>
          </div>

        </div>
      `,
      text: `
Sign in to Noty

Click this link to sign in: ${url}

This link will expire in 10 minutes.

If you didn't request this, please ignore this email.
      `,
    });

    console.log(`Magic link sent to ${email}`);
  } catch (error) {
    console.error('Failed to send magic link:', error);
    throw new Error('Failed to send magic link email');
  }
}
