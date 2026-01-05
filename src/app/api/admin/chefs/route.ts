import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const user = verifyToken(request);
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all chefs
    const chefs = await (User as any)
      .find({ role: 'chef' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const formattedChefs = chefs.map((c: any) => ({
      _id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      picture: c.picture,
      chefProfile: c.chefProfile || {},
      createdAt: c.createdAt
    }));

    return NextResponse.json({ chefs: formattedChefs });

  } catch (error: any) {
    console.error('Get chefs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chefs' },
      { status: 500 }
    );
  }
}
