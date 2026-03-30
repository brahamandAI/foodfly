import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { generateOtp, saveOtp } from '@/lib/backend/utils/otpStore';
import { sendSignupOtpEmail } from '@/lib/backend/utils/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalized)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await connectDB();
    const existing = await User.findOne({ email: normalized });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const otp = generateOtp();
    await saveOtp(normalized, otp, 'signup');
    await sendSignupOtpEmail(normalized, otp);

    return NextResponse.json({ message: 'Verification code sent to your email.' });
  } catch (error: any) {
    console.error('send-signup-otp error:', error);
    const msg = error?.message || 'Failed to send verification email';
    if (msg.includes('SMTP_USER') && msg.includes('SMTP_PASS')) {
      return NextResponse.json(
        { error: 'Email service is not configured. Set SMTP_USER and SMTP_PASS in .env' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to send verification email. Try again later.' }, { status: 500 });
  }
}
