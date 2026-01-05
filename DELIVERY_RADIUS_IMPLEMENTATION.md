# 2KM Delivery Radius Implementation

## Overview
Implemented strict 2km delivery radius validation for the three restaurants:
- Panache
- Cafe After Hours
- Symposium Restaurant

## Implementation Details

### 1. Distance Calculation Service (`src/lib/distanceService.ts`)
- **Haversine formula** for accurate distance calculation between coordinates
- Restaurant coordinates stored in `RESTAURANT_COORDINATES` object
- Maximum delivery radius: **2km** (strictly enforced)
- Functions:
  - `calculateDistance()` - Calculate distance between two coordinates
  - `isWithinDeliveryRadius()` - Check if location is within 2km
  - `getDistanceToRestaurant()` - Get distance to specific restaurant
  - `validateCartDelivery()` - Validate entire cart for delivery
  - `formatDistance()` - Format distance for display

### 2. Restaurant Coordinates

```typescript
RESTAURANT_COORDINATES = {
  '1': { // Panache
    latitude: 19.1136,
    longitude: 72.8697
  },
  '2': { // Cafe After Hours
    latitude: 19.1197,
    longitude: 72.8464
  },
  '3': { // Symposium Restaurant
    latitude: 19.1076,
    longitude: 72.8263
  }
}
```

**Note:** These are example coordinates in the Andheri area of Mumbai. Replace with actual restaurant coordinates.

### 3. Location Utilities (`src/lib/locationUtils.ts`)
- Get user's current location from browser geolocation API
- Store/retrieve location from localStorage
- Fallback to default location if needed
- Permission checking

### 4. API Updates

#### Restaurant APIs
- **`/api/restaurants`** - Added coordinates to all restaurants
- **`/api/restaurants/[id]`** - Added coordinates to individual restaurant data

#### Validation API
- **`/api/validate-delivery`** - New endpoint to validate delivery availability
  - Input: `restaurantId`, `userLocation` (lat/lng)
  - Output: `canDeliver`, `distance`, `message`

#### Orders API
- **`/api/orders`** (POST) - Added delivery radius validation
  - Checks user location against restaurant coordinates
  - Rejects orders beyond 2km with error message
  - Server-side enforcement

### 5. UI Components

#### `DeliveryRadiusBadge` Component
- Shows delivery status with color-coded badges
- Green: Within delivery range
- Red: Outside delivery range
- Displays distance in km or meters

#### `RestaurantDistanceChecker` Component
- Automatic location detection
- Real-time delivery availability check
- User-friendly alerts for delivery status
- Loading states and error handling

### 6. Validation Flow

```
User opens restaurant page
    ↓
Request location permission
    ↓
Get user coordinates
    ↓
Calculate distance to restaurant
    ↓
Distance ≤ 2km?
    ↓           ↓
   YES         NO
    ↓           ↓
 Enable    Disable delivery
delivery   Show warning
    ↓
User adds to cart
    ↓
User proceeds to checkout
    ↓
Validate address location
    ↓
Distance ≤ 2km?
    ↓           ↓
   YES         NO
    ↓           ↓
 Create    Reject order
 order     Show error
```

### 7. Enforcement Points

1. **Restaurant Listing** - Show delivery availability badge
2. **Restaurant Page** - Display distance checker
3. **Add to Cart** - Can be restricted based on location
4. **Checkout** - Validate before order placement
5. **Order Creation** - Server-side validation (critical)

### 8. Error Messages

#### Client-Side
- "Sorry, [Restaurant] is X.Xkm away, which exceeds our 2km delivery radius."
- "Unable to get your location. Please enable location services."
- "Delivery not available to your location."

#### Server-Side (API)
- "Delivery not available. [Restaurant] is X.Xkm away, which exceeds our 2km delivery radius."

### 9. User Experience Features

✅ Automatic location detection
✅ Clear visual indicators (green/red badges)
✅ Exact distance display
✅ Helpful error messages
✅ Location permission prompts
✅ Fallback handling for denied permissions
✅ Loading states during validation
✅ Cached location (1 hour validity)

### 10. Configuration

To change the delivery radius:
```typescript
// In src/lib/distanceService.ts
export const MAX_DELIVERY_RADIUS_KM = 2; // Change this value
```

To update restaurant coordinates:
```typescript
// In src/lib/distanceService.ts
export const RESTAURANT_COORDINATES: Record<string, Coordinates> = {
  '1': { latitude: YOUR_LAT, longitude: YOUR_LNG }, // Panache
  '2': { latitude: YOUR_LAT, longitude: YOUR_LNG }, // Cafe After Hours
  '3': { latitude: YOUR_LAT, longitude: YOUR_LNG }  // Symposium
};
```

### 11. Testing Checklist

- [ ] Test with location within 2km - should allow delivery
- [ ] Test with location exactly at 2km - should allow delivery (≤ 2km)
- [ ] Test with location beyond 2km - should block delivery
- [ ] Test with location permissions denied - should show error
- [ ] Test without providing location - should show warning
- [ ] Test order creation with valid location - should succeed
- [ ] Test order creation with invalid location - should fail
- [ ] Test all three restaurants separately

### 12. Browser Compatibility

- Requires browser geolocation API support
- Falls back gracefully if not supported
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers fully supported

### 13. Privacy Considerations

- Location is requested only when needed
- Location data stored locally (not sent to server unless creating order)
- User can deny location permission
- Clear messaging about why location is needed

### 14. Future Enhancements

- [ ] Add restaurant service area polygons for complex shapes
- [ ] Implement dynamic delivery fee based on distance
- [ ] Add estimated delivery time based on distance
- [ ] Show map with restaurant and user location
- [ ] Add multiple delivery zones with different pricing
- [ ] Cache restaurant coordinates from database

## Files Created/Modified

### New Files
- `src/lib/distanceService.ts` - Distance calculation utilities
- `src/lib/locationUtils.ts` - Location management utilities
- `src/components/DeliveryRadiusBadge.tsx` - Delivery status badge
- `src/components/RestaurantDistanceChecker.tsx` - Distance checker component
- `src/app/api/validate-delivery/route.ts` - Validation API endpoint

### Modified Files
- `src/app/api/restaurants/route.ts` - Added coordinates
- `src/app/api/restaurants/[id]/route.ts` - Added coordinates
- `src/app/api/orders/route.ts` - Added delivery validation
- `package.json` - Fixed Windows compatibility

## Usage Examples

### Check if restaurant delivers to location
```typescript
import { isWithinDeliveryRadius } from '@/lib/distanceService';

const userLocation = { latitude: 19.1100, longitude: 72.8700 };
const canDeliver = isWithinDeliveryRadius('1', userLocation); // true/false
```

### Get distance to restaurant
```typescript
import { getDistanceToRestaurant, formatDistance } from '@/lib/distanceService';

const distance = getDistanceToRestaurant('1', userLocation);
console.log(formatDistance(distance)); // "1.5 km"
```

### Use in React component
```tsx
import RestaurantDistanceChecker from '@/components/RestaurantDistanceChecker';

<RestaurantDistanceChecker 
  restaurantId="1"
  restaurantName="Panache"
  onStatusChange={(canDeliver, distance) => {
    console.log(`Can deliver: ${canDeliver}, Distance: ${distance}km`);
  }}
/>
```

## Important Notes

⚠️ **The restaurant coordinates are example values**. Update them with actual GPS coordinates of the restaurants.

⚠️ **Server-side validation is critical**. Always validate on the server even if client-side validation passes.

⚠️ **Location accuracy** depends on the device and browser. GPS coordinates are more accurate than IP-based location.

✅ **The 2km restriction is strictly enforced** at both client and server level.

