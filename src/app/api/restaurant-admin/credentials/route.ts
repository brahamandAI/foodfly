import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * WARNING: This endpoint contains development/test credentials.
 * Only accessible in development mode (NODE_ENV !== 'production').
 * 
 * For production, use proper authentication and user management.
 * These are test credentials only - change passwords in production!
 */
export async function GET(request: NextRequest) {
  // Only allow in development - double check environment
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  // Additional safety: Only allow from localhost in development
  const host = request.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json(
      { error: 'Only accessible from localhost in development' },
      { status: 403 }
    );
  }

  // Development/Test credentials only
  const credentials = [
    {
      restaurant: 'Symposium Restaurant',
      email: 'symposium@foodfly.com',
      password: 'Symposium@123',
      location: 'First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078'
    },
    {
      restaurant: 'Cafe After Hours',
      email: 'cafe@foodfly.com',
      password: 'Cafe@123',
      location: '17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078'
    },
    {
      restaurant: 'Panache',
      email: 'panache@foodfly.com',
      password: 'Panache@123',
      location: 'Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078'
    }
  ];

  return NextResponse.json({
    message: 'Restaurant Admin Credentials',
    loginUrl: '/restaurant-admin/login',
    setupUrl: '/api/restaurant-admin/setup',
    credentials
  });
}

