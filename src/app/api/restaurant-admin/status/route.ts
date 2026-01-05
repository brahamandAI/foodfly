import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { restaurantId, isActive, preparationTime } = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this restaurant
    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: user._id 
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 403 }
      );
    }

    // Update restaurant status
    if (isActive !== undefined) {
      restaurant.isActive = isActive;
    }
    if (preparationTime !== undefined) {
      restaurant.preparationTime = preparationTime;
    }

    await restaurant.save();

    return NextResponse.json({
      message: 'Restaurant status updated successfully',
      restaurant: {
        _id: restaurant._id,
        name: restaurant.name,
        isActive: restaurant.isActive,
        preparationTime: restaurant.preparationTime
      }
    });

  } catch (error: any) {
    console.error('Update restaurant status error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

