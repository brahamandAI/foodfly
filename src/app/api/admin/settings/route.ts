import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import mongoose from 'mongoose';

// Settings Schema
const SettingsSchema = new mongoose.Schema({
  deliveryRadius: { type: Number, default: 2 },
  commissionPercentage: { type: Number, default: 10 },
  paymentMethods: {
    cod: { type: Boolean, default: true },
    online: { type: Boolean, default: true },
    upi: { type: Boolean, default: true },
  },
  featureToggles: {
    deliveryTracking: { type: Boolean, default: true },
    ratings: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
  },
}, { timestamps: true });

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = new Settings({
        deliveryRadius: 2,
        commissionPercentage: 10,
        paymentMethods: {
          cod: true,
          online: true,
          upi: true,
        },
        featureToggles: {
          deliveryTracking: true,
          ratings: true,
          promotions: true,
        },
      });
      await settings.save();
    }

    return NextResponse.json({
      settings: {
        deliveryRadius: settings.deliveryRadius,
        commissionPercentage: settings.commissionPercentage,
        paymentMethods: settings.paymentMethods,
        featureToggles: settings.featureToggles,
      }
    });

  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings: {
        deliveryRadius: settings.deliveryRadius,
        commissionPercentage: settings.commissionPercentage,
        paymentMethods: settings.paymentMethods,
        featureToggles: settings.featureToggles,
      }
    });

  } catch (error: any) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

