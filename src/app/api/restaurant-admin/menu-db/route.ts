import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import MenuItem from '@/lib/backend/models/restaurantMenu.model';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';

// Use the same JWT secret fallback everywhere for restaurant-admin
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

// Import the static menu data as fallback
import { getAdminMenuData } from '../menu/route';

// GET - Fetch restaurant menu from database (with fallback to static data)
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

    const restaurantId = admin.restaurantId;

    // Try to get menu from database first
    let dbMenuItems = await MenuItem.find({ restaurantId }).sort({ category: 1, name: 1 });

    // If no items in database, seed with static data
    if (dbMenuItems.length === 0) {
      console.log(`🌱 Seeding menu for restaurant ${restaurantId} from static data`);
      
      // Fetch static items for this specific restaurant
      const staticItems = getAdminMenuData(restaurantId) || [];

      if (staticItems.length > 0) {
        // Convert static data to database format
        const menuItemsToInsert = staticItems.map(item => ({
          ...item,
          restaurantId,
          isAdminCustomized: false,
          adminImageUrl: ''
        }));

        // Insert into database
        await MenuItem.insertMany(menuItemsToInsert);
        
        // Fetch the newly inserted items
        dbMenuItems = await MenuItem.find({ restaurantId }).sort({ category: 1, name: 1 });
        
        console.log(`✅ Seeded ${dbMenuItems.length} items for restaurant ${restaurantId}`);
      }
    }

    // Group by categories
    const categorizedMenu: { [key: string]: any[] } = {};
    dbMenuItems.forEach(item => {
      if (!categorizedMenu[item.category]) {
        categorizedMenu[item.category] = [];
      }
      categorizedMenu[item.category].push(item.toObject());
    });

    return NextResponse.json({
      success: true,
      menu: dbMenuItems.map(item => item.toObject()),
      categorizedMenu,
      restaurantId,
      source: 'database'
    });

  } catch (error) {
    console.error('Error fetching restaurant menu from database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new menu item to database
export async function POST(req: NextRequest) {
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

    const restaurantId = admin.restaurantId;

    // Get the menu item data from request body
    const body = await req.json();
    const {
      name,
      description,
      price,
      category,
      customCategory,
      isVeg,
      rating,
      preparationTime,
      image,
      isAvailable
    } = body;

    // Validate required fields
    if (!name || !description || !price || (!category && !customCategory)) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }

    // Use custom category if provided, otherwise use selected category
    const finalCategory = customCategory || category;

    // Generate new item ID
    const restaurantPrefix = restaurantId === '1' ? 'panache' : restaurantId === '2' ? 'cafe' : 'symposium';
    const newId = `${restaurantPrefix}_${Date.now()}`;

    const newItem = new MenuItem({
      _id: newId,
      restaurantId,
      name,
      description,
      price: parseFloat(price),
      category: finalCategory,
      isVeg: Boolean(isVeg),
      rating: rating ? parseFloat(rating) : 0,
      preparationTime: preparationTime || '',
      image: image || '/images/placeholder-food.jpg',
      isAvailable: Boolean(isAvailable),
      type: isVeg ? 'VEG' : 'NON-VEG',
      isAdminCustomized: true,
      adminImageUrl: image || ''
    });

    await newItem.save();

    console.log(`✅ Added new menu item: ${name} to restaurant ${restaurantId} in database`);

    return NextResponse.json({
      success: true,
      message: 'Menu item added successfully',
      item: newItem.toObject()
    });

  } catch (error) {
    console.error('Error adding menu item to database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update existing menu item in database
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

    const restaurantId = admin.restaurantId;

    // Get the menu item data from request body
    const body = await req.json();
    const {
      itemId,
      name,
      description,
      price,
      category,
      isVeg,
      rating,
      preparationTime,
      image,
      isAvailable
    } = body;

    // Only itemId is required for partial updates
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateFields: any = { isAdminCustomized: true };
    if (typeof name !== 'undefined') updateFields.name = name;
    if (typeof description !== 'undefined') updateFields.description = description;
    if (typeof price !== 'undefined') updateFields.price = parseFloat(price);
    if (typeof category !== 'undefined') updateFields.category = category;
    if (typeof isVeg !== 'undefined') {
      updateFields.isVeg = Boolean(isVeg);
      updateFields.type = isVeg ? 'VEG' : 'NON-VEG';
    }
    if (typeof rating !== 'undefined') updateFields.rating = rating ? parseFloat(rating) : 0;
    if (typeof preparationTime !== 'undefined') updateFields.preparationTime = preparationTime || '';
    if (typeof image !== 'undefined') {
      updateFields.image = image || '/images/placeholder-food.jpg';
      updateFields.adminImageUrl = image || '';
    }
    if (typeof isAvailable !== 'undefined') updateFields.isAvailable = Boolean(isAvailable);

    if (Object.keys(updateFields).length === 1) { // only isAdminCustomized present
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Find and update the menu item
    const updatedItem = await MenuItem.findOneAndUpdate(
      { _id: itemId, restaurantId },
      updateFields,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Updated menu item: ${name} in restaurant ${restaurantId} database`);

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      item: updatedItem.toObject()
    });

  } catch (error) {
    console.error('Error updating menu item in database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove menu item from database
export async function DELETE(req: NextRequest) {
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

    const restaurantId = admin.restaurantId;

    // Get the item ID from query parameters
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the menu item
    const deletedItem = await MenuItem.findOneAndDelete({
      _id: itemId,
      restaurantId
    });

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    console.log(`❌ Deleted menu item: ${deletedItem.name} from restaurant ${restaurantId} database`);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
      deletedItem: deletedItem.toObject()
    });

  } catch (error) {
    console.error('Error deleting menu item from database:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
