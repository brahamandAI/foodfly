import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Lists default restaurant admin emails/passwords for the login helper UI.
 * Works in all environments unless explicitly disabled.
 *
 * Set HIDE_RESTAURANT_CREDENTIALS_API=true to turn this off after you rotate passwords.
 */
export async function GET(_request: NextRequest) {
  if (process.env.HIDE_RESTAURANT_CREDENTIALS_API === 'true') {
    return NextResponse.json(
      { error: 'Credential listing is disabled on this server.' },
      { status: 403 }
    );
  }

  const credentials = [
    {
      restaurant: 'Symposium Restaurant',
      email: 'symposium@foodfly.com',
      password: 'Symposium@123',
      location: 'First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078',
    },
    {
      restaurant: 'Cafe After Hours',
      email: 'cafe@foodfly.com',
      password: 'Cafe@123',
      location: '17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078',
    },
    {
      restaurant: 'Panache',
      email: 'panache@foodfly.com',
      password: 'Panache@123',
      location: 'Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078',
    },
  ];

  return NextResponse.json({
    message: 'Restaurant Admin Credentials',
    loginUrl: '/restaurant-admin/login',
    setupUrl: '/api/restaurant-admin/setup',
    credentials,
  });
}
