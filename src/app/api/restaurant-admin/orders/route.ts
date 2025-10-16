import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Verify restaurant admin authentication
function verifyRestaurantAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization header');
  }
  
  const token = authHeader.split(' ')[1];
  if (!token || !token.startsWith('restaurant-admin-token-')) {
    throw new Error('Invalid token format');
  }
  
  // Extract restaurant ID from token
  const restaurantId = token.replace('restaurant-admin-token-', '');
  return { restaurantId, token };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify restaurant admin authentication
    const { restaurantId } = verifyRestaurantAdmin(request);
    
    console.log(`🏪 Fetching orders for restaurant admin: ${restaurantId}`);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Build query filter for this restaurant only
    let queryFilter: any = { restaurantId };
    
    // Filter by specific status if provided
    if (status && status !== 'all') {
      queryFilter.status = status;
    }
    
    // Get orders for this restaurant only
    const orders = await Order.find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    console.log(`📋 Found ${orders.length} orders for restaurant ${restaurantId}`);
    
    // Debug: Log first order's items structure
    if (orders.length > 0) {
      console.log('🔍 First Order Debug:', {
        orderNumber: orders[0].orderNumber,
        itemsCount: orders[0].items?.length,
        items: orders[0].items,
        firstItem: orders[0].items?.[0]
      });
    }
    
    // Map orders for restaurant admin view
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
      restaurantId,
      totalOrders: mappedOrders.length,
      message: 'Restaurant orders retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get restaurant orders error:', error);
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify restaurant admin authentication
    const { restaurantId } = verifyRestaurantAdmin(request);
    
    const { orderId, action, status } = await request.json();
    
    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Order ID and action are required' },
        { status: 400 }
      );
    }
    
    console.log(`🏪 Restaurant ${restaurantId} taking action: ${action} on order ${orderId}`);
    
    // Find the order and verify it belongs to this restaurant
    const order = await Order.findOne({ 
      _id: orderId, 
      restaurantId: restaurantId 
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or does not belong to this restaurant' },
        { status: 404 }
      );
    }
    
    // Handle different actions
    let updatedStatus = order.status;
    let message = '';
    
    switch (action) {
      case 'accept':
        if (order.status === 'pending') {
          updatedStatus = 'confirmed';
          message = 'Order accepted successfully';
        } else {
          return NextResponse.json(
            { error: 'Order can only be accepted if it is pending' },
            { status: 400 }
          );
        }
        break;
        
      case 'reject':
        if (order.status === 'pending') {
          updatedStatus = 'cancelled';
          message = 'Order rejected successfully';
        } else {
          return NextResponse.json(
            { error: 'Order can only be rejected if it is pending' },
            { status: 400 }
          );
        }
        break;
        
      case 'update_status':
        if (status && ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)) {
          updatedStatus = status;
          message = `Order status updated to ${status}`;
        } else {
          return NextResponse.json(
            { error: 'Invalid status provided' },
            { status: 400 }
          );
        }
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: accept, reject, or update_status' },
          { status: 400 }
        );
    }
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        status: updatedStatus,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log(`✅ Order ${orderId} status updated from ${order.status} to ${updatedStatus}`);
    
    return NextResponse.json({
      success: true,
      message,
      order: {
        _id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });

  } catch (error: any) {
    console.error('Update restaurant order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
