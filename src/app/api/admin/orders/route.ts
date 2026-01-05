import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const restaurant = searchParams.get('restaurant');
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    let query: any = {};

    if (restaurant) {
      query.restaurantName = { $regex: restaurant, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.placedAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await (Order as any)
      .find(query)
      .sort({ placedAt: -1 })
      .limit(100)
      .lean();

    const formattedOrders = orders.map((o: any) => ({
      _id: o._id.toString(),
      orderNumber: o.orderNumber,
      restaurantName: o.restaurantName,
      customerEmail: o.customerEmail,
      totalAmount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      placedAt: o.placedAt,
      items: o.items || []
    }));

    return NextResponse.json({ orders: formattedOrders });

  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
