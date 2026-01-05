import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';
import { symposiumMenu } from '@/data/symposiumMenu';
import { cafeAfterHoursMenu } from '@/data/cafeAfterHoursMenu';
import { panacheMenu } from '@/data/panacheMenu';
import { formatMenuCategories } from '@/lib/menuUtils';

export const dynamic = 'force-dynamic';

// Store menu in restaurant document
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns this restaurant
    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: user._id 
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 403 }
      );
    }

    // If menu is empty, initialize from static files
    if (!restaurant.menuCategories || restaurant.menuCategories.length === 0) {
      let staticMenu: any[] = [];
      
      // Load appropriate static menu based on restaurant name
      if (restaurant.name === 'Symposium Restaurant') {
        staticMenu = symposiumMenu;
      } else if (restaurant.name === 'Cafe After Hours') {
        staticMenu = cafeAfterHoursMenu;
      } else if (restaurant.name === 'Panache') {
        staticMenu = panacheMenu;
      }

      // Convert static menu to database format and save
      if (staticMenu.length > 0) {
        const menuCategories = staticMenu.map((category: any) => ({
          name: category.name,
          items: category.items.map((item: any) => ({
            _id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            price: typeof item.price === 'string' ? item.price : item.price.toString(),
            description: item.description || '',
            isVeg: item.isVeg !== undefined ? item.isVeg : true,
            image: item.image || '/images/placeholder.svg',
            isAvailable: true,
            category: category.name,
            createdAt: new Date()
          }))
        }));

        const allMenuItems = menuCategories.flatMap((cat: any) => cat.items);

        restaurant.menuCategories = menuCategories;
        restaurant.menu = allMenuItems;
        await restaurant.save();

        return NextResponse.json({
          menu: menuCategories,
          categories: menuCategories,
          initialized: true
        });
      }
    }

    // Re-fetch restaurant to ensure we have the latest data (fresh from database)
    const freshRestaurant = await (Restaurant as any).findById(restaurant._id);
    
    if (!freshRestaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    
    // Return menu from database with consistent formatting
    const menuCategories = formatMenuCategories(freshRestaurant.menuCategories || []);
    
    return NextResponse.json({
      menu: menuCategories,
      categories: menuCategories
    });

  } catch (error: any) {
    console.error('Get menu error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { restaurantId, category, item } = await request.json();

    if (!restaurantId || !category || !item) {
      return NextResponse.json(
        { error: 'Restaurant ID, category, and item are required' },
        { status: 400 }
      );
    }

    // Verify user owns this restaurant
    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: user._id 
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 403 }
      );
    }

    // Initialize menu if not exists
    if (!restaurant.menu) {
      restaurant.menu = [];
    }
    if (!restaurant.menuCategories) {
      restaurant.menuCategories = [];
    }

    // Add item to menu
    const menuItem = {
      _id: new Date().getTime().toString(),
      name: item.name,
      price: typeof item.price === 'string' ? item.price : item.price.toString(),
      description: item.description || '',
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      image: item.image || '/images/placeholder.svg',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      category: category,
      createdAt: new Date()
    };

    // Find or create category
    let categoryIndex = restaurant.menuCategories.findIndex((c: any) => c.name === category);
    if (categoryIndex === -1) {
      restaurant.menuCategories.push({
        name: category,
        items: [menuItem]
      });
    } else {
      restaurant.menuCategories[categoryIndex].items.push(menuItem);
    }

    restaurant.menu.push(menuItem);
    await restaurant.save();

    return NextResponse.json({
      message: 'Menu item added successfully',
      item: menuItem
    });

  } catch (error: any) {
    console.error('Add menu item error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { restaurantId, itemId, updates } = await request.json();

    if (!restaurantId || !itemId || !updates) {
      return NextResponse.json(
        { error: 'Restaurant ID, item ID, and updates are required' },
        { status: 400 }
      );
    }

    // Verify user owns this restaurant
    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: user._id 
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 403 }
      );
    }

    // Try to find item by ID first
    let itemIndex = restaurant.menu.findIndex((item: any) => item._id === itemId || item._id?.toString() === itemId);
    
    // If not found by ID, try to find by name and category (for static menu items)
    if (itemIndex === -1 && updates.name && updates.category) {
      itemIndex = restaurant.menu.findIndex((item: any) => 
        item.name === updates.name && item.category === updates.category
      );
    }
    
    // If still not found, create as new item
    if (itemIndex === -1) {
      // Create new menu item
      const menuItem = {
        _id: new Date().getTime().toString(),
        name: updates.name,
        price: updates.price,
        description: updates.description || '',
        isVeg: updates.isVeg !== undefined ? updates.isVeg : true,
        image: updates.image || '/images/placeholder.svg',
        isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : true,
        category: updates.category,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Find or create category
      let categoryIndex = restaurant.menuCategories.findIndex((c: any) => c.name === updates.category);
      if (categoryIndex === -1) {
        restaurant.menuCategories.push({
          name: updates.category,
          items: [menuItem]
        });
      } else {
        restaurant.menuCategories[categoryIndex].items.push(menuItem);
      }

      restaurant.menu.push(menuItem);
      await restaurant.save();

      return NextResponse.json({
        message: 'Menu item created successfully',
        item: menuItem
      });
    }

    // Update existing item - explicitly set all fields to ensure proper update
    const menuItem = restaurant.menu[itemIndex];
    
    // Convert price to number properly
    let priceValue = updates.price;
    if (typeof priceValue === 'string') {
      priceValue = parseFloat(priceValue) || menuItem.price;
    }
    if (typeof priceValue !== 'number' || isNaN(priceValue)) {
      priceValue = menuItem.price;
    }
    
    // Explicitly set all fields and mark as modified
    menuItem.name = updates.name || menuItem.name;
    menuItem.price = priceValue;
    menuItem.description = updates.description !== undefined ? updates.description : menuItem.description;
    menuItem.isVeg = updates.isVeg !== undefined ? updates.isVeg : menuItem.isVeg;
    menuItem.isAvailable = updates.isAvailable !== undefined ? updates.isAvailable : menuItem.isAvailable;
    menuItem.category = updates.category || menuItem.category;
    menuItem.updatedAt = new Date();
    
    // Mark the menu array as modified
    restaurant.markModified('menu');
    
    // Ensure _id exists for future updates
    if (!menuItem._id) {
      menuItem._id = new Date().getTime().toString();
    }

    // Also update in categories - explicitly update all fields
    if (restaurant.menuCategories) {
      restaurant.menuCategories.forEach((cat: any) => {
        const catItemIndex = cat.items.findIndex((item: any) => 
          item._id === itemId || 
          item._id?.toString() === itemId ||
          (item.name === updates.name && item.category === updates.category)
        );
        if (catItemIndex !== -1) {
          const catItem = cat.items[catItemIndex];
          
          // Convert price to number properly
          let catPriceValue = updates.price;
          if (typeof catPriceValue === 'string') {
            catPriceValue = parseFloat(catPriceValue) || catItem.price;
          }
          if (typeof catPriceValue !== 'number' || isNaN(catPriceValue)) {
            catPriceValue = catItem.price;
          }
          
          catItem.name = updates.name || catItem.name;
          catItem.price = catPriceValue;
          catItem.description = updates.description !== undefined ? updates.description : catItem.description;
          catItem.isVeg = updates.isVeg !== undefined ? updates.isVeg : catItem.isVeg;
          catItem.isAvailable = updates.isAvailable !== undefined ? updates.isAvailable : catItem.isAvailable;
          catItem.category = updates.category || catItem.category;
          catItem.updatedAt = new Date();
          if (!catItem._id) {
            catItem._id = menuItem._id;
          }
        }
      });
      
      // Mark menuCategories as modified
      restaurant.markModified('menuCategories');
    }

    await restaurant.save();

    return NextResponse.json({
      message: 'Menu item updated successfully',
      item: restaurant.menu[itemIndex]
    });

  } catch (error: any) {
    console.error('Update menu item error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const itemId = searchParams.get('itemId');

    if (!restaurantId || !itemId) {
      return NextResponse.json(
        { error: 'Restaurant ID and item ID are required' },
        { status: 400 }
      );
    }

    // Verify user owns this restaurant
    const restaurant = await (Restaurant as any).findOne({ 
      _id: restaurantId,
      owner: user._id 
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 403 }
      );
    }

    // Find item to get its name and category for matching
    const itemToDelete = restaurant.menu.find((item: any) => 
      item._id === itemId || 
      item._id?.toString() === itemId
    );

    // Remove item from menu (by ID or by name if ID doesn't match)
    if (itemToDelete) {
      restaurant.menu = restaurant.menu.filter((item: any) => 
        item._id !== itemId && 
        item._id?.toString() !== itemId &&
        !(item.name === itemToDelete.name && item.category === itemToDelete.category)
      );
    } else {
      // If item not found, try to remove by ID anyway
      restaurant.menu = restaurant.menu.filter((item: any) => 
        item._id !== itemId && item._id?.toString() !== itemId
      );
    }

    // Also remove from categories
    if (restaurant.menuCategories) {
      restaurant.menuCategories.forEach((cat: any) => {
        if (itemToDelete) {
          cat.items = cat.items.filter((item: any) => 
            item._id !== itemId && 
            item._id?.toString() !== itemId &&
            !(item.name === itemToDelete.name && item.category === itemToDelete.category)
          );
        } else {
          cat.items = cat.items.filter((item: any) => 
            item._id !== itemId && item._id?.toString() !== itemId
          );
        }
      });
    }

    await restaurant.save();

    return NextResponse.json({
      message: 'Menu item deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete menu item error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

