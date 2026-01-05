import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import User from '@/lib/backend/models/user.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const user = verifyToken(request);
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const restaurants = await (Restaurant as any)
      .find({})
      .populate('owner', 'name email')
      .lean();

    const formattedRestaurants = restaurants.map((r: any) => ({
      _id: r._id.toString(),
      name: r.name,
      email: r.email,
      phone: r.phone,
      cuisine: r.cuisine || [],
      address: r.address || {},
      isActive: r.isActive !== false,
      owner: r.owner ? {
        _id: r.owner._id.toString(),
        name: r.owner.name,
        email: r.owner.email
      } : null,
      rating: r.rating || 0,
      deliveryFee: r.deliveryFee || 0,
      preparationTime: r.preparationTime || 30
    }));

    return NextResponse.json({ restaurants: formattedRestaurants });

  } catch (error: any) {
    console.error('Get restaurants error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify admin authentication
    const user = verifyToken(request);
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();

    const { name, email, phone, cuisine, address, ownerEmail } = body;

    // Find owner if email provided
    let owner = null;
    if (ownerEmail) {
      owner = await (User as any).findOne({ email: ownerEmail.toLowerCase(), role: 'restaurantAdmin' });
      if (!owner) {
        return NextResponse.json(
          { error: 'Restaurant admin not found with that email' },
          { status: 404 }
        );
      }
    }

    const restaurant = new (Restaurant as any)({
      name,
      email: email.toLowerCase(),
      phone,
      cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        coordinates: address.coordinates || {}
      },
      owner: owner ? owner._id : undefined,
      rating: 0,
      deliveryFee: 40,
      minimumOrder: 100,
      isActive: true,
      preparationTime: 30,
      openingHours: new Map(),
      images: []
    });

    await restaurant.save();

    return NextResponse.json({
      message: 'Restaurant created successfully',
      restaurant: {
        _id: restaurant._id.toString(),
        name: restaurant.name,
        email: restaurant.email
      }
    });

  } catch (error: any) {
    console.error('Create restaurant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}

