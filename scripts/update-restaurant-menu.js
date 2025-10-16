// Script to update restaurant admin menu with EXACT data from RestaurantMenuGrid.tsx
const fs = require('fs');
const path = require('path');

// Read the RestaurantMenuGrid.tsx file and extract exact menu data
const filePath = path.join(__dirname, '../src/components/RestaurantMenuGrid.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Helper function to convert item to admin format
function convertToAdminFormat(item) {
  return {
    _id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    isVeg: item.isVeg,
    rating: item.rating,
    preparationTime: item.preparationTime,
    image: item.image, // leave as-is; external images handled via Cloudinary pipeline
    isAvailable: true, // All items available by default
    type: item.isVeg ? 'VEG' : 'NON-VEG'
  };
}

// Extract menu data for each restaurant
function extractRestaurantData(restaurantId, content) {
  const startPattern = `'${restaurantId}': {`;
  const startIndex = content.indexOf(startPattern);
  if (startIndex === -1) return [];

  // Find the end of this restaurant's data
  const nextRestaurantPattern = restaurantId === '3' ? 'default:' : `'${parseInt(restaurantId) + 1}': {`;
  const endIndex = content.indexOf(nextRestaurantPattern, startIndex);
  
  const restaurantSection = endIndex === -1 ? 
    content.substring(startIndex) : 
    content.substring(startIndex, endIndex);

  // Extract items using regex
  const itemRegex = /{\s*_id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']*)',\s*price:\s*(\d+),\s*image:\s*'([^']*)',\s*category:\s*'([^']+)',\s*isVeg:\s*(true|false),\s*rating:\s*([\d.]+),\s*preparationTime:\s*'([^']*)'/g;
  
  const items = [];
  let match;
  
  while ((match = itemRegex.exec(restaurantSection)) !== null) {
    items.push({
      _id: match[1],
      name: match[2],
      description: match[3],
      price: parseInt(match[4]),
      image: match[5],
      category: match[6],
      isVeg: match[7] === 'true',
      rating: parseFloat(match[8]),
      preparationTime: match[9]
    });
  }
  
  return items;
}

// Extract data for all restaurants
console.log('🔍 Extracting menu data from RestaurantMenuGrid.tsx...\n');

const restaurants = {
  '1': 'Panache',
  '2': 'Cafe After Hours', 
  '3': 'Symposium Restaurant'
};

const menuData = {};

for (const [id, name] of Object.entries(restaurants)) {
  console.log(`📋 Extracting ${name} (ID: ${id})...`);
  const items = extractRestaurantData(id, content);
  
  // Count items by category
  const categories = {};
  items.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  
  console.log(`   📊 Categories: ${Object.keys(categories).length}`);
  console.log(`   🍽️  Total Items: ${items.length}`);
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`      - ${cat}: ${count} items`);
  });
  console.log('');
  
  menuData[id] = items.map(convertToAdminFormat);
}

// Generate the updated menu route file
const routeTemplate = `import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// COMPLETE ORIGINAL MENU DATA - EXACT COPY from RestaurantMenuGrid.tsx
// All items set as AVAILABLE by default with proper status management
let adminMenuData: { [restaurantId: string]: any[] } = ${JSON.stringify(menuData, null, 2)};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🍽️ Restaurant admin menu access, token:', token?.substring(0, 30) + '...');
    
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract restaurant ID from token
    const restaurantId = token.replace('restaurant-admin-token-', '');
    console.log('🏪 Restaurant ID:', restaurantId);

    const menuItems = adminMenuData[restaurantId] || [];
    console.log(\`📋 Found \${menuItems.length} menu items for restaurant \${restaurantId}\`);

    // Get categories with item counts  
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category]++;
    });

    console.log('📊 Categories:', categories);

    return NextResponse.json({
      menuItems,
      categories,
      totalItems: menuItems.length,
      message: 'Menu retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { name, description, price, category, isVeg, preparationTime, image, customCategory } = await request.json();

    if (!name || !price || (!category && !customCategory)) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // Use custom category if provided, otherwise use selected category
    const finalCategory = customCategory || category;

    // Generate new item ID
    const restaurantPrefix = restaurantId === '1' ? 'panache' : restaurantId === '2' ? 'cafe' : 'symposium';
    const newId = \`\${restaurantPrefix}_\${Date.now()}\`;

    const newItem = {
      _id: newId,
      name,
      description: description || '',
      price: parseFloat(price),
      category: finalCategory,
      isVeg: isVeg !== undefined ? isVeg : true,
      rating: 4.0,
      preparationTime: preparationTime || '15-20 mins',
      image: image || '/images/placeholder-food.jpg',
      isAvailable: true, // NEW ITEMS ARE AVAILABLE BY DEFAULT
      type: isVeg ? 'VEG' : 'NON-VEG'
    };

    // Add to menu
    if (!adminMenuData[restaurantId]) {
      adminMenuData[restaurantId] = [];
    }
    adminMenuData[restaurantId].push(newItem);

    console.log(\`✅ Added new menu item: \${name} to restaurant \${restaurantId}\`);

    return NextResponse.json({
      success: true,
      message: 'Menu item added successfully',
      item: newItem
    });

  } catch (error: any) {
    console.error('Add menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { _id, name, description, price, category, isVeg, preparationTime, image, isAvailable } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const menuItems = adminMenuData[restaurantId] || [];
    const itemIndex = menuItems.findIndex(item => item._id === _id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Update item
    const updatedItem = {
      ...menuItems[itemIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(isVeg !== undefined && { isVeg, type: isVeg ? 'VEG' : 'NON-VEG' }),
      ...(preparationTime && { preparationTime }),
      ...(image && { image }),
      ...(isAvailable !== undefined && { isAvailable }) // ALLOW STATUS CHANGES
    };

    adminMenuData[restaurantId][itemIndex] = updatedItem;

    console.log(\`✅ Updated menu item: \${name || updatedItem.name} in restaurant \${restaurantId}\`);

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      item: updatedItem
    });

  } catch (error: any) {
    console.error('Update menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const menuItems = adminMenuData[restaurantId] || [];
    const itemIndex = menuItems.findIndex(item => item._id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const deletedItem = menuItems[itemIndex];
    adminMenuData[restaurantId].splice(itemIndex, 1);

    console.log(\`❌ Deleted menu item: \${deletedItem.name} from restaurant \${restaurantId}\`);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
      item: deletedItem
    });

  } catch (error: any) {
    console.error('Delete menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;

// Write the updated route file
const outputPath = path.join(__dirname, '../src/app/api/restaurant-admin/menu/route.ts');
fs.writeFileSync(outputPath, routeTemplate);

console.log('✅ Updated restaurant admin menu route with exact data from RestaurantMenuGrid.tsx');
console.log(`📁 File saved: ${outputPath}`);
