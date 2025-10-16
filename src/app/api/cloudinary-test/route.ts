import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    // Configure Cloudinary with env variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Upload a tiny dummy image (can be a placeholder)
    const result = await cloudinary.uploader.upload(
      'https://via.placeholder.com/150',
      { folder: 'foodfly-test' }
    );

    return NextResponse.json({
      success: true,
      message: 'Cloudinary is working!',
      result,
    });
  } catch (error: any) {
    console.error('Cloudinary test failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
