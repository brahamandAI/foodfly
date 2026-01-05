/**
 * Distance Service
 * Handles distance calculations between coordinates for delivery radius validation
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  coordinates: Coordinates;
}

// Restaurant coordinates - ACTUAL LOCATIONS
export const RESTAURANT_COORDINATES: Record<string, Coordinates> = {
  '1': { // Panache
    latitude: 28.5891,
    longitude: 77.0467
  },
  '2': { // Cafe After Hours
    latitude: 28.5967,
    longitude: 77.0329
  },
  '3': { // Symposium Restaurant
    latitude: 28.5923,
    longitude: 77.0406
  }
};

// Maximum delivery radius in kilometers
export const MAX_DELIVERY_RADIUS_KM = 2;

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a location is within delivery radius of a restaurant
 * @param restaurantId Restaurant ID
 * @param userLocation User's coordinates
 * @returns true if within delivery radius (≤ 2km), false otherwise
 */
export function isWithinDeliveryRadius(
  restaurantId: string,
  userLocation: Coordinates
): boolean {
  const restaurantCoords = RESTAURANT_COORDINATES[restaurantId];
  
  if (!restaurantCoords) {
    console.warn(`Restaurant coordinates not found for ID: ${restaurantId}`);
    return false;
  }
  
  const distance = calculateDistance(restaurantCoords, userLocation);
  return distance <= MAX_DELIVERY_RADIUS_KM;
}

/**
 * Get distance to a specific restaurant
 * @param restaurantId Restaurant ID
 * @param userLocation User's coordinates
 * @returns Distance in kilometers, or null if restaurant not found
 */
export function getDistanceToRestaurant(
  restaurantId: string,
  userLocation: Coordinates
): number | null {
  const restaurantCoords = RESTAURANT_COORDINATES[restaurantId];
  
  if (!restaurantCoords) {
    return null;
  }
  
  return calculateDistance(restaurantCoords, userLocation);
}

/**
 * Get all restaurants with their delivery eligibility
 * @param userLocation User's coordinates
 * @returns Array of restaurant IDs with delivery status
 */
export function getRestaurantsDeliveryStatus(userLocation: Coordinates): Array<{
  restaurantId: string;
  distance: number;
  canDeliver: boolean;
}> {
  return Object.entries(RESTAURANT_COORDINATES).map(([id, coords]) => {
    const distance = calculateDistance(coords, userLocation);
    return {
      restaurantId: id,
      distance,
      canDeliver: distance <= MAX_DELIVERY_RADIUS_KM
    };
  });
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "1.5 km", "500 m")
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
}

/**
 * Validate if cart items are from deliverable restaurants
 * @param cartItems Array of cart items with restaurantId
 * @param userLocation User's coordinates
 * @returns Validation result with details
 */
export function validateCartDelivery(
  cartItems: Array<{ restaurantId: string; name: string }>,
  userLocation: Coordinates
): {
  isValid: boolean;
  invalidRestaurants: Array<{ restaurantId: string; name: string; distance: number }>;
  message?: string;
} {
  const invalidRestaurants: Array<{ restaurantId: string; name: string; distance: number }> = [];
  
  for (const item of cartItems) {
    if (!isWithinDeliveryRadius(item.restaurantId, userLocation)) {
      const distance = getDistanceToRestaurant(item.restaurantId, userLocation);
      if (distance !== null) {
        invalidRestaurants.push({
          restaurantId: item.restaurantId,
          name: item.name,
          distance
        });
      }
    }
  }
  
  if (invalidRestaurants.length > 0) {
    const restaurantNames = invalidRestaurants.map(r => r.name).join(', ');
    return {
      isValid: false,
      invalidRestaurants,
      message: `Some restaurants are outside the ${MAX_DELIVERY_RADIUS_KM}km delivery radius: ${restaurantNames}`
    };
  }
  
  return {
    isValid: true,
    invalidRestaurants: []
  };
}

/**
 * Get restaurant name by ID
 */
export const RESTAURANT_NAMES: Record<string, string> = {
  '1': 'Panache',
  '2': 'Cafe After Hours',
  '3': 'Symposium Restaurant'
};

/**
 * Map restaurant name to numeric ID for distance calculation
 */
export function getRestaurantNumericId(restaurantName: string): string | null {
  const nameLower = restaurantName.toLowerCase().trim();
  
  if (nameLower.includes('panache')) {
    return '1';
  } else if (nameLower.includes('cafe after hours') || nameLower.includes('after hours')) {
    return '2';
  } else if (nameLower.includes('symposium')) {
    return '3';
  }
  
  // Try reverse lookup
  for (const [id, name] of Object.entries(RESTAURANT_NAMES)) {
    if (name.toLowerCase() === nameLower) {
      return id;
    }
  }
  
  return null;
}

/**
 * Get restaurant address by ID
 */
export const RESTAURANT_ADDRESSES: Record<string, string> = {
  '1': 'Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078',
  '2': '17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078',
  '3': 'First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078'
};

export default {
  calculateDistance,
  isWithinDeliveryRadius,
  getDistanceToRestaurant,
  getRestaurantsDeliveryStatus,
  formatDistance,
  validateCartDelivery,
  MAX_DELIVERY_RADIUS_KM,
  RESTAURANT_COORDINATES,
  RESTAURANT_NAMES
};

