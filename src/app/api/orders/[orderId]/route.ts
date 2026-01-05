import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/utils/jwt';
import { sanitizeImageUrl } from '@/lib/menuUtils';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get token from headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Fetch order
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user owns this order or is admin
    // Use customerId instead of user field
    if (order.customerId !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch restaurant details from database
    let restaurantData: any = null;
    if (order.restaurantId) {
      try {
        restaurantData = await (Restaurant as any).findById(order.restaurantId).lean();
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    }

    // Format the response to match the actual order structure
    const formattedOrder = {
      _id: order._id,
      orderNumber: order.orderNumber,
      restaurant: {
        _id: order.restaurantId || 'default-restaurant',
        name: order.restaurantName || restaurantData?.name || 'FoodFly Kitchen',
        image: sanitizeImageUrl(
          (restaurantData?.images && restaurantData.images.length > 0) 
            ? restaurantData.images[0] 
            : '/images/restaurants/cafe.jpg'
        ),
        phone: restaurantData?.phone || '+91 9876543210',
        address: {
          street: restaurantData?.address?.street || 'Main Street',
          city: restaurantData?.address?.city || 'Your City',
          area: restaurantData?.address?.area || restaurantData?.address?.locality || restaurantData?.address?.city || 'Food District',
          state: restaurantData?.address?.state || '',
          pincode: restaurantData?.address?.zipCode || restaurantData?.address?.pincode || ''
        }
      },
      items: order.items.map((item: any) => ({
        _id: item._id || item.menuItemId || `item-${Date.now()}`,
        menuItem: {
          _id: item.menuItemId || item._id || `menu-${Date.now()}`,
          name: item.name || 'Unknown Item',
          price: item.price || 0,
          image: sanitizeImageUrl(item.image || '/images/placeholder.svg'),
          isVeg: item.isVeg !== undefined ? item.isVeg : true,
          description: item.description || '',
          category: item.category || 'Main Course'
        },
        quantity: item.quantity || 1,
        price: (item.price || 0) * (item.quantity || 1), // Total price for this item
        customization: item.customizations ? (Array.isArray(item.customizations) ? item.customizations.join(', ') : item.customizations) : ''
      })),
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee || 0,
      tax: order.taxes || 0,
      subtotal: order.subtotal,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      deliveryAddress: order.deliveryAddress,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      placedAt: order.placedAt,
      deliveredAt: order.deliveredAt,
      rating: order.rating,
      review: order.review,
      createdAt: order.createdAt,
      cancelledAt: order.cancelledAt,
      deliveryPartner: null // Not implemented yet
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder
    });

  } catch (error: any) {
    console.error('Error fetching order details:', error);
    
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 