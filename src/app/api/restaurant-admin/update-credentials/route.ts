import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/backend/database';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { restaurantId, currentPassword, newUsername, newPassword } = body;

    // Validate required fields (current password is always required for security)
    if (!restaurantId || !currentPassword) {
      return NextResponse.json(
        { error: 'restaurantId and currentPassword are required' },
        { status: 400 }
      );
    }

    // At least one of username or password must be provided
    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: 'Provide newUsername or newPassword' },
        { status: 400 }
      );
    }

    // Validate password length when provided
    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Validate username length when provided
    if (newUsername && newUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the restaurant admin
    const admin = await RestaurantAdmin.findOne({ 
      restaurantId: restaurantId 
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Restaurant admin not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new username is already taken by another admin
    if (newUsername) {
      const existingAdmin = await RestaurantAdmin.findOne({
        username: newUsername,
        _id: { $ne: admin._id }
      });

      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
    }

    // Build update object dynamically
    const update: any = {};
    if (newUsername) {
      update.username = newUsername;
      // Keep display/admin name in sync if present
      update.adminName = newUsername;
    }
    if (newPassword) {
      update.password = await bcrypt.hash(newPassword, 12);
    }

    // Update credentials
    const result = await RestaurantAdmin.updateOne(
      { _id: admin._id },
      update
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update credentials' },
        { status: 500 }
      );
    }

    // Fetch the updated admin from the original database to return as source-of-truth
    const updatedAdmin = await RestaurantAdmin.findById(admin._id);

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully',
      username: updatedAdmin?.username,
      admin: updatedAdmin
        ? {
            id: updatedAdmin._id.toString(),
            email: updatedAdmin.email,
            username: updatedAdmin.username,
            adminName: updatedAdmin.adminName,
            restaurantId: updatedAdmin.restaurantId,
            restaurantName: updatedAdmin.restaurantName,
            role: updatedAdmin.role
          }
        : undefined
    });

  } catch (error) {
    console.error('Error updating credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
