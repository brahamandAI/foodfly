import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in .env for sending mail');
  }
  const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';
  return { user, pass, host, port, secure };
}

function getFromAddress(): string {
  const raw = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim() || '';
  if (!raw) return `"FoodFly" <${user}>`;
  return raw;
}

function getTransporter() {
  const { user, pass, host, port, secure } = getSmtpConfig();
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Your FoodFly Password Reset OTP',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#dc2626;margin-bottom:8px">🍕 FoodFly</h2>
        <h3 style="color:#111827;margin-bottom:16px">Password Reset Request</h3>
        <p style="color:#374151;margin-bottom:24px">
          Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#fef2f2;border:2px dashed #dc2626;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#dc2626">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendSignupOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Verify your email — FoodFly',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#dc2626;margin-bottom:8px">🍕 FoodFly</h2>
        <h3 style="color:#111827;margin-bottom:16px">Email Verification</h3>
        <p style="color:#374151;margin-bottom:24px">
          Use this code to complete your registration. It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:bold;letter-spacing:10px;color:#1d4ed8">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px">
          If you did not sign up for FoodFly, ignore this email.
        </p>
      </div>
    `,
  });
}
