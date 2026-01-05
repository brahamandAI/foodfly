import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
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
    
    // Permanently delete chef from database
    await (User as any).findByIdAndDelete(chefId);
    
    return NextResponse.json({
      message: 'Chef deleted permanently',
      chefId
    });
    
  } catch (error: any) {
    console.error('Delete chef error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chef' },
      { status: 500 }
    );
  }
}

