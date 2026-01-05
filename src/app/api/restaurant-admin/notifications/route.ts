import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Notification from '@/lib/backend/models/notification.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

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

    // Get notifications for restaurant admin (order-related)
    // In a real app, you'd have a restaurantAdminId field or link via restaurant
    const notifications = await (Notification as any).find({
      type: { $in: ['order_confirmed', 'order_cancelled', 'order_updated'] },
      'data.restaurantId': restaurantId
    })
    .sort({ createdAt: -1 })
    .limit(50);

    return NextResponse.json({
      notifications: notifications.map((notif: any) => ({
        _id: notif._id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        priority: notif.priority,
        data: notif.data,
        createdAt: notif.createdAt,
        read: notif.read || false
      }))
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);
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

