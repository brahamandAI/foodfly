import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || 'today'; // today, week, month

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

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Get orders for this period (all statuses for accurate analytics)
    const orders = await (Order as any).find({
      restaurantId: restaurantId,
      placedAt: { $gte: startDate }
    }).lean();

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o: any) => o.status === 'delivered')
      .reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    
    const statusCounts = {
      pending: orders.filter((o: any) => o.status === 'pending').length,
      confirmed: orders.filter((o: any) => o.status === 'confirmed' || o.status === 'accepted').length,
      preparing: orders.filter((o: any) => o.status === 'preparing').length,
      ready: orders.filter((o: any) => o.status === 'ready').length,
      out_for_delivery: orders.filter((o: any) => o.status === 'out_for_delivery').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      cancelled: orders.filter((o: any) => o.status === 'cancelled').length
    };

    const averageOrderValue = totalOrders > 0 
      ? orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0) / totalOrders 
      : 0;

    // Daily revenue for chart
    const dailyRevenue: Record<string, number> = {};
    orders
      .filter((o: any) => o.status === 'delivered')
      .forEach((o: any) => {
        const date = new Date(o.placedAt).toISOString().split('T')[0];
        dailyRevenue[date] = (dailyRevenue[date] || 0) + o.totalAmount;
      });

    return NextResponse.json({
      analytics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        statusCounts,
        dailyRevenue,
        period
      }
    });

  } catch (error: any) {
    console.error('Get analytics error:', error);
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

