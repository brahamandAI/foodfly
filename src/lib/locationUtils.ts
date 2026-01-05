/**
 * Location Utilities
 * Helper functions for managing user location in the app
 */

import { Coordinates } from './distanceService';

export interface UserLocation {
  coordinates: Coordinates;
  address?: string;
  city?: string;
  timestamp?: number;
}

/**
 * Get user's current location from browser with proper error handling
 */
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    // Try with high accuracy first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        console.log('✅ Got accurate GPS location:', coords);
        resolve(coords);
      },
      (error) => {
        console.warn('⚠️ High accuracy failed, trying low accuracy...');
        
        // Fallback: Try again with low accuracy
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            console.log('✅ Got approximate location:', coords);
            resolve(coords);
          },
          (fallbackError) => {
            console.error('❌ Both location attempts failed:', fallbackError);
            reject(fallbackError);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000 // Accept 5 minute old location
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // 5 seconds for high accuracy
        maximumAge: 0 // Don't use cached
      }
    );
  });
}

/**
 * Get user location from localStorage or browser
 */
export async function getUserLocation(forceRefresh: boolean = false): Promise<Coordinates> {
  // Check stored location first (if not forcing refresh)
  if (!forceRefresh) {
    const stored = localStorage.getItem('userLocation');
    if (stored) {
      try {
        const location: UserLocation = JSON.parse(stored);
        // Use stored location if less than 30 minutes old
        if (location.timestamp && Date.now() - location.timestamp < 1800000) {
          console.log('✅ Using cached location:', location.coordinates);
          return location.coordinates;
        }
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }
  }

  // Try to get current location from GPS
  try {
    console.log('🔍 Attempting to get current GPS location...');
    const coordinates = await getCurrentLocation();
    
    // Save the new location
    saveUserLocation({
      coordinates,
      timestamp: Date.now()
    });
    
    return coordinates;
  } catch (error) {
    console.warn('⚠️ Could not get GPS location, using default');
    
    // Return default location as last resort
    const defaultLoc = getDefaultLocation();
    return defaultLoc;
  }
}

/**
 * Save user location to localStorage
 */
export function saveUserLocation(location: UserLocation): void {
  try {
    localStorage.setItem('userLocation', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving user location:', error);
  }
}

/**
 * Clear saved user location
 */
export function clearUserLocation(): void {
  localStorage.removeItem('userLocation');
}

/**
 * Check if user has granted location permission
 */
export async function hasLocationPermission(): Promise<boolean> {
  if (!navigator.permissions) {
    return false;
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Get a default location (for fallback)
 * Using Dwarka, New Delhi as default (where restaurants are located)
 */
export function getDefaultLocation(): Coordinates {
  return {
    latitude: 28.5923, // Dwarka, New Delhi
    longitude: 77.0406
  };
}

