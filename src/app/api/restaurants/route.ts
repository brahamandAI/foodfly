import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Try to get restaurants from database first
    const dbRestaurants = await (Restaurant as any).find({}).limit(10);
    
    // If restaurants exist in database, use them
    if (dbRestaurants && dbRestaurants.length > 0) {
      const restaurants = dbRestaurants.map((r: any) => ({
        id: r._id.toString(),
        name: r.name,
        cuisine: Array.isArray(r.cuisine) ? r.cuisine[0] : r.cuisine || 'Multi-Cuisine',
        rating: r.rating || 4.5,
        deliveryTime: `${r.preparationTime || 30}-${(r.preparationTime || 30) + 10} mins`,
        deliveryFee: r.deliveryFee || 40,
        image: r.images && r.images.length > 0 ? r.images[0] : '/images/restaurants/cafe.jpg',
        location: `${r.address.city}, ${r.address.state}`,
        address: `${r.address.street}, ${r.address.city}, ${r.address.state} ${r.address.zipCode}`,
        isOpen: r.isActive !== false && r.isActive !== undefined ? r.isActive : true, // Default to true if not set
        isActive: r.isActive !== false && r.isActive !== undefined ? r.isActive : true,
        coordinates: r.address.coordinates || {
          latitude: 28.5891,
          longitude: 77.0467
        },
        menu: []
      }));

      return NextResponse.json({
        restaurants,
        message: 'Restaurants retrieved successfully'
      });
    }
    
    // Fallback to mock data if no restaurants in database
    const restaurants = [
      {
        id: '1',
        name: 'Panache',
        cuisine: 'Indian',
        rating: 4.5,
        deliveryTime: '30-45 mins',
        deliveryFee: 40,
        image: '/images/restaurants/cafe.jpg',
        location: 'Sector 13, Dwarka, New Delhi',
        address: 'Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078',
        isOpen: true,
        isActive: true,
        coordinates: {
          latitude: 28.5891,
          longitude: 77.0467
        },
        menu: [
          {
            id: 'chicken-biryani',
            name: 'Chicken Biryani',
            description: 'Aromatic basmati rice with tender chicken',
            price: 250,
            category: 'Main Course',
            image: '/images/categories/chicken.jpg'
          },
          {
            id: 'dal-makhani',
            name: 'Dal Makhani',
            description: 'Rich and creamy black lentils',
            price: 180,
            category: 'Main Course',
            image: '/images/categories/North-indian.jpg'
          }
        ]
      },
      {
        id: '2',
        name: 'Cafe After Hours',
        cuisine: 'Italian',
        rating: 4.2,
        deliveryTime: '25-35 mins',
        deliveryFee: 35,
        image: '/images/restaurants/panache.jpg',
        location: 'Sector 17, Dwarka, New Delhi',
        address: '17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078',
        isOpen: true,
        isActive: true,
        coordinates: {
          latitude: 28.5967,
          longitude: 77.0329
        },
        menu: [
          {
            id: 'margherita-pizza',
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato, mozzarella, and basil',
            price: 320,
            category: 'Pizza',
            image: '/images/categories/pizza-2.jpeg'
          },
          {
            id: 'pasta-alfredo',
            name: 'Pasta Alfredo',
            description: 'Creamy white sauce pasta',
            price: 280,
            category: 'Pasta',
            image: '/images/categories/pasta.jpg'
          }
        ]
      },
      {
        id: '3',
        name: 'Symposium Restaurant',
        cuisine: 'Multi-Cuisine',
        rating: 4.7,
        deliveryTime: '30-40 mins',
        deliveryFee: 50,
        image: '/images/restaurants/symposium.jpg',
        location: 'Sector 12, Dwarka, New Delhi',
        address: 'First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078',
        isOpen: true,
        isActive: true,
        coordinates: {
          latitude: 28.5923,
          longitude: 77.0406
        },
        menu: []
      }
    ];

    return NextResponse.json({
      restaurants,
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