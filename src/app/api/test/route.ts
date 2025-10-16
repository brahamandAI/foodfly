import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const apiEndpoints = {
      authentication: {
        login: '/api/auth/login',
        register: '/api/auth/register',
      },
      users: {
        profile: '/api/users/profile',
        addresses: '/api/users/addresses',
      },
      cart: {
        main: '/api/cart',
        items: '/api/cart/items/[itemId]',
      },
      orders: {
        main: '/api/orders',
      },
      restaurants: {
        all: '/api/restaurants',
        single: '/api/restaurants/[id]',
      },
      menu: {
        items: '/api/menu?category=[category]',
      },
      payment: {
        process: '/api/payment',
        createOrder: '/api/payment/create-order',
      },
      admin: {
        login: '/api/admin/login',
        orders: '/api/admin/orders',
      },
    };

    // Only show env keys when NOT in production
    const debugInfo =
      process.env.NODE_ENV !== 'production'
        ? {
            nodeEnv: process.env.NODE_ENV,
            allKeys: Object.keys(process.env),
          }
        : undefined;

    return NextResponse.json({
      message: 'Foodfly API is running successfully!',
      version: '2.0.0',
      architecture: 'Next.js Unified App',
      database: 'Connected',
      endpoints: apiEndpoints,
      features: [
        'User Authentication',
        'Cart Management',
        'Order Processing',
        'Restaurant Management',
        'Menu System',
        'Payment Integration (Razorpay)',
        'Address Management',
        'Admin Panel',
        'User-Specific Data Storage',
      ],
      status: 'All systems operational',
      ...(debugInfo && { debug: debugInfo }), // only add if not prod
    });
  } catch (error: any) {
    console.error('Test API error:', error);

    const debugInfo =
      process.env.NODE_ENV !== 'production'
        ? {
            nodeEnv: process.env.NODE_ENV,
            allKeys: Object.keys(process.env),
          }
        : undefined;

    return NextResponse.json(
      {
        error: 'Database connection failed',
        message: error.message,
        ...(debugInfo && { debug: debugInfo }),
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'POST request received',
    status: 'success',
  });
}
