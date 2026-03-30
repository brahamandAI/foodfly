import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import { Restaurant } from '@/lib/backend/models/restaurant.model';
import { verifyToken } from '@/lib/backend/middleware/auth';

export const dynamic = 'force-dynamic';

// Add a new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(request);
    const { restaurantId, categoryName } = await request.json();

    if (!restaurantId || !categoryName?.trim()) {
      return NextResponse.json({ error: 'Restaurant ID and category name are required' }, { status: 400 });
    }

    const restaurant = await (Restaurant as any).findOne({ _id: restaurantId, owner: user._id });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 403 });
    }

    if (!restaurant.menuCategories) restaurant.menuCategories = [];

    const exists = restaurant.menuCategories.some((c: any) => c.name.toLowerCase() === categoryName.trim().toLowerCase());
    if (exists) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    }

    restaurant.menuCategories.push({ name: categoryName.trim(), items: [] });
    restaurant.markModified('menuCategories');
    await restaurant.save();

    return NextResponse.json({ message: 'Category added successfully', categories: restaurant.menuCategories.map((c: any) => ({ name: c.name, itemCount: c.items?.length || 0 })) });
  } catch (error: any) {
    console.error('Add category error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Rename a category
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(request);
    const { restaurantId, oldName, newName } = await request.json();

    if (!restaurantId || !oldName?.trim() || !newName?.trim()) {
      return NextResponse.json({ error: 'Restaurant ID, old name, and new name are required' }, { status: 400 });
    }

    const restaurant = await (Restaurant as any).findOne({ _id: restaurantId, owner: user._id });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 403 });
    }

    const catIndex = (restaurant.menuCategories || []).findIndex((c: any) => c.name === oldName.trim());
    if (catIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const alreadyExists = restaurant.menuCategories.some((c: any, i: number) => i !== catIndex && c.name.toLowerCase() === newName.trim().toLowerCase());
    if (alreadyExists) {
      return NextResponse.json({ error: 'A category with that name already exists' }, { status: 409 });
    }

    // Rename category and update all items in it
    restaurant.menuCategories[catIndex].name = newName.trim();
    restaurant.menuCategories[catIndex].items = (restaurant.menuCategories[catIndex].items || []).map((item: any) => ({
      ...item,
      category: newName.trim()
    }));

    // Also update items in the flat menu array
    if (restaurant.menu) {
      restaurant.menu = restaurant.menu.map((item: any) =>
        item.category === oldName.trim() ? { ...item, category: newName.trim() } : item
      );
      restaurant.markModified('menu');
    }

    restaurant.markModified('menuCategories');
    await restaurant.save();

    return NextResponse.json({ message: 'Category renamed successfully', categories: restaurant.menuCategories.map((c: any) => ({ name: c.name, itemCount: c.items?.length || 0 })) });
  } catch (error: any) {
    console.error('Rename category error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a category (and all its items)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const user = verifyToken(request);
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const categoryName = searchParams.get('categoryName');

    if (!restaurantId || !categoryName) {
      return NextResponse.json({ error: 'Restaurant ID and category name are required' }, { status: 400 });
    }

    const restaurant = await (Restaurant as any).findOne({ _id: restaurantId, owner: user._id });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found or access denied' }, { status: 403 });
    }

    const catIndex = (restaurant.menuCategories || []).findIndex((c: any) => c.name === categoryName);
    if (catIndex === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Remove category
    restaurant.menuCategories.splice(catIndex, 1);
    restaurant.markModified('menuCategories');

    // Remove all items belonging to this category from the flat menu
    if (restaurant.menu) {
      restaurant.menu = restaurant.menu.filter((item: any) => item.category !== categoryName);
      restaurant.markModified('menu');
    }

    await restaurant.save();

    return NextResponse.json({ message: 'Category deleted successfully', categories: restaurant.menuCategories.map((c: any) => ({ name: c.name, itemCount: c.items?.length || 0 })) });
  } catch (error: any) {
    console.error('Delete category error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
