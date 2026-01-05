'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { saveUserLocation, getUserLocation } from '@/lib/locationUtils';
import { addressToCoordinates } from '@/lib/addressToCoordinates';
import { toast } from 'react-hot-toast';

interface ManualLocationPickerProps {
  onLocationSet?: (lat: number, lng: number) => void;
}

export default function ManualLocationPicker({ onLocationSet }: ManualLocationPickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingGPS, setIsGettingGPS] = useState(false);

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await addressToCoordinates(addressInput);
      
      saveUserLocation({
        coordinates: { latitude: result.latitude, longitude: result.longitude },
        address: result.formattedAddress,
        timestamp: Date.now()
      });

      toast.success('Location set successfully!');
      
      if (onLocationSet) {
        onLocationSet(result.latitude, result.longitude);
      }

      setIsOpen(false);
      // Use router refresh instead of hard reload for better mobile UX
      router.refresh();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('locationUpdated'));
    } catch (error) {
      console.error('Address search error:', error);
      toast.error('Could not find address. Please try a different address or area.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseGPS = async () => {
    setIsGettingGPS(true);
    try {
      const coords = await getUserLocation(true); // Force refresh
      
      saveUserLocation({
        coordinates: coords,
        timestamp: Date.now()
      });

      toast.success('GPS location detected!');
      
      if (onLocationSet) {
        onLocationSet(coords.latitude, coords.longitude);
      }

      setIsOpen(false);
      // Use router refresh instead of hard reload for better mobile UX
      router.refresh();
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('locationUpdated'));
    } catch (error) {
      console.error('GPS error:', error);
      toast.error('Could not get GPS location. Please enter address manually.');
    } finally {
      setIsGettingGPS(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
      >
        <MapPin className="w-5 h-5" />
        <span className="font-medium">Set Location</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-96 z-50">
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Set Your Location</h3>
              <p className="text-sm text-gray-600">For accurate delivery distance calculation</p>
            </div>

            {/* GPS Option */}
            <button
              onClick={handleUseGPS}
              disabled={isGettingGPS}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors mb-4 disabled:opacity-50"
            >
              {isGettingGPS ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5 text-blue-600" />
              )}
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-900">Use Current Location</div>
                <div className="text-xs text-gray-600">Detect using GPS</div>
              </div>
            </button>

            {/* Manual Address Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or enter your address
              </label>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                placeholder="e.g., Andheri West, Mumbai"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleAddressSearch}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  <span>Set Location</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

