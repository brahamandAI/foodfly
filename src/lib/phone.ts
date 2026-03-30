/**
 * Indian mobile normalization for storage (E.164 +91XXXXXXXXXX).
 * SMS/OTP verification is not performed yet; this is format validation only.
 */
export function normalizeIndianPhone(input: string): string | null {
  const raw = input.replace(/\s+/g, '').trim();
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const rest = digits.slice(2);
    if (/^[6-9]\d{9}$/.test(rest)) return `+91${rest}`;
  }
  if (raw.startsWith('+')) {
    const d = raw.replace(/\D/g, '');
    if (d.length >= 10 && d.length <= 15) return `+${d}`;
  }
  return null;
}

export function isValidIndianMobile(input: string): boolean {
  const n = normalizeIndianPhone(input);
  return n !== null && /^\+91[6-9]\d{9}$/.test(n);
}
