import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find admin by email or username
    const admin = await RestaurantAdmin.findOne({
      $or: [
        { email: email },
        { username: email } // Allow login with username or email
      ]
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        restaurantId: admin.restaurantId,
        role: 'restaurant_admin'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        username: admin.username,
        restaurantId: admin.restaurantId,
        restaurantName: admin.restaurantName,
        adminName: admin.adminName || admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Restaurant admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Initialize restaurant admins if they don't exist
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if admins already exist
    const existingCount = await RestaurantAdmin.countDocuments();
    
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'Restaurant admins already initialized',
        count: existingCount 
      });
    }

    // Create default restaurant admins
    const defaultAdmins = [
      {
        email: 'marco@panache.com',
        username: 'marco_panache',
        password: await bcrypt.hash('admin123', 12),
        restaurantId: '1',
        restaurantName: 'Panache',
        adminName: 'Marco Silva',
        role: 'restaurant_admin'
      },
      {
        email: 'sarah@cafeafterhours.com',
        username: 'sarah_cafe',
        password: await bcrypt.hash('admin123', 12),
        restaurantId: '2',
        restaurantName: 'Cafe After Hours',
        adminName: 'Sarah Johnson',
        role: 'restaurant_admin'
      },
      {
        email: 'andre@symposium.com',
        username: 'andre_symposium',
        password: await bcrypt.hash('admin123', 12),
        restaurantId: '3',
        restaurantName: 'Symposium Restaurant',
        adminName: 'Andre Williams',
        role: 'restaurant_admin'
      }
    ];

    const result = await RestaurantAdmin.insertMany(defaultAdmins);

    return NextResponse.json({
      success: true,
      message: 'Restaurant admins initialized successfully',
      insertedCount: result.length
    });

  } catch (error) {
    console.error('Error initializing restaurant admins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
