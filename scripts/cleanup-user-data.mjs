/**
 * One-off cleanup: remove customer/chef/delivery user accounts and user-linked data.
 * Keeps only User documents with role "admin".
 * Does NOT touch restaurants, menus, menu items, deals, or prices.
 *
 * Usage: node scripts/cleanup-user-data.mjs
 * Requires MONGODB_URI in .env (project root).
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '..', '.env') });

const URI = process.env.MONGODB_URI;
if (!URI) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

/** Mongoose default collection names for user/chef/order activity (not restaurant/menu). */
const USER_RELATED_COLLECTIONS = [
  'chefbookings',
  'chefeventrequests',
  'reviews',
  'orderassignments',
  'orders',
  'ratings',
  'notifications',
  'carts',
  'sessions',
  'voicesessions',
  'healthprofiles',
  'supporttickets',
  'deliverylocations',
  'deliveryroutes',
  'locations',
  'customers',
  'chefs',
];

async function main() {
  await mongoose.connect(URI);
  const db = mongoose.connection.db;
  const listed = await db.listCollections().toArray();
  const nameSet = new Set(listed.map((n) => n.name));

  const adminCount = await db.collection('users').countDocuments({ role: 'admin' });
  console.log('Admin users in DB:', adminCount);
  if (adminCount === 0) {
    console.error('Aborting: no user with role "admin" found. Add an admin before wiping.');
    await mongoose.disconnect();
    process.exit(1);
  }

  for (const c of USER_RELATED_COLLECTIONS) {
    if (!nameSet.has(c)) {
      console.log(`Skip (no collection): ${c}`);
      continue;
    }
    const r = await db.collection(c).deleteMany({});
    console.log(`Deleted ${r.deletedCount} documents from "${c}"`);
  }

  const userResult = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
  console.log(`Deleted ${userResult.deletedCount} non-admin users from "users"`);

  const remaining = await db
    .collection('users')
    .find({}, { projection: { email: 1, role: 1, name: 1 } })
    .toArray();
  console.log('Remaining users:', remaining);

  await mongoose.disconnect();
  console.log('Done. Restaurants and menu collections were not modified.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
