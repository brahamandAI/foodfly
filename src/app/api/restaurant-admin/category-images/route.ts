import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import CategoryImage from '@/lib/backend/models/categoryImage.model';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';
import ImageService from '@/lib/imageService';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary environment variables missing' }, { status: 500 });
    }
    if (!process.env.PEXELS_API_KEY && !process.env.PIXABAY_API_KEY) {
      return NextResponse.json({ error: 'Provide PEXELS_API_KEY or PIXABAY_API_KEY' }, { status: 500 });
    }

    await connectDB();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); } catch { return NextResponse.json({ error: 'Invalid token' }, { status: 401 }); }

    const admin = await (RestaurantAdmin as any).findById(decoded.adminId).lean();
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { restaurantId: bodyRestaurantId, categories = [], max = 10, dryRun = false } = body || {};
    const restaurantId = bodyRestaurantId || admin.restaurantId;

    // Build target categories from existing menu if not provided
    let targetCategories: string[] = categories;
    if (!Array.isArray(categories) || categories.length === 0) {
      // Prefer distinct categories from menu items
      const menuItems = await (await import('@/lib/backend/models/restaurantMenu.model')).default
        .find({ restaurantId })
        .select('category')
        .lean();
      targetCategories = Array.from(new Set(menuItems.map((m: any) => m.category).filter(Boolean))).slice(0, max);
    } else {
      targetCategories = categories.slice(0, max);
    }

    const results: any[] = [];
    for (const category of targetCategories) {
      try {
        if (dryRun) {
          results.push({ category, ok: true, reason: 'dryRun' });
          continue;
        }
        const processed = await ImageService.processMenuImage(category, 'category-banner', 'foodfly/categories');
        const id = `${restaurantId}::${category}`;
        await CategoryImage.findOneAndUpdate(
          { _id: id },
          {
            _id: id,
            restaurantId,
            category,
            imageUrl: processed.urls.large,
            originalUrl: processed.urls.original,
            publicId: processed.public_id,
            provider: process.env.PEXELS_API_KEY ? 'pexels' : (process.env.PIXABAY_API_KEY ? 'pixabay' : 'unknown')
          },
          { upsert: true, new: true }
        );
        results.push({ category, ok: true, url: processed.urls.large });
      } catch (e: any) {
        results.push({ category, ok: false, reason: e?.message || 'failed' });
      }
    }

    const updated = results.filter(r => r.ok).length;
    const failed = results.length - updated;
    return NextResponse.json({ success: true, restaurantId, total: results.length, updated, failed, details: results.slice(0, 20) });
  } catch (error: any) {
    console.error('Category images error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


