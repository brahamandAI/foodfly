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
    
    const { reason } = await request.json();
    const chefId = params.chefId;

    const chef = await (User as any).findById(chefId);

    if (!chef || chef.role !== 'chef') {
      return NextResponse.json(
        { error: 'Chef not found' },
        { status: 404 }
      );
    }

    // Permanently delete chef account from database
    await (User as any).findByIdAndDelete(chefId);

    // TODO: Send rejection email to chef with reason

    return NextResponse.json({
      message: 'Chef rejected and account removed',
      reason
    });

  } catch (error: any) {
    console.error('Reject chef error:', error);
    return NextResponse.json(
      { error: 'Failed to reject chef' },
      { status: 500 }
    );
  }
}

