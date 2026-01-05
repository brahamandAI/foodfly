import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { sanitizeImageUrl } from '@/lib/menuUtils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchResult {
  type: 'dish' | 'restaurant';
  dish?: {
    _id: string;
    name: string;
    price: number | string;
    description: string;
    category: string;
    isVeg: boolean;
    isAvailable: boolean;
    image: string;
    restaurantId: string;
    restaurantName: string;
  };
  restaurant?: {
    _id: string;
    name: string;
    cuisine: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: number;
    location: string;
    isActive: boolean;
  };
  relevanceScore: number;
}

// Intent detection patterns
const INTENT_PATTERNS = {
  veg: ['veg', 'vegetarian', 'veggie'],
  nonveg: ['nonveg', 'non-veg', 'non vegetarian', 'chicken', 'mutton', 'fish', 'prawn', 'seafood'],
  cheap: ['cheap', 'budget', 'affordable', 'low price', 'economical'],
  expensive: ['expensive', 'premium', 'luxury', 'high price'],
  open: ['open', 'open now', 'available now'],
  near: ['near me', 'nearby', 'close', 'near'],
  category: ['biryani', 'pizza', 'burger', 'pasta', 'soup', 'salad', 'dessert', 'beverage', 'appetizer'],
  cuisine: ['chinese', 'indian', 'italian', 'mexican', 'thai', 'japanese', 'continental']
};

function detectIntent(query: string): {
  isVeg?: boolean;
  priceRange?: 'cheap' | 'expensive';
  category?: string;
  cuisine?: string;
  nearMe?: boolean;
} {
  const lowerQuery = query.toLowerCase();
  const intent: any = {};

  // Check for veg/non-veg
  if (INTENT_PATTERNS.veg.some(pattern => lowerQuery.includes(pattern))) {
    intent.isVeg = true;
  } else if (INTENT_PATTERNS.nonveg.some(pattern => lowerQuery.includes(pattern))) {
    intent.isVeg = false;
  }

  // Check for price intent
  if (INTENT_PATTERNS.cheap.some(pattern => lowerQuery.includes(pattern))) {
    intent.priceRange = 'cheap';
  } else if (INTENT_PATTERNS.expensive.some(pattern => lowerQuery.includes(pattern))) {
    intent.priceRange = 'expensive';
  }

  // Check for category
  for (const category of INTENT_PATTERNS.category) {
    if (lowerQuery.includes(category)) {
      intent.category = category;
      break;
    }
  }

  // Check for cuisine
  for (const cuisine of INTENT_PATTERNS.cuisine) {
    if (lowerQuery.includes(cuisine)) {
      intent.cuisine = cuisine;
      break;
    }
  }

  // Check for "near me"
  if (INTENT_PATTERNS.near.some(pattern => lowerQuery.includes(pattern))) {
    intent.nearMe = true;
  }

  return intent;
}

function calculateRelevanceScore(item: any, query: string, intent: any): number {
  const lowerQuery = query.toLowerCase();
  const lowerName = item.name.toLowerCase();
  const lowerDescription = (item.description || '').toLowerCase();
  const lowerCategory = (item.category || '').toLowerCase();
  let score = 0;

  // Exact name match (highest priority)
  if (lowerName === lowerQuery) {
    score += 100;
  } else if (lowerName.startsWith(lowerQuery)) {
    score += 80;
  } else if (lowerName.includes(lowerQuery)) {
    score += 60;
  }

  // Description match
  if (lowerDescription.includes(lowerQuery)) {
    score += 30;
  }

  // Category match
  if (lowerCategory.includes(lowerQuery)) {
    score += 40;
  }

  // Intent matching
  if (intent.isVeg !== undefined && item.isVeg === intent.isVeg) {
    score += 20;
  }

  if (intent.priceRange === 'cheap') {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).split('/')[0]) || 0;
    if (price < 200) score += 15;
  } else if (intent.priceRange === 'expensive') {
    const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).split('/')[0]) || 0;
    if (price > 400) score += 15;
  }

  if (intent.category && lowerCategory.includes(intent.category)) {
    score += 25;
  }

  // Availability boost
  if (item.isAvailable) {
    score += 10;
  }

  return score;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!query.trim()) {
      return NextResponse.json({
        dishes: [],
        restaurants: [],
        total: 0
      });
    }

    // Detect user intent
    const intent = detectIntent(query);
    
    // Get all restaurants with their current menu data from database
    // Use lean() for better performance and to get plain JavaScript objects
    // Explicitly select all fields including menu and menuCategories
    const restaurants = await (Restaurant as any)
      .find({})
      .select('name cuisine rating deliveryFee preparationTime address isActive menu menuCategories')
      .lean();
    
    console.log(`[Search] Found ${restaurants.length} restaurants for query: "${query}"`);
    
    const dishResults: SearchResult[] = [];
    const restaurantResults: SearchResult[] = [];

    // Search through all restaurants and their menus
    for (const restaurant of restaurants) {
      if (!restaurant) continue;
      
      console.log(`[Search] Processing restaurant: ${restaurant.name}, menuCategories: ${restaurant.menuCategories?.length || 0}, menu: ${restaurant.menu?.length || 0}`);
      // Check restaurant name match
      const restaurantNameLower = (restaurant.name || '').toLowerCase();
      // Handle cuisine as array or string
      const cuisineArray = Array.isArray(restaurant.cuisine) 
        ? restaurant.cuisine 
        : (restaurant.cuisine ? [restaurant.cuisine] : []);
      const cuisineLower = cuisineArray.map((c: any) => String(c || '').toLowerCase()).join(' ');
      const queryLower = query.toLowerCase();

      if (restaurantNameLower.includes(queryLower) || cuisineLower.includes(queryLower)) {
        restaurantResults.push({
          type: 'restaurant',
          restaurant: {
            _id: restaurant._id.toString(),
            name: restaurant.name,
            cuisine: Array.isArray(restaurant.cuisine) ? restaurant.cuisine[0] : restaurant.cuisine || 'Multi-Cuisine',
            rating: restaurant.rating || 4.5,
            deliveryTime: `${restaurant.preparationTime || 30}-${(restaurant.preparationTime || 30) + 10} mins`,
            deliveryFee: restaurant.deliveryFee || 40,
            location: `${restaurant.address?.city || ''}, ${restaurant.address?.state || ''}`,
            isActive: restaurant.isActive !== false
          },
          relevanceScore: restaurantNameLower === queryLower ? 100 : 
                         restaurantNameLower.startsWith(queryLower) ? 80 : 60
        });
      }

      // Search menu items - check both menuCategories and menu arrays
      let menuItems: any[] = [];
      
      // First, try menuCategories (structured format) - this is the primary format
      if (restaurant.menuCategories && Array.isArray(restaurant.menuCategories) && restaurant.menuCategories.length > 0) {
        for (const category of restaurant.menuCategories) {
          if (category && category.items && Array.isArray(category.items)) {
            const categoryItems = category.items.map((item: any) => ({
              ...item,
              category: item.category || category.name || 'Uncategorized'
            }));
            menuItems = menuItems.concat(categoryItems);
          }
        }
      }
      
      // Also check direct menu array (flat format) - use as fallback or supplement
      if (restaurant.menu && Array.isArray(restaurant.menu) && restaurant.menu.length > 0) {
        // If we already have items from menuCategories, merge them (avoid duplicates)
        if (menuItems.length === 0) {
          menuItems = restaurant.menu;
        } else {
          // Merge unique items from menu array
          const existingNames = new Set(menuItems.map((item: any) => item.name?.toLowerCase()));
          const additionalItems = restaurant.menu.filter((item: any) => 
            item.name && !existingNames.has(item.name.toLowerCase())
          );
          menuItems = menuItems.concat(additionalItems);
        }
      }
      
      console.log(`[Search] ${restaurant.name}: Found ${menuItems.length} total menu items to search`);

      // Search through all menu items
      let matchedItemsCount = 0;
      for (const item of menuItems) {
        // Skip items without a name
        if (!item || !item.name) {
          continue;
        }
        
        // Skip unavailable items unless explicitly searching for them
        if (item.isAvailable === false && !query.toLowerCase().includes('unavailable')) {
          continue;
        }

        const itemNameLower = String(item.name || '').toLowerCase();
        const itemDescLower = String(item.description || '').toLowerCase();
        const itemCategoryLower = String(item.category || '').toLowerCase();

        // Check if item matches query (more flexible matching)
        const matches = 
          itemNameLower.includes(queryLower) ||
          itemDescLower.includes(queryLower) ||
          itemCategoryLower.includes(queryLower) ||
          queryLower.split(' ').some(word => itemNameLower.includes(word)); // Match individual words

        if (matches) {
          const relevanceScore = calculateRelevanceScore(item, query, intent);
          
          if (relevanceScore > 0) {
            matchedItemsCount++;
            dishResults.push({
              type: 'dish',
              dish: {
                _id: item._id ? item._id.toString() : `${restaurant._id}_${item.name}_${Date.now()}`,
                name: item.name,
                price: item.price,
                description: item.description || '',
                category: item.category || 'Uncategorized',
                isVeg: item.isVeg !== undefined ? item.isVeg : true,
                isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                image: sanitizeImageUrl(item.image),
                restaurantId: restaurant._id.toString(),
                restaurantName: restaurant.name
              },
              relevanceScore
            });
          }
        }
      }
      
      if (matchedItemsCount > 0) {
        console.log(`[Search] ${restaurant.name}: Found ${matchedItemsCount} matching items`);
      }
    }

    // Sort by relevance score (highest first)
    dishResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    restaurantResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    console.log(`[Search] Total results: ${dishResults.length} dishes, ${restaurantResults.length} restaurants`);

    // Apply intent filters
    let filteredDishes = dishResults;
    
    if (intent.isVeg !== undefined) {
      filteredDishes = filteredDishes.filter(r => r.dish?.isVeg === intent.isVeg);
    }

    if (intent.priceRange === 'cheap') {
      filteredDishes = filteredDishes.filter(r => {
        const price = typeof r.dish?.price === 'number' 
          ? r.dish.price 
          : parseFloat(String(r.dish?.price).split('/')[0]) || 0;
        return price < 200;
      });
    } else if (intent.priceRange === 'expensive') {
      filteredDishes = filteredDishes.filter(r => {
        const price = typeof r.dish?.price === 'number' 
          ? r.dish.price 
          : parseFloat(String(r.dish?.price).split('/')[0]) || 0;
        return price > 400;
      });
    }

    if (intent.category) {
      filteredDishes = filteredDishes.filter(r => 
        (r.dish?.category || '').toLowerCase().includes(intent.category!)
      );
    }

    // Filter by open restaurants if "open now" or "near me" intent
    if (intent.nearMe) {
      filteredDishes = filteredDishes.filter(r => {
        const restaurant = restaurants.find((rest: any) => 
          rest._id.toString() === r.dish?.restaurantId
        );
        return restaurant?.isActive !== false;
      });
    }

    // Limit results
    const limitedDishes = filteredDishes.slice(0, limit);
    const limitedRestaurants = restaurantResults.slice(0, 10);

    const response = NextResponse.json({
      dishes: limitedDishes.map(r => r.dish),
      restaurants: limitedRestaurants.map(r => r.restaurant),
      total: limitedDishes.length + limitedRestaurants.length,
      intent
    });
    
    // Add cache-busting headers to ensure fresh results
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({
      dishes: [],
      restaurants: [],
      total: 0,
      error: 'Search failed'
    }, { status: 500 });
  }
}

