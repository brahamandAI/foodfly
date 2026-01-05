import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import Order from '@/lib/backend/models/order.model';
import User from '@/lib/backend/models/user.model';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all restaurants
    const restaurants = await (Restaurant as any).find({});
    const totalRestaurants = restaurants.length;
    const activeRestaurants = restaurants.filter((r: any) => r.isActive !== false).length;

    // Get all orders
    const orders = await (Order as any).find({}).lean();
    const totalOrders = orders.length;
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= today;
    }).length;

    // Calculate revenue
    const totalRevenue = orders
      .filter((o: any) => o.status === 'delivered' || o.status === 'completed')
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    
    const todayRevenue = orders
      .filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today && (o.status === 'delivered' || o.status === 'completed');
      })
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    // Get all users
    const users = await (User as any).find({ role: { $in: ['customer', 'user'] } }).lean();
    const totalUsers = users.length;
    
    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter((u: any) => {
      if (!u.lastLogin) return false;
      return new Date(u.lastLogin) >= thirtyDaysAgo;
    }).length;

    // Order status counts
    const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length;
    const failedOrders = orders.filter((o: any) => o.status === 'failed').length;

    // Get all chefs
    const chefs = await (User as any).find({ role: 'chef' }).lean();
    const totalChefs = chefs.length;
    const pendingChefs = chefs.filter((c: any) => !c.chefProfile?.verification?.isVerified).length;

    return NextResponse.json({
      totalRestaurants,
      activeRestaurants,
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalUsers,
      activeUsers,
      cancelledOrders,
      failedOrders,
      totalChefs,
      pendingChefs
    });

  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
