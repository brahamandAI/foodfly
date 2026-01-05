# Restaurant Admin Credentials

## Setup Instructions

**IMPORTANT:** You must run the setup first to create the accounts!

To create the restaurant admin accounts, make a POST request to:
```
POST /api/restaurant-admin/setup
Body: { "adminKey": "dev-setup-key" }
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/restaurant-admin/setup \
  -H "Content-Type: application/json" \
  -d '{"adminKey":"dev-setup-key"}'
```

Or visit the login page and click "Show Test Credentials" to see them (development mode only).

## Login Credentials

### 1. Symposium Restaurant
- **Email:** symposium@foodfly.com
- **Password:** Symposium@123
- **Restaurant:** Symposium Restaurant
- **Location:** First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078

### 2. Cafe After Hours
- **Email:** cafe@foodfly.com
- **Password:** Cafe@123
- **Restaurant:** Cafe After Hours
- **Location:** 17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078

### 3. Panache
- **Email:** panache@foodfly.com
- **Password:** Panache@123
- **Restaurant:** Panache
- **Location:** Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078

## Login URL
http://localhost:3000/restaurant-admin/login

## Features Implemented

✅ **Order Management**
- View live orders (updates every 2 seconds)
- Accept/Reject orders
- Update order status (Accepted → Preparing → Ready → Handed to Delivery)
- Cancel orders with reason

✅ **Menu Management**
- Add menu items
- Edit menu items (name, price, description, availability)
- Delete menu items
- Enable/Disable items (out of stock)
- Changes reflect immediately in FoodFly app

✅ **Order History**
- View all past orders
- Filter by status
- Order details with items and customer info

✅ **Analytics**
- Total orders
- Total revenue
- Average order value
- Order status breakdown
- Daily revenue chart

✅ **Settings**
- Toggle restaurant open/closed status
- Set preparation time
- Restaurant status controls

✅ **Notifications**
- Real-time order notifications
- Notification bell with unread count
- Order updates

✅ **Order Routing**
- Orders are automatically split by restaurant
- Each restaurant receives only their items
- Distance validation for each restaurant (2km radius)

## Important Notes

1. **Menu Updates**: When you add/edit/delete menu items in the admin panel, they automatically sync to the FoodFly app menu page.

2. **Order Routing**: If a customer orders items from multiple restaurants, separate orders are created for each restaurant. Each restaurant admin will only see their own orders.

3. **Distance Validation**: Orders are validated for 2km delivery radius for EACH restaurant. If any restaurant is beyond 2km, the entire order is rejected.

4. **Real-time Updates**: Orders appear in the dashboard within 1-2 seconds of being placed.

