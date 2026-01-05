'use client';
import React, { useEffect, useState } from 'react';
import { getUserLocation } from '@/lib/locationUtils';
import { isWithinDeliveryRadius, getDistanceToRestaurant, formatDistance, MAX_DELIVERY_RADIUS_KM, RESTAURANT_ADDRESSES } from '@/lib/distanceService';
import type { Coordinates } from '@/lib/distanceService';

interface RestaurantDistanceCheckerProps {
  restaurantId: string;
  restaurantName: string;
  onStatusChange?: (canDeliver: boolean, distance: number | null) => void;
  showAlert?: boolean;
}

export default function RestaurantDistanceChecker({ 
  restaurantId, 
  restaurantName, 
  onStatusChange,
  showAlert = true 
}: RestaurantDistanceCheckerProps) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [canDeliver, setCanDeliver] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDelivery() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to get location (will try GPS, then fall back to default)
        const location = await getUserLocation(false);

        setUserLocation(location);
        
        const dist = getDistanceToRestaurant(restaurantId, location);
        const deliver = isWithinDeliveryRadius(restaurantId, location);
        
        setDistance(dist);
        setCanDeliver(deliver);
        
        if (onStatusChange) {
          onStatusChange(deliver, dist);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error checking delivery:', err);
        setError('Location check failed');
        setIsLoading(false);
      }
    }

    checkDelivery();
  }, [restaurantId, onStatusChange]);

  if (!showAlert) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 text-sm">Checking delivery availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-yellow-800 text-sm font-medium">Location not available</p>
            <p className="text-yellow-700 text-xs mt-1">Please set your location to check delivery availability</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canDeliver) {
    const restaurantAddress = RESTAURANT_ADDRESSES[restaurantId] || 'our restaurant location';
    
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-orange-900 font-semibold mb-1.5">Can't deliver to this location</h4>
            <p className="text-orange-800 text-sm mb-2">
              <strong>{restaurantName}</strong> is {distance !== null && formatDistance(distance)} away from your location. 
              We can only deliver within {MAX_DELIVERY_RADIUS_KM}km to ensure your food arrives fresh and hot.
            </p>
            <p className="text-orange-700 text-xs mb-2">
              📍 Restaurant location: {restaurantAddress}
            </p>
            <p className="text-orange-700 text-xs">
              💡 Please select a delivery address within {MAX_DELIVERY_RADIUS_KM}km of the restaurant, or explore other restaurants nearby.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-green-900 font-semibold mb-1">Delivery Available</h4>
          <p className="text-green-800 text-sm">
            Great! <strong>{restaurantName}</strong> delivers to your location 
            {distance !== null && ` (${formatDistance(distance)} away)`}.
          </p>
        </div>
      </div>
    </div>
  );
}

