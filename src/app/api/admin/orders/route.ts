import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('🏪 Super Admin fetching all orders from all restaurants');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const restaurantId = searchParams.get('restaurantId');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Build query filter
    let queryFilter: any = {};
    
    // Filter by specific status if provided
    if (status && status !== 'all') {
      queryFilter.status = status;
    }
    
    // Filter by specific restaurant if provided
    if (restaurantId && restaurantId !== 'all') {
      queryFilter.restaurantId = restaurantId;
    }
    
    // Get all orders across all restaurants
    const orders = await Order.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`📋 Found ${orders.length} total orders across all restaurants`);
    
    // Group orders by restaurant for analytics
    const ordersByRestaurant = orders.reduce((acc, order) => {
      const restaurantId = order.restaurantId;
      if (!acc[restaurantId]) {
        acc[restaurantId] = {
          restaurantName: order.restaurantName,
          orders: [],
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      acc[restaurantId].orders.push(order);
      acc[restaurantId].totalOrders += 1;
      acc[restaurantId].totalRevenue += order.totalAmount;
      return acc;
    }, {});
    
    // Calculate summary statistics
    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      restaurantCount: Object.keys(ordersByRestaurant).length,
      statusBreakdown: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
      recentOrders: orders.slice(0, 10) // Last 10 orders
    };
    
    // Map orders for super admin view
    const mappedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerEmail: order.customerEmail,
      customer: {
        name: order.deliveryAddress?.name || 'Customer',
        phone: order.deliveryAddress?.phone || '',
        email: order.customerEmail
      },
      restaurant: {
        _id: order.restaurantId,
        name: order.restaurantName
      },
      items: order.items.map(item => ({
        ...item,
        itemTotal: item.price * item.quantity
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      taxes: order.taxes,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      specialInstructions: order.specialInstructions,
      placedAt: order.placedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    return NextResponse.json({
      orders: mappedOrders,
      summary,
      ordersByRestaurant,
      message: 'All orders retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get all orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}