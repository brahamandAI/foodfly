import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import Notification from '@/lib/backend/models/notification.model';
import { generateToken } from '@/lib/backend/utils/jwt';
import { verifyOtp } from '@/lib/backend/utils/otpStore';
import { isValidIndianMobile, normalizeIndianPhone } from '@/lib/phone';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, email, password, phone, emailOtp } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const phoneRaw = typeof phone === 'string' ? phone.trim() : '';
    if (!phoneRaw) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!isValidIndianMobile(phoneRaw)) {
      return NextResponse.json(
        { error: 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210 or +91 9876543210)' },
        { status: 400 }
      );
    }
    const normalizedPhone = normalizeIndianPhone(phoneRaw)!;

    if (!emailOtp || String(emailOtp).length !== 6) {
      return NextResponse.json(
        { error: 'Email verification code is required. Request a code from the sign-up form first.' },
        { status: 400 }
      );
    }

    const otpOk = await verifyOtp(email.toLowerCase().trim(), String(emailOtp).trim(), 'signup');
    if (!otpOk) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Request a new code and try again.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this phone number already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const now = new Date();
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: normalizedPhone,
      role: 'customer',
      isEmailVerified: true,
      createdAt: now, // Explicitly set createdAt
      updatedAt: now
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id.toString(), newUser.role);

    // Create welcome notification
    const welcomeNotification = new Notification({
      userId: newUser._id.toString(),
      type: 'system',
      title: 'Welcome to Foodfly! 🍕',
      message: `Hi ${newUser.name}! Welcome to Foodfly. Start exploring restaurants and order your favorite food!`,
      priority: 'medium',
      channels: ['app'],
      data: {
        welcomeBonus: true
      }
    });

    await welcomeNotification.save();

    // Return user data (excluding password)
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
      addresses: newUser.addresses,
      createdAt: (newUser as any).createdAt ? (newUser as any).createdAt.toISOString() : now.toISOString(),
      joinedAt: (newUser as any).createdAt ? (newUser as any).createdAt.toISOString() : now.toISOString() // Use createdAt as joinedAt for consistency
    };

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: userResponse
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 