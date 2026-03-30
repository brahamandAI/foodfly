import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { generateOtp, saveOtp } from '@/lib/backend/utils/otpStore';
import { sendOtpEmail } from '@/lib/backend/utils/mailer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return success regardless to prevent email enumeration
      return NextResponse.json({ message: 'If this email exists, an OTP has been sent.' });
    }

    const otp = generateOtp();
    await saveOtp(email.toLowerCase(), otp, 'reset');

    await sendOtpEmail(email.toLowerCase(), otp);

    return NextResponse.json({ message: 'OTP sent to your email address.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    const msg = error?.message || '';
    if (msg.includes('SMTP_USER') && msg.includes('SMTP_PASS')) {
      return NextResponse.json(
        { error: 'Email service is not configured. Set SMTP_USER and SMTP_PASS in .env' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
