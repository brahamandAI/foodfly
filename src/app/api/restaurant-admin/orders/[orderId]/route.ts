import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Map frontend status values to database enum values
function mapStatusToEnum(status: string): string {
  const statusMap: Record<string, string> = {
    'accepted': 'confirmed',
    'handed_to_delivery': 'out_for_delivery',
    'rejected': 'cancelled'
  };
  
  return statusMap[status.toLowerCase()] || status.toLowerCase();
}

// Validate status is a valid enum value
function isValidStatus(status: string): boolean {
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
  return validStatuses.includes(status.toLowerCase());
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { status, reason } = await request.json();
    const orderId = params.orderId;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Map frontend status to database enum value
    const mappedStatus = mapStatusToEnum(status);
    
    // Validate the mapped status
    if (!isValidStatus(mappedStatus)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Valid statuses are: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled` },
        { status: 400 }
      );
    }

    // Find order
    const order = await (Order as any).findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify user owns the restaurant for this order
    // Convert user._id to ObjectId for comparison
    const userId = new mongoose.Types.ObjectId(user._id);
    const restaurantId = order.restaurantId ? new mongoose.Types.ObjectId(order.restaurantId) : null;
    
    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Order has no associated restaurant' },
        { status: 400 }
      );
    }

    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: userId 
    });

    if (!restaurant) {
      console.error('Restaurant access denied:', {
        orderId,
        restaurantId: order.restaurantId,
        userId: user._id,
        orderRestaurantId: order.restaurantId?.toString()
      });
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to update this order.' },
        { status: 403 }
      );
    }

    // Update order status (use mapped status)
    order.status = mappedStatus;
    if (reason) {
      order.cancellationReason = reason;
    }

    // Update status history
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: mappedStatus,
      timestamp: new Date(),
      updatedBy: userId
    });

    // Set timestamps based on status (use mapped status)
    if (mappedStatus === 'delivered' || mappedStatus === 'completed') {
      order.deliveredAt = new Date();
      order.actualDeliveryTime = new Date();
    } else if (mappedStatus === 'cancelled') {
      order.cancelledAt = new Date();
      if (reason) {
        order.cancellationReason = reason;
      }
    }

    order.updatedAt = new Date();
    await order.save();

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error: any) {
    console.error('Update order status error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

