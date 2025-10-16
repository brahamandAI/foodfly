import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import RestaurantSettings from '@/lib/backend/models/restaurantSettings.model';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// GET - Fetch restaurant settings
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find the restaurant admin to get restaurantId
    const admin = await RestaurantAdmin.findById(decoded.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Find or create restaurant settings
    let settings = await RestaurantSettings.findOne({ restaurantId: admin.restaurantId });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new RestaurantSettings({
        restaurantId: admin.restaurantId,
        restaurantName: admin.restaurantName,
        email: admin.email,
        phone: '',
        address: '',
        openingHours: '9:00 AM - 11:00 PM',
        deliveryRadius: 5,
        minOrderAmount: 200,
        notifications: {
          newOrders: true,
          orderUpdates: true,
          emailNotifications: false
        }
      });
      await settings.save();
    }

    return NextResponse.json({
      success: true,
      settings: {
        restaurantId: settings.restaurantId,
        restaurantName: settings.restaurantName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        openingHours: settings.openingHours,
        deliveryRadius: settings.deliveryRadius,
        minOrderAmount: settings.minOrderAmount,
        notifications: settings.notifications
      }
    });

  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update restaurant settings
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find the restaurant admin to get restaurantId
    const admin = await RestaurantAdmin.findById(decoded.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Get the updated settings from request body
    const body = await req.json();
    const {
      restaurantName,
      phone,
      email,
      address,
      openingHours,
      deliveryRadius,
      minOrderAmount,
      notifications
    } = body;

    // Validate required fields
    if (!restaurantName || !email) {
      return NextResponse.json({ error: 'Restaurant name and email are required' }, { status: 400 });
    }

    // Validate numeric fields
    if (deliveryRadius && (deliveryRadius < 1 || deliveryRadius > 50)) {
      return NextResponse.json({ error: 'Delivery radius must be between 1 and 50 km' }, { status: 400 });
    }

    if (minOrderAmount && minOrderAmount < 0) {
      return NextResponse.json({ error: 'Minimum order amount cannot be negative' }, { status: 400 });
    }

    // Find and update or create settings
    let settings = await RestaurantSettings.findOne({ restaurantId: admin.restaurantId });
    
    if (!settings) {
      // Create new settings
      settings = new RestaurantSettings({
        restaurantId: admin.restaurantId,
        restaurantName,
        phone: phone || '',
        email,
        address: address || '',
        openingHours: openingHours || '9:00 AM - 11:00 PM',
        deliveryRadius: deliveryRadius || 5,
        minOrderAmount: minOrderAmount || 200,
        notifications: notifications || {
          newOrders: true,
          orderUpdates: true,
          emailNotifications: false
        }
      });
    } else {
      // Update existing settings
      settings.restaurantName = restaurantName;
      settings.phone = phone || '';
      settings.email = email;
      settings.address = address || '';
      settings.openingHours = openingHours || '9:00 AM - 11:00 PM';
      settings.deliveryRadius = deliveryRadius || 5;
      settings.minOrderAmount = minOrderAmount || 200;
      settings.notifications = notifications || {
        newOrders: true,
        orderUpdates: true,
        emailNotifications: false
      };
    }

    await settings.save();

    // Also update restaurant name in admin record if changed
    if (admin.restaurantName !== restaurantName) {
      admin.restaurantName = restaurantName;
      await admin.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        restaurantId: settings.restaurantId,
        restaurantName: settings.restaurantName,
        phone: settings.phone,
        email: settings.email,
        address: settings.address,
        openingHours: settings.openingHours,
        deliveryRadius: settings.deliveryRadius,
        minOrderAmount: settings.minOrderAmount,
        notifications: settings.notifications
      }
    });

  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
