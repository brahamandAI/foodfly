import { NextRequest, NextResponse } from 'next/server';
import { isWithinDeliveryRadius, getDistanceToRestaurant, RESTAURANT_NAMES, RESTAURANT_ADDRESSES, MAX_DELIVERY_RADIUS_KM } from '@/lib/distanceService';
import type { Coordinates } from '@/lib/distanceService';

export async function POST(request: NextRequest) {
  try {
    const { restaurantId, userLocation } = await request.json();

    if (!restaurantId || !userLocation || !userLocation.latitude || !userLocation.longitude) {
      return NextResponse.json(
        { error: 'Restaurant ID and user location (latitude, longitude) are required' },
        { status: 400 }
      );
    }

    const coordinates: Coordinates = {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    };

    const canDeliver = isWithinDeliveryRadius(restaurantId, coordinates);
    const distance = getDistanceToRestaurant(restaurantId, coordinates);
    const restaurantName = RESTAURANT_NAMES[restaurantId] || 'Unknown Restaurant';

    if (!canDeliver) {
      const restaurantAddress = RESTAURANT_ADDRESSES[restaurantId] || 'our restaurant location';
      
      return NextResponse.json({
        canDeliver: false,
        distance: distance?.toFixed(1),
        restaurantName,
        restaurantAddress,
        maxRadius: MAX_DELIVERY_RADIUS_KM,
        message: `We can't deliver to this location 😔`,
        detail: `${restaurantName} is ${distance?.toFixed(1)}km away from your location. We deliver within ${MAX_DELIVERY_RADIUS_KM}km to ensure your food arrives fresh and hot.`,
        suggestion: `Please select an address within ${MAX_DELIVERY_RADIUS_KM}km of ${restaurantName}. Restaurant location: ${restaurantAddress}`
      }, { status: 200 });
    }

    return NextResponse.json({
      canDeliver: true,
      distance,
      restaurantName,
      maxRadius: MAX_DELIVERY_RADIUS_KM,
      message: `Great! ${restaurantName} delivers to your location (${distance?.toFixed(1)}km away).`
    });

  } catch (error: any) {
    console.error('Validate delivery error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

