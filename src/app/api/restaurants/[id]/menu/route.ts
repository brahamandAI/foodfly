import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import mongoose from 'mongoose';
import { symposiumMenu } from '@/data/symposiumMenu';
import { cafeAfterHoursMenu } from '@/data/cafeAfterHoursMenu';
import { panacheMenu } from '@/data/panacheMenu';
import { formatMenuCategories } from '@/lib/menuUtils';

// Sanitize image URLs - replace any Unsplash URLs with placeholder
function sanitizeImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return '/images/placeholder.svg';
  }
  
  // Check if it's an Unsplash URL
  if (imageUrl.includes('images.unsplash.com') || imageUrl.includes('unsplash.com')) {
    return '/images/placeholder.svg';
  }
  
  // Check for malformed URLs (like the one in the error)
  if (imageUrl.includes('fit=crop') && imageUrl.includes('categories/')) {
    return '/images/placeholder.svg';
  }
  
  return imageUrl;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable caching completely

// Public API to get restaurant menu (used by frontend) - Database only
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const restaurantId = params.id;
    let restaurant = null;

    // Check if restaurantId is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(restaurantId);
    
    if (isValidObjectId) {
      // Try to find restaurant by MongoDB ID
      restaurant = await (Restaurant as any).findById(restaurantId);
    }
    
    // If not found by ID or not a valid ObjectId, try to find by name (for numeric IDs like '1', '2', '3')
    if (!restaurant) {
      const restaurantNames: Record<string, string> = {
        '1': 'Panache',
        '2': 'Cafe After Hours',
        '3': 'Symposium Restaurant'
      };
      const restaurantName = restaurantNames[restaurantId];
      if (restaurantName) {
        restaurant = await (Restaurant as any).findOne({ name: restaurantName });
      }
    }
    
    // Log for debugging
    if (restaurant) {
      console.log(`[Menu API] Found restaurant: ${restaurant.name} (ID: ${restaurant._id}), Menu items: ${restaurant.menu?.length || 0}`);
    } else {
      console.log(`[Menu API] Restaurant not found for ID: ${restaurantId}`);
    }

    if (!restaurant) {
      // Restaurant not in database - return empty menu
      return NextResponse.json({
        menu: [],
        restaurantId: restaurantId,
        restaurantName: ''
      });
    }

    // If menu is empty, initialize from static files (one-time initialization)
    if (!restaurant.menuCategories || restaurant.menuCategories.length === 0) {
      let staticMenu: any[] = [];
      
      if (restaurant.name === 'Symposium Restaurant') {
        staticMenu = symposiumMenu;
      } else if (restaurant.name === 'Cafe After Hours') {
        staticMenu = cafeAfterHoursMenu;
      } else if (restaurant.name === 'Panache') {
        staticMenu = panacheMenu;
      }

      if (staticMenu.length > 0) {
        const menuCategories = staticMenu.map((category: any) => ({
          name: category.name,
          items: category.items.map((item: any) => ({
            _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            price: typeof item.price === 'string' ? item.price : item.price.toString(),
            description: item.description || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            image: sanitizeImageUrl(item.image),
            isAvailable: true,
            category: category.name,
            createdAt: new Date()
          }))
        }));

        const allMenuItems = menuCategories.flatMap((cat: any) => cat.items);

        restaurant.menuCategories = menuCategories;
        restaurant.menu = allMenuItems;
        await restaurant.save();
      }
    }

    // Re-fetch restaurant to ensure we have the latest data (fresh from database)
    const freshRestaurant = await (Restaurant as any).findById(restaurant._id);
    
    if (!freshRestaurant) {
      return NextResponse.json({
        menu: [],
        restaurantId: restaurantId,
        restaurantName: ''
      });
    }
    
    // Return menu from database with consistent formatting
    const menuCategories = formatMenuCategories(freshRestaurant.menuCategories || []);
    
    const response = NextResponse.json({
      menu: menuCategories,
      restaurantId: freshRestaurant._id,
      restaurantName: freshRestaurant.name
    });
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;

  } catch (error: any) {
    console.error('Get restaurant menu error:', error);
    return NextResponse.json({
      menu: [],
      restaurantId: params.id,
      restaurantName: ''
    });
  }
}

