import {
  RESTAURANT_ADDRESSES,
  RESTAURANT_COORDINATES,
  RESTAURANT_NAMES,
  getRestaurantNumericId,
} from '@/lib/distanceService';

export interface CartItemRef {
  restaurantId?: string;
  restaurantName?: string;
}

export interface RestaurantMapPin {
  lat: number;
  lng: number;
  label: string;
  address: string;
}

/** Restaurants in the cart with fixed coordinates (for maps). */
export function getCartRestaurantPins(items: CartItemRef[]): RestaurantMapPin[] {
  const out: RestaurantMapPin[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const rid = item.restaurantId?.trim();
    let num: string | null =
      rid === '1' || rid === '2' || rid === '3' ? rid : getRestaurantNumericId(item.restaurantName || '');
    if (!num) continue;
    if (seen.has(num)) continue;
    seen.add(num);
    const c = RESTAURANT_COORDINATES[num];
    if (!c) continue;
    out.push({
      lat: c.latitude,
      lng: c.longitude,
      label: RESTAURANT_NAMES[num] || num,
      address: RESTAURANT_ADDRESSES[num] || '',
    });
  }
  return out;
}

/** Blue pin = customer delivery location */
export function blueDeliveryPinDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><path fill="#2563eb" stroke="#ffffff" stroke-width="2" d="M20 3C11.7 3 5 9.7 5 18c0 12.5 15 27 15 27s15-14.5 15-27C35 9.7 28.3 3 20 3z"/><circle cx="20" cy="18" r="5.5" fill="#ffffff"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Red pin = restaurant */
export function redRestaurantPinDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><path fill="#dc2626" stroke="#ffffff" stroke-width="2" d="M20 3C11.7 3 5 9.7 5 18c0 12.5 15 27 15 27s15-14.5 15-27C35 9.7 28.3 3 20 3z"/><circle cx="20" cy="18" r="5.5" fill="#ffffff"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
