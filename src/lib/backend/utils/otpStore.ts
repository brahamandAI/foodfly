/**
 * Email OTP storage in MongoDB so signup/reset work across Next.js instances and HMR.
 * (In-memory Map fails when send-otp and register run on different workers.)
 */

import EmailOtp from '@/lib/backend/models/emailOtp.model';

export type OtpPurpose = 'reset' | 'signup';

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function saveOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose = 'reset'
): Promise<void> {
  const e = normalizeEmail(email);
  await EmailOtp.findOneAndUpdate(
    { email: e, purpose },
    {
      $set: {
        otp,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    },
    { upsert: true, new: true }
  );
}

export async function verifyOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose = 'reset'
): Promise<boolean> {
  const e = normalizeEmail(email);
  const code = String(otp).trim();

  const doc = await EmailOtp.findOne({ email: e, purpose });
  if (!doc) return false;

  if (new Date() > doc.expiresAt) {
    await EmailOtp.deleteOne({ _id: doc._id });
    return false;
  }

  if (doc.otp !== code) return false;

  await EmailOtp.deleteOne({ _id: doc._id });
  return true;
}

export async function otpExists(email: string, purpose: OtpPurpose = 'reset'): Promise<boolean> {
  const e = normalizeEmail(email);
  const doc = await EmailOtp.findOne({ email: e, purpose });
  if (!doc) return false;
  if (new Date() > doc.expiresAt) {
    await EmailOtp.deleteOne({ _id: doc._id });
    return false;
  }
  return true;
}
