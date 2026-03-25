/**
 * In-memory OTP store with automatic expiry.
 * OTPs expire after 10 minutes.
 */

interface OtpEntry {
  otp: string;
  expiresAt: number;
  email: string;
}

const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOtp(email: string, otp: string): void {
  const key = email.toLowerCase();
  store.set(key, {
    otp,
    email: key,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
}

export function verifyOtp(email: string, otp: string): boolean {
  const key = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  if (entry.otp !== otp) return false;
  store.delete(key); // one-time use
  return true;
}

export function otpExists(email: string): boolean {
  const key = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return false;
  }
  return true;
}
