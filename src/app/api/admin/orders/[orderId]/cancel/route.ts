import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDB();
    const orderId = params.orderId;

    const order = await (Order as any).findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'cancelled',
          cancelledAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'cancelled',
            timestamp: new Date(),
            updatedBy: 'admin',
            notes: 'Cancelled by super admin'
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Order cancelled successfully',
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status
      }
    });

  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}

