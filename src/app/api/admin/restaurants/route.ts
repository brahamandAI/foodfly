import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// In-memory restaurant data (in real app, this would be in database)
let restaurants = [
  { 
    id: '1', 
    name: 'Panache', 
    owner: 'Chef Marco',
    email: 'admin@panache.com',
    phone: '+91 98765 43210',
    address: '123 Fine Dining Street, Mumbai',
    cuisine: ['Mediterranean', 'Continental'],
    status: 'Active',
    createdAt: new Date('2024-01-15'),
    description: 'Upscale Mediterranean restaurant with live music'
  },
  { 
    id: '2', 
    name: 'Cafe After Hours', 
    owner: 'Sarah Johnson',
    email: 'admin@cafeafterhours.com', 
    phone: '+91 98765 43211',
    address: '456 Coffee Lane, Mumbai',
    cuisine: ['Coffee', 'Italian', 'Continental'],
    status: 'Active',
    createdAt: new Date('2024-02-01'),
    description: 'Cozy cafe perfect for late night coffee and conversations'
  },
  { 
    id: '3', 
    name: 'Symposium Restaurant', 
    owner: 'Chef Andre',
    email: 'admin@symposium.com',
    phone: '+91 98765 43212', 
    address: '789 Multi-Cuisine Boulevard, Mumbai',
    cuisine: ['North Indian', 'South Indian', 'Chinese', 'Continental'],
    status: 'Active',
    createdAt: new Date('2024-01-10'),
    description: 'Multi-cuisine restaurant offering diverse dining experiences'
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('🏪 Super Admin fetching all restaurants');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Filter by status if provided
    let filteredRestaurants = restaurants;
    if (status && status !== 'all') {
      filteredRestaurants = restaurants.filter(restaurant => 
        restaurant.status.toLowerCase() === status.toLowerCase()
      );
    }
    
    // Calculate summary statistics
    const summary = {
      totalRestaurants: restaurants.length,
      activeRestaurants: restaurants.filter(r => r.status === 'Active').length,
      inactiveRestaurants: restaurants.filter(r => r.status === 'Inactive').length,
      totalCuisines: [...new Set(restaurants.flatMap(r => r.cuisine))].length
    };
    
    return NextResponse.json({
      restaurants: filteredRestaurants,
      summary,
      message: 'Restaurants retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get restaurants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, owner, email, phone, address, cuisine, description } = await request.json();
    
    if (!name || !owner || !email) {
      return NextResponse.json(
        { error: 'Name, owner, and email are required' },
        { status: 400 }
      );
    }
    
    // Check if restaurant name already exists
    const existingRestaurant = restaurants.find(r => 
      r.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant with this name already exists' },
        { status: 400 }
      );
    }
    
    // Generate new ID
    const newId = (Math.max(...restaurants.map(r => parseInt(r.id))) + 1).toString();
    
    const newRestaurant = {
      id: newId,
      name,
      owner,
      email,
      phone: phone || '',
      address: address || '',
      cuisine: Array.isArray(cuisine) ? cuisine : [cuisine || 'Multi-Cuisine'],
      status: 'Active',
      createdAt: new Date(),
      description: description || ''
    };
    
    restaurants.push(newRestaurant);
    
    console.log(`🏪 New restaurant added: ${name} (ID: ${newId})`);
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant added successfully',
      restaurant: newRestaurant
    });

  } catch (error: any) {
    console.error('Add restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const { id, name, owner, email, phone, address, cuisine, status, description } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }
    
    const restaurantIndex = restaurants.findIndex(r => r.id === id);
    
    if (restaurantIndex === -1) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Update restaurant data
    const updatedRestaurant = {
      ...restaurants[restaurantIndex],
      ...(name && { name }),
      ...(owner && { owner }),
      ...(email && { email }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(cuisine && { cuisine: Array.isArray(cuisine) ? cuisine : [cuisine] }),
      ...(status && { status }),
      ...(description !== undefined && { description })
    };
    
    restaurants[restaurantIndex] = updatedRestaurant;
    
    console.log(`🏪 Restaurant updated: ${name || restaurants[restaurantIndex].name} (ID: ${id})`);
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant
    });

  } catch (error: any) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }
    
    const restaurantIndex = restaurants.findIndex(r => r.id === id);
    
    if (restaurantIndex === -1) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    const deletedRestaurant = restaurants[restaurantIndex];
    restaurants.splice(restaurantIndex, 1);
    
    console.log(`🏪 Restaurant deleted: ${deletedRestaurant.name} (ID: ${id})`);
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant deleted successfully',
      restaurant: deletedRestaurant
    });

  } catch (error: any) {
    console.error('Delete restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
