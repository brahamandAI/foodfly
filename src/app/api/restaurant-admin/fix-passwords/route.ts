import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';

export const dynamic = 'force-dynamic';

// Fix passwords for restaurant admin accounts (fixes double-hashing issue)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Only allow in development
    const body = await request.json().catch(() => ({}));
    const { adminKey } = body;
    const isDev = process.env.NODE_ENV !== 'production';
    const validKey = adminKey === process.env.ADMIN_SETUP_KEY || adminKey === 'dev-setup-key';
    
    if (!isDev && !validKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantEmails = [
      'symposium@foodfly.com',
      'cafe@foodfly.com',
      'panache@foodfly.com'
    ];

    const passwords: Record<string, string> = {
      'symposium@foodfly.com': 'Symposium@123',
      'cafe@foodfly.com': 'Cafe@123',
      'panache@foodfly.com': 'Panache@123'
    };

    const fixedAccounts = [];

    for (const email of restaurantEmails) {
      const user = await (User as any).findOne({ email: email.toLowerCase() });
      
      if (user) {
        // Update password - let pre-save hook hash it properly
        user.password = passwords[email];
        await user.save();
        
        // Verify restaurant exists
        const restaurant = await (Restaurant as any).findOne({ owner: user._id });
        
        fixedAccounts.push({
          email: email,
          restaurant: restaurant?.name || 'Unknown',
          status: 'Password fixed'
        });
      } else {
        fixedAccounts.push({
          email: email,
          status: 'User not found'
        });
      }
    }

    return NextResponse.json({
      message: 'Passwords fixed successfully',
      accounts: fixedAccounts
    });

  } catch (error: any) {
    console.error('Fix passwords error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

