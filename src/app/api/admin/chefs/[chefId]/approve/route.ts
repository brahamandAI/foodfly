import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { chefId: string } }
) {
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
    
    const chefId = params.chefId;

    const chef = await (User as any).findById(chefId);

    if (!chef || chef.role !== 'chef') {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    // Update verification status
    if (!chef.chefProfile) {
      chef.chefProfile = {};
    }
    if (!chef.chefProfile.verification) {
      chef.chefProfile.verification = {};
    }
    chef.chefProfile.verification.isVerified = true;
    chef.markModified('chefProfile');
    
    await chef.save();

    return NextResponse.json({
      message: 'Chef approved successfully',
      chef: {
        _id: chef._id.toString(),
        name: chef.name,
        email: chef.email,
        isVerified: true
      }
    });

  } catch (error: any) {
    console.error('Approve chef error:', error);
    return NextResponse.json(
      { error: 'Failed to approve chef' },
      { status: 500 }
    );
  }
}

