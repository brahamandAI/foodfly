const { MongoClient } = require('mongodb');
require('dotenv').config();

async function clearDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodfly');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Collections to clear
    const collections = [
      'users',
      'chefs', 
      'deliverypartners',
      'orders',
      'chefbookings',
      'notifications',
      'carts',
      'addresses'
    ];
    
    console.log('\n🧹 Clearing database collections...\n');
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(`✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} might not exist or error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Database cleared successfully!');
    console.log('\n📋 What was cleared:');
    console.log('   • All users (customers)');
    console.log('   • All chefs');
    console.log('   • All delivery partners');
    console.log('   • All orders');
    console.log('   • All chef bookings');
    console.log('   • All notifications');
    console.log('   • All cart items');
    console.log('   • All addresses');
    
    console.log('\n🚀 You can now:');
    console.log('   1. Register new customers');
    console.log('   2. Create new orders from different restaurants');
    console.log('   3. Test restaurant admin order management');
    console.log('   4. Verify orders appear in correct restaurant dashboards');
    console.log('   5. Check super admin sees all orders');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await client.close();
    console.log('\n🔒 Database connection closed');
  }
}

clearDatabase();
