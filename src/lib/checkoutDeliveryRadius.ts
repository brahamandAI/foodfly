import {
  getRestaurantNumericId,
  getDistanceToRestaurant,
  isWithinDeliveryRadius,
  MAX_DELIVERY_RADIUS_KM,
  RESTAURANT_NAMES,
} from '@/lib/distanceService';

const KNOWN_RESTAURANT_IDS = ['1', '2', '3'] as const;

export interface CartItemRef {
  restaurantId?: string;
  restaurantName?: string;
}

export interface CartRestaurantCheck {
  key: string;
  displayName: string;
  numericId: string | null;
  distanceKm: number | null;
  inRange: boolean;
  skipped: boolean;
}

function numericIdForItem(item: CartItemRef): string | null {
  const rid = item.restaurantId?.trim();
  if (rid === '1' || rid === '2' || rid === '3') return rid;
  const name = item.restaurantName || '';
  return getRestaurantNumericId(name);
}

/**
 * Same rules as POST /api/orders: each known restaurant in the cart must be within 2km.
 * Unknown restaurants are skipped (matches server behaviour).
 */
export function checkCartDeliveryRadius(
  lat: number,
  lng: number,
  items: CartItemRef[]
): { ok: boolean; checks: CartRestaurantCheck[] } {
  const seen = new Map<string, CartItemRef>();
  for (const item of items) {
    const key = item.restaurantId || item.restaurantName || 'unknown';
    if (!seen.has(key)) seen.set(key, item);
  }

  const checks: CartRestaurantCheck[] = [];
  let ok = true;

  for (const [key, item] of seen) {
    const numericId = numericIdForItem(item);
    const displayName =
      item.restaurantName || (numericId ? RESTAURANT_NAMES[numericId] : null) || key;

    if (!numericId) {
      checks.push({
        key,
        displayName,
        numericId: null,
        distanceKm: null,
        inRange: true,
        skipped: true,
      });
      continue;
    }

    const distanceKm = getDistanceToRestaurant(numericId, { latitude: lat, longitude: lng });
    const inRange = distanceKm !== null && distanceKm <= MAX_DELIVERY_RADIUS_KM;
    if (!inRange) ok = false;

    checks.push({
      key,
      displayName,
      numericId,
      distanceKm,
      inRange,
      skipped: false,
    });
  }

  return { ok, checks };
}

/**
 * Home / location picker: delivery is OK if the pin is within 2 km of at least one FoodFly restaurant.
 */
export function checkAnyRestaurantInRange(
  lat: number,
  lng: number
): { ok: boolean; checks: CartRestaurantCheck[] } {
  const checks: CartRestaurantCheck[] = [];

  for (const id of KNOWN_RESTAURANT_IDS) {
    const distanceKm = getDistanceToRestaurant(id, { latitude: lat, longitude: lng });
    const inRange = isWithinDeliveryRadius(id, { latitude: lat, longitude: lng });
    checks.push({
      key: id,
      displayName: RESTAURANT_NAMES[id] || id,
      numericId: id,
      distanceKm,
      inRange,
      skipped: false,
    });
  }

  const ok = checks.some((c) => c.inRange);
  return { ok, checks };
}
