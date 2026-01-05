import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { generateToken } from '@/lib/backend/utils/jwt';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await (User as any).findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.error('Restaurant admin login: User not found for email:', email.toLowerCase());
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password - try both methods
    let isValidPassword = false;
    try {
      // Try using the model's comparePassword method first
      if (user.comparePassword) {
        isValidPassword = await user.comparePassword(password);
      } else {
        // Fallback to direct bcrypt comparison
        isValidPassword = await bcrypt.compare(password, user.password);
      }
    } catch (error: any) {
      console.error('Password comparison error:', error);
      isValidPassword = false;
    }
    
    if (!isValidPassword) {
      console.error('Restaurant admin login: Invalid password for email:', email.toLowerCase());
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Find restaurant owned by this user
    const restaurant = await (Restaurant as any).findOne({ owner: user._id });
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'No restaurant found for this account. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), 'restaurantAdmin');

    // Return restaurant admin data
    const response = NextResponse.json({
      message: 'Login successful',
      token,
      restaurantAdmin: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: 'restaurantAdmin'
      },
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        isActive: restaurant.isActive
      }
    });

    // Set HTTP-only cookie
    response.cookies.set('restaurantAdminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Restaurant admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

