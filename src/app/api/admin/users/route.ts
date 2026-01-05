import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const admin = verifyToken(request);
    if (admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all customer users (exclude admin, delivery, chef)
    const users = await (User as any)
      .find({ role: { $in: ['customer', 'user'] } })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isEmailVerified: u.isEmailVerified || false,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
      isBlocked: u.isBlocked || false
    }));

    return NextResponse.json({ users: formattedUsers });

  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
