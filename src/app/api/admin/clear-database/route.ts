import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import mongoose from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Collections to clear
    const collectionsToDelete = [
      'users',
      'chefs', 
      'deliverypartners',
      'orders',
      'chefbookings',
      'notifications',
      'carts',
      'addresses'
    ];
    
    console.log('🧹 Clearing database collections...');
    
    const results = [];
    
    for (const collectionName of collectionsToDelete) {
      try {
        const collection = mongoose.connection.db?.collection(collectionName);
        if (collection) {
          const result = await collection.deleteMany({});
          results.push({
            collection: collectionName,
            deletedCount: result.deletedCount,
            status: 'success'
          });
          console.log(`✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
        }
      } catch (error: any) {
        results.push({
          collection: collectionName,
          error: error.message,
          status: 'error'
        });
        console.log(`⚠️  Error clearing ${collectionName}: ${error.message}`);
      }
    }
    
    console.log('🎉 Database clearing completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      results,
      clearedCollections: results.filter(r => r.status === 'success').map(r => r.collection),
      totalDocumentsDeleted: results.reduce((total, r) => total + (r.deletedCount || 0), 0)
    });

  } catch (error: any) {
    console.error('❌ Error clearing database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear database', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to clear database',
    collections: [
      'users (customers)',
      'chefs', 
      'deliverypartners',
      'orders',
      'chefbookings',
      'notifications',
      'carts',
      'addresses'
    ]
  });
}
