/**
 * Script to create restaurant admin accounts
 * Run: node scripts/create-restaurant-admins.js
 * Or call: POST /api/restaurant-admin/setup with { adminKey: "your-key" }
 */

const fetch = require('node-fetch');

async function createRestaurantAdmins() {
  try {
    const response = await fetch('http://localhost:3000/api/restaurant-admin/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminKey: process.env.ADMIN_SETUP_KEY || 'dev-setup-key'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Restaurant admin accounts created successfully!\n');
      console.log('📋 Login Credentials:\n');
      data.accounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.restaurant}`);
        console.log(`   Email: ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Restaurant ID: ${account.restaurantId}`);
        console.log('');
      });
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  createRestaurantAdmins();
}

module.exports = { createRestaurantAdmins };

