

import 'dotenv/config';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/backend/database';
import MenuItem from '@/lib/backend/models/restaurantMenu.model';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    console.log('CLOUDINARY_CLOUD_NAME =', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY set?', !!process.env.CLOUDINARY_API_KEY);
    console.log('CLOUDINARY_API_SECRET set?', !!process.env.CLOUDINARY_API_SECRET);
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Upload error: Missing Cloudinary environment variables');
      return NextResponse.json({ error: 'Server configuration error (Cloudinary env missing)' }, { status: 500 });
    }
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const dishName = String(form.get('dishName') || 'menu-item');
    const restaurantId = String(form.get('restaurantId') || '');
    const itemId = String(form.get('itemId') || '');

    if (!file) return NextResponse.json({ error: 'File missing' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const folder = `foodfly/menu/${restaurantId}`;
    const upload = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
      stream.end(buffer);
    });

    // Update menu item if provided
    if (itemId) {
      await (MenuItem as any).updateOne({ _id: itemId, restaurantId }, {
        $set: {
          image: upload.secure_url,
          adminImageUrl: upload.secure_url
        }
      });
    }

    return NextResponse.json({
      success: true,
      imagePath: upload.secure_url,
      publicId: upload.public_id
    });
  } catch (e: any) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
