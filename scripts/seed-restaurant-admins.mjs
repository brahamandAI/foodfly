/**
 * Check and seed restaurant admin users + owned restaurants (same data as POST /api/restaurant-admin/setup).
 *
 * Usage:
 *   node scripts/seed-restaurant-admins.mjs           # check + seed if needed
 *   node scripts/seed-restaurant-admins.mjs --check   # only report status
 *
 * If the Next.js app is running, tries HTTP POST /api/restaurant-admin/setup first (uses ADMIN_SETUP_KEY in production).
 * Otherwise connects to MONGODB_URI and applies the same logic directly.
 *
 * Requires MONGODB_URI in .env (project root).
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const URI = process.env.MONGODB_URI;
const CHECK_ONLY = process.argv.includes('--check');

const RESTAURANTS = [
  {
    name: 'Symposium Restaurant',
    email: 'symposium@foodfly.com',
    password: 'Symposium@123',
    address: {
      street: 'First floor, City Centre Mall, 101, Sector 12 Dwarka',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110078',
      coordinates: { latitude: 28.5923, longitude: 77.0406 },
    },
    phone: '+91 9876543210',
    cuisine: ['Multi-Cuisine'],
    deliveryFee: 50,
    minimumOrder: 200,
  },
  {
    name: 'Cafe After Hours',
    email: 'cafe@foodfly.com',
    password: 'Cafe@123',
    address: {
      street: '17, Pocket A St, Pocket A, Sector 17 Dwarka',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110078',
      coordinates: { latitude: 28.5967, longitude: 77.0329 },
    },
    phone: '+91 9876543211',
    cuisine: ['Italian', 'Continental'],
    deliveryFee: 35,
    minimumOrder: 150,
  },
  {
    name: 'Panache',
    email: 'panache@foodfly.com',
    password: 'Panache@123',
    address: {
      street: 'Ground Floor, Soul City Mall, Sector 13, Dwarka',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110078',
      coordinates: { latitude: 28.5891, longitude: 77.0467 },
    },
    phone: '+91 9876543212',
    cuisine: ['Indian'],
    deliveryFee: 40,
    minimumOrder: 200,
  },
];

const OPENING_HOURS = {
  monday: { open: '10:00', close: '23:00' },
  tuesday: { open: '10:00', close: '23:00' },
  wednesday: { open: '10:00', close: '23:00' },
  thursday: { open: '10:00', close: '23:00' },
  friday: { open: '10:00', close: '23:00' },
  saturday: { open: '10:00', close: '23:00' },
  sunday: { open: '10:00', close: '23:00' },
};

async function tryHttpSetup(db) {
  if (process.env.SKIP_HTTP_SETUP === '1' || process.env.SKIP_HTTP_SETUP === 'true') {
    return false;
  }

  const port = process.env.PORT || '3002';
  const bases = [
    process.env.SEED_API_URL,
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean);

  const body = JSON.stringify({
    adminKey: process.env.ADMIN_SETUP_KEY || 'dev-setup-key',
  });

  for (const base of bases) {
    const url = `${base.replace(/\/$/, '')}/api/restaurant-admin/setup`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
        console.log('Setup via HTTP succeeded:', url);
        console.log(JSON.stringify(data, null, 2));
        const email = RESTAURANTS[0].email.toLowerCase();
        const u = await db.collection('users').findOne({ email });
        if (u) return true;
        console.warn('HTTP reported success but users not found in MONGODB_URI — falling back to direct seed.');
        return false;
      }
      if (res.status === 401) {
        console.log(`HTTP setup unauthorized (${url}) — set ADMIN_SETUP_KEY or use direct MongoDB seed.`);
      }
    } catch {
      /* try next base */
    }
  }
  return false;
}

async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
}

async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

async function checkStatus(db) {
  const users = db.collection('users');
  const rests = db.collection('restaurants');
  console.log('\n--- Restaurant admin status ---\n');
  for (const r of RESTAURANTS) {
    const email = r.email.toLowerCase();
    const user = await users.findOne({ email });
    const line = user
      ? `user OK (_id: ${user._id})`
      : 'MISSING user';
    let restLine = 'no restaurant';
    if (user) {
      const restaurant = await rests.findOne({ owner: user._id });
      restLine = restaurant
        ? `restaurant OK (${restaurant.name}, _id: ${restaurant._id})`
        : 'MISSING restaurant for this owner';
    }
    console.log(`${r.name} (${email}): ${line}; ${restLine}`);
  }
  console.log('');
}

async function seedDirect(db) {
  const users = db.collection('users');
  const rests = db.collection('restaurants');

  for (const restData of RESTAURANTS) {
    const email = restData.email.toLowerCase();
    let user = await users.findOne({ email });

    if (!user) {
      const hashed = await hashPassword(restData.password);
      const doc = {
        name: `${restData.name} Admin`,
        email,
        password: hashed,
        phone: restData.phone,
        role: 'customer',
        isEmailVerified: true,
        addresses: [],
        preferences: { dietary: [], allergies: [], cuisinePreferences: [] },
        healthProfile: { healthGoals: [] },
        favoriteRestaurants: [],
        orderHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const ins = await users.insertOne(doc);
      user = await users.findOne({ _id: ins.insertedId });
      console.log('Created user:', email);
    } else {
      const ok = await comparePassword(restData.password, user.password);
      if (!ok) {
        const hashed = await hashPassword(restData.password);
        await users.updateOne({ _id: user._id }, { $set: { password: hashed, updatedAt: new Date() } });
        console.log('Updated password for:', email);
      }
    }

    let restaurant =
      (await rests.findOne({ owner: user._id })) ||
      (await rests.findOne({ email: restData.email }));

    if (!restaurant) {
      await rests.insertOne({
        name: restData.name,
        owner: user._id,
        description: `${restData.name} - Premium dining experience`,
        cuisine: restData.cuisine,
        address: restData.address,
        phone: restData.phone,
        email: restData.email,
        openingHours: OPENING_HOURS,
        rating: 4.5,
        deliveryFee: restData.deliveryFee,
        minimumOrder: restData.minimumOrder,
        isActive: true,
        preparationTime: 30,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Created restaurant for:', email);
    } else {
      const ownerMatches = restaurant.owner?.toString?.() === user._id.toString();
      if (!ownerMatches) {
        await rests.updateOne(
          { _id: restaurant._id },
          {
            $set: {
              owner: user._id,
              name: restData.name,
              email: restData.email,
              phone: restData.phone,
              address: restData.address,
              cuisine: restData.cuisine,
              deliveryFee: restData.deliveryFee,
              minimumOrder: restData.minimumOrder,
              updatedAt: new Date(),
            },
          }
        );
        console.log('Updated restaurant owner + fields for:', email);
      }
    }
  }
}

async function main() {
  if (!URI) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(URI);
  const db = mongoose.connection.db;

  if (!CHECK_ONLY) {
    const httpOk = await tryHttpSetup(db);
    if (httpOk) {
      await checkStatus(db);
      await mongoose.disconnect();
      return;
    }
    console.log('Using direct MongoDB seed...\n');
  }

  await checkStatus(db);

  if (CHECK_ONLY) {
    await mongoose.disconnect();
    return;
  }

  await seedDirect(db);
  console.log('Direct seed completed. Status:\n');
  await checkStatus(db);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
