import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Mock restaurant data with menus - this syncs with restaurant admin changes
const restaurantData = {
  '1': {
    _id: '1',
    name: 'Panache',
    image: '/images/placeholder-restaurant.jpg',
    rating: 4.8,
    deliveryTime: '25-35 mins',
    deliveryFee: 40,
    description: 'Fine dining experience with European cuisine',
    address: 'Downtown Business District',
    phone: '+91 98765 43210',
    menu: [
      {
        _id: 'pan_001',
        name: 'Truffle Risotto',
        description: 'Creamy Arborio rice with black truffle shavings and parmesan',
        price: 950,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.8,
        preparationTime: '25 mins',
        restaurant: '1'
      },
      {
        _id: 'pan_002',
        name: 'Pan-Seared Duck Breast',
        description: 'Tender duck with orange glaze and seasonal vegetables',
        price: 1150,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.9,
        preparationTime: '35 mins',
        restaurant: '1'
      },
      {
        _id: 'pan_003',
        name: 'Burrata Caprese',
        description: 'Creamy burrata with heirloom tomatoes and basil',
        price: 680,
        category: 'Appetizer',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.7,
        preparationTime: '10 mins',
        restaurant: '1'
      },
      {
        _id: 'pan_004',
        name: 'Chocolate Soufflé',
        description: 'Warm chocolate soufflé with vanilla ice cream',
        price: 450,
        category: 'Dessert',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.8,
        preparationTime: '20 mins',
        restaurant: '1'
      },
      {
        _id: 'pan_005',
        name: 'Mediterranean Sea Bass',
        description: 'Grilled sea bass with lemon herb marinade',
        price: 1050,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.6,
        preparationTime: '30 mins',
        restaurant: '1'
      }
    ]
  },
  '2': {
    _id: '2',
    name: 'Cafe After Hours',
    image: '/images/placeholder-restaurant.jpg',
    rating: 4.6,
    deliveryTime: '15-25 mins',
    deliveryFee: 30,
    description: 'Cozy cafe with artisan coffee and fresh pastries',
    address: 'Arts District',
    phone: '+91 98765 43211',
    menu: [
      {
        _id: 'cah_001',
        name: 'Artisan Coffee',
        description: 'Single origin beans, expertly roasted',
        price: 180,
        category: 'Beverages',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.7,
        preparationTime: '5 mins',
        restaurant: '2'
      },
      {
        _id: 'cah_002',
        name: 'Avocado Toast',
        description: 'Sourdough with smashed avocado and lime',
        price: 320,
        category: 'Breakfast',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.6,
        preparationTime: '8 mins',
        restaurant: '2'
      },
      {
        _id: 'cah_003',
        name: 'Chocolate Brownie',
        description: 'Rich, fudgy brownie with vanilla ice cream',
        price: 280,
        category: 'Dessert',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.8,
        preparationTime: '12 mins',
        restaurant: '2'
      }
    ]
  },
  '3': {
    _id: '3',
    name: 'Symposium Restaurant',
    image: '/images/placeholder-restaurant.jpg',
    rating: 4.9,
    deliveryTime: '30-40 mins',
    deliveryFee: 50,
    description: 'Authentic Indian cuisine with modern presentation',
    address: 'Heritage Quarter',
    phone: '+91 98765 43212',
    menu: [
      {
        _id: 'sym_001',
        name: 'Lamb Biryani',
        description: 'Aromatic basmati rice with tender lamb pieces',
        price: 750,
        category: 'Main Course',
        isVeg: false,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.9,
        preparationTime: '35 mins',
        restaurant: '3'
      },
      {
        _id: 'sym_002',
        name: 'Paneer Butter Masala',
        description: 'Creamy tomato curry with cottage cheese',
        price: 480,
        category: 'Main Course',
        isVeg: true,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.7,
        preparationTime: '20 mins',
        restaurant: '3'
      },
      {
        _id: 'sym_003',
        name: 'Tandoori Chicken',
        description: 'Marinated chicken grilled in tandoor',
        price: 650,
        category: 'Appetizer',
        isVeg: false,
        isAvailable: true,
        image: '/images/placeholder-food.jpg',
        rating: 4.8,
        preparationTime: '25 mins',
        restaurant: '3'
      }
    ]
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const restaurantId = params.id;
    const restaurant = restaurantData[restaurantId as keyof typeof restaurantData];
    
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    console.log(`Fetching restaurant ${restaurantId} data:`, restaurant.name);
    
    return NextResponse.json({
      success: true,
      restaurant,
      menu: restaurant.menu
    });

  } catch (error: any) {
    console.error('Get restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This function will be called by restaurant admin to sync menu changes
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const restaurantId = params.id;
    const { menu } = await request.json();
    
    // Verify restaurant exists
    if (!restaurantData[restaurantId as keyof typeof restaurantData]) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Update the restaurant menu
    restaurantData[restaurantId as keyof typeof restaurantData].menu = menu.map((item: any) => ({
      ...item,
      restaurant: restaurantId
    }));
    
    console.log(`Updated restaurant ${restaurantId} menu with ${menu.length} items`);
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant menu updated successfully'
    });

  } catch (error: any) {
    console.error('Update restaurant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}