import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/backend/database';
import MenuItem from '@/lib/backend/models/restaurantMenu.model';
import RestaurantAdmin from '@/lib/backend/models/restaurantAdmin.model';
import ImageService from '@/lib/imageService';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

function isCloudinaryUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  return /https?:\/\/res\.cloudinary\.com\//i.test(url);
}

function isPlaceholderOrLocal(url: string | undefined | null): boolean {
  if (!url) return true;
  if (url.startsWith('/')) return true; // local public image
  if (/placeholder-food\.jpg/i.test(url)) return true;
  if (/\/images\//i.test(url)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary environment variables missing' }, { status: 500 });
    }
    // No Unsplash required; Pexels/Pixabay are used in ImageService

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

    const admin = await (RestaurantAdmin as any).findById(decoded.adminId).lean();
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      restaurantId: bodyRestaurantId,
      onlyMissing = true,
      max = 100,
      dryRun = false,
      category,
      itemId,
      avoidUrls,
      force = false
    }: { restaurantId?: string; onlyMissing?: boolean; max?: number; dryRun?: boolean; category?: string; itemId?: string; avoidUrl?: string; avoidUrls?: string[]; force?: boolean } = body || {};

    const targetRestaurantIds: string[] = bodyRestaurantId
      ? [String(bodyRestaurantId)]
      : [String(admin.restaurantId)];

    // Fetch items (single item → category → all)
    const findFilter: any = { restaurantId: { $in: targetRestaurantIds } };
    if (itemId) {
      findFilter._id = itemId;
    } else if (category) {
      findFilter.category = category;
    }
    const items: any[] = await (MenuItem as any)
      .find(findFilter)
      .sort({ category: 1, name: 1 })
      .lean();

    // Filter candidates
    const candidates = (itemId && force !== false)
      ? items.slice(0, max) // explicit regeneration for the given item regardless of current image state
      : items.filter((it) => {
          const hasCloud = isCloudinaryUrl(it.image) || isCloudinaryUrl(it.adminImageUrl);
          if (onlyMissing) {
            return !hasCloud; // no Cloudinary yet
          }
          return isPlaceholderOrLocal(it.image) || !hasCloud;
        }).slice(0, max);

    const results: Array<{ id: string; ok: boolean; reason?: string; url?: string }> = [];

    // Process in batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      const ops = batch.map(async (it) => {
        try {
          if (dryRun) {
            results.push({ id: it._id, ok: true, reason: 'dryRun' });
            return;
          }
          const res = await ImageService.processMenuImage(
            it.name,
            it.category || 'menu',
            undefined as any,
            {
              avoidUrls: [body.avoidUrl, ...(avoidUrls || []), it.image, it.adminImageUrl, it.lastImageSourceUrl].filter(Boolean),
              randomize: true,
              providerPreference: force ? 'pixabay-first' : 'pexels-first'
            }
          );
          const newUrl = res.urls.medium;
          await (MenuItem as any).updateOne(
            { _id: it._id },
            {
              $set: {
                image: newUrl,
                adminImageUrl: res.urls.original,
                // keep a history of last image to enable better avoid logic next time
                lastImageSourceUrl: res.sourceUrl
              }
            }
          );
          results.push({ id: it._id, ok: true, url: newUrl });
        } catch (e: any) {
          results.push({ id: it._id, ok: false, reason: e?.message || 'upload-failed' });
        }
      });
      await Promise.all(ops);
      if (i + batchSize < candidates.length) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const success = results.filter(r => r.ok).length;
    const failed = results.length - success;

    return NextResponse.json({
      success: true,
      restaurantIds: targetRestaurantIds,
      totalItems: items.length,
      candidates: candidates.length,
      updated: success,
      failed,
      details: results.slice(0, 20) // truncate
    });

  } catch (error: any) {
    console.error('Error processing menu images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


