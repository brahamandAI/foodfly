import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import User from '@/lib/backend/models/user.model';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// Setup script to create restaurant admin accounts
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Allow in development, or with admin key in production
    const body = await request.json().catch(() => ({}));
    const { adminKey } = body;
    const isDev = process.env.NODE_ENV !== 'production';
    const validKey = adminKey === process.env.ADMIN_SETUP_KEY || adminKey === 'dev-setup-key';
    
    if (!isDev && !validKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurants = [
      {
        name: 'Symposium Restaurant',
        email: 'symposium@foodfly.com',
        password: 'Symposium@123',
        address: {
          street: 'First floor, City Centre Mall, 101, Sector 12 Dwarka',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110078',
          coordinates: {
            latitude: 28.5923,
            longitude: 77.0406
          }
        },
        phone: '+91 9876543210',
        cuisine: ['Multi-Cuisine'],
        deliveryFee: 50,
        minimumOrder: 200
      },
      {
        name: 'Cafe After Hours',
        email: 'cafe@foodfly.com',
        password: 'Cafe@123',
        address: {
          street: '17, Pocket A St, Pocket A, Sector 17 Dwarka',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110078',
          coordinates: {
            latitude: 28.5967,
            longitude: 77.0329
          }
        },
        phone: '+91 9876543211',
        cuisine: ['Italian', 'Continental'],
        deliveryFee: 35,
        minimumOrder: 150
      },
      {
        name: 'Panache',
        email: 'panache@foodfly.com',
        password: 'Panache@123',
        address: {
          street: 'Ground Floor, Soul City Mall, Sector 13, Dwarka',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110078',
          coordinates: {
            latitude: 28.5891,
            longitude: 77.0467
          }
        },
        phone: '+91 9876543212',
        cuisine: ['Indian'],
        deliveryFee: 40,
        minimumOrder: 200
      }
    ];

    const createdAccounts = [];

    for (const restData of restaurants) {
      // Check if user already exists - need to select password to compare
      let user = await (User as any).findOne({ email: restData.email }).select('+password');
      
      if (!user) {
        // Create user - let the User model's pre-save hook hash the password
        user = new (User as any)({
          name: restData.name + ' Admin',
          email: restData.email,
          password: restData.password, // Plain password - will be hashed by pre-save hook
          phone: restData.phone,
          role: 'customer', // Will be restaurant owner
          isEmailVerified: true
        });
        await user.save();
      } else {
        // If user exists, check if password needs to be updated
        // Only update if password is invalid or user doesn't have a password
        if (!user.password) {
          // User has no password, set it
          user.password = restData.password;
          await user.save();
        } else {
          // Check if password is valid
          try {
            const isPasswordValid = await user.comparePassword(restData.password);
            if (!isPasswordValid) {
              // Password doesn't match, update it
              user.password = restData.password;
              await user.save();
            }
          } catch (error) {
            // If comparison fails (e.g., password is corrupted), reset it
            console.log('Password comparison failed, resetting password for:', restData.email);
            user.password = restData.password;
            await user.save();
          }
        }
      }

      // Check if restaurant already exists
      let restaurant = await (Restaurant as any).findOne({ owner: user._id });
      
      if (!restaurant) {
        // Create restaurant
        restaurant = new (Restaurant as any)({
          name: restData.name,
          owner: user._id,
          description: `${restData.name} - Premium dining experience`,
          cuisine: restData.cuisine,
          address: restData.address,
          phone: restData.phone,
          email: restData.email,
          openingHours: {
            monday: { open: '10:00', close: '23:00' },
            tuesday: { open: '10:00', close: '23:00' },
            wednesday: { open: '10:00', close: '23:00' },
            thursday: { open: '10:00', close: '23:00' },
            friday: { open: '10:00', close: '23:00' },
            saturday: { open: '10:00', close: '23:00' },
            sunday: { open: '10:00', close: '23:00' }
          },
          rating: 4.5,
          deliveryFee: restData.deliveryFee,
          minimumOrder: restData.minimumOrder,
          isActive: true,
          preparationTime: 30
        });
        await restaurant.save();
      }

      createdAccounts.push({
        restaurant: restData.name,
        email: restData.email,
        password: restData.password,
        restaurantId: restaurant._id
      });
    }

    return NextResponse.json({
      message: 'Restaurant admin accounts created successfully',
      accounts: createdAccounts
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

