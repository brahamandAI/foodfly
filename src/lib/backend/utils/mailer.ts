import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use App Password for Gmail
  },
});

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"FoodFly" <${process.env.EMAIL_USER}>`,
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
