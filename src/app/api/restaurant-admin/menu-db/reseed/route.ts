import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import MenuItem from '@/lib/backend/models/restaurantMenu.model';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';
import { getAdminMenuData } from '../../menu/route';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // Require admin auth
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

    // Resolve admin and restaurant
    const admin = await (RestaurantAdmin as any).findById(decoded.adminId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { restaurantId: bodyRestaurantId } = body || {};
    const restaurantId = bodyRestaurantId || admin.restaurantId;
    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID not found for admin' }, { status: 400 });
    }

    // Build items from static source
    const staticItems = getAdminMenuData(restaurantId) || [];
    if (!Array.isArray(staticItems) || staticItems.length === 0) {
      return NextResponse.json(
        { error: 'No static menu available to reseed for this restaurant' },
        { status: 404 }
      );
    }

    // Wipe existing items and reseed
    const delRes = await (MenuItem as any).deleteMany({ restaurantId });
    const desiredIds = staticItems.map((it: any) => String(it._id));
    const existingWithIds = await (MenuItem as any)
      .find({ _id: { $in: desiredIds } })
      .select('_id restaurantId')
      .lean();
    const conflictingIds = new Set(
      existingWithIds
        .filter((d: any) => String(d.restaurantId) !== String(restaurantId))
        .map((d: any) => String(d._id))
    );

    const docsToInsert = staticItems.map((item: any) => {
      // Normalize variantPrices to expected schema [{variant, price}]
      let normalizedVariantPrices: Array<{ variant: string; price: number }> = [];
      if (Array.isArray(item.variants) && Array.isArray(item.variantPrices)) {
        const len = Math.max(item.variants.length, item.variantPrices.length);
        normalizedVariantPrices = Array.from({ length: len }, (_, i) => ({
          variant: String(item.variants[i] ?? `Option ${i + 1}`),
          price: Number(item.variantPrices[i] ?? item.price ?? 0)
        }));
      }

      let id = String(item._id);
      if (conflictingIds.has(id)) {
        id = `${restaurantId}_${id}`;
      }

      return {
        _id: id,
        restaurantId,
        name: String(item.name),
        description: (item.description && String(item.description)) || ' ',
        price: Number(item.price ?? 0),
        category: String(item.category || 'Others'),
        isVeg: Boolean(item.isVeg),
        rating: Number(item.rating ?? 0),
        preparationTime: String(item.preparationTime || ''),
        image: item.image || '/images/placeholder-food.jpg',
        isAvailable: typeof item.isAvailable === 'boolean' ? item.isAvailable : true,
        type: item.type === 'NON-VEG' ? 'NON-VEG' : 'VEG',
        variantPrices: normalizedVariantPrices,
        customizations: Array.isArray(item.customizations) ? item.customizations : [],
        isAdminCustomized: false,
        adminImageUrl: item.image || ''
      };
    });

    // Build category counts for diagnostics
    const categoryCounts: Record<string, number> = {};
    docsToInsert.forEach((d) => {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    });

    let insertRes: any[] = [];
    let insertError: any = null;
    try {
      // Use native driver insert to avoid Mongoose validation quirks while fields are normalized
      const raw = await (MenuItem as any).collection.insertMany(docsToInsert, { ordered: false });
      insertRes = raw?.ops || raw?.insertedIds || [];
    } catch (e: any) {
      insertError = {
        message: e?.message || 'insertMany error',
        code: e?.code || undefined
      };
    }

    return NextResponse.json({
      success: true,
      message: `Reseeded menu for restaurant ${restaurantId}`,
      deletedCount: delRes?.deletedCount || 0,
      insertedCount: Array.isArray(insertRes) ? (insertRes as any[]).length : (typeof insertRes === 'object' ? Object.keys(insertRes || {}).length : 0),
      staticCount: staticItems.length,
      preparedCount: docsToInsert.length,
      categoryCounts,
      insertError,
      restaurantId
    });
  } catch (error: any) {
    console.error('Error reseeding restaurant menu:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


