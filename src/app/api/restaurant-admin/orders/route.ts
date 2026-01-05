import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import User from '@/lib/backend/models/user.model';
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

    // Get orders for this restaurant
    // Include all orders (not just active) for complete dashboard stats
    const orders = await (Order as any).find({ 
      restaurantId: restaurantId
    })
    .sort({ placedAt: -1 })
    .limit(100);

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        customerEmail: order.customerEmail,
        deliveryAddress: order.deliveryAddress,
        specialInstructions: order.specialInstructions,
        placedAt: order.placedAt,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }))
    });

  } catch (error: any) {
    console.error('Get restaurant orders error:', error);
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

