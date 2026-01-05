'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Plus, Edit, Trash2, Home, Briefcase, MoreHorizontal, Navigation, ArrowLeft, Check } from 'lucide-react';
import LocationSelector from '../../components/LocationSelector';

interface Location {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  name?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function LocationManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view addresses');
        setIsLoading(false);
        return;
      }

      // Load from database API (MongoDB) for proper persistence
      try {
        const response = await fetch('/api/users/addresses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userAddresses = data.addresses || [];
          
          // Convert addresses to location format
          const convertedLocations: Location[] = userAddresses.map((address: any) => ({
            _id: address._id || Date.now().toString(),
            label: address.label,
            coordinates: address.coordinates || { latitude: 19.0760, longitude: 72.8777 },
            address: {
              street: address.street || '',
              area: '', // LocationSelector doesn't use area field
              city: address.city || '',
              state: address.state || '',
              pincode: address.pincode || '',
              landmark: address.landmark || ''
            },
            isDefault: address.isDefault || false,
            createdAt: new Date().toISOString()
          }));
          
          setLocations(convertedLocations);
          
          // Update localStorage as backup
          const { userStorage } = await import('@/lib/api');
          userStorage.setUserAddresses(userAddresses);
          
          return;
        } else {
          throw new Error('Failed to load addresses');
        }
      } catch (fetchError) {
        console.error('Failed to fetch addresses from database:', fetchError);
        // Fallback to localStorage if database fetch fails
        const { userStorage } = await import('@/lib/api');
        const userAddresses = userStorage.getUserAddresses();
        
        const convertedLocations: Location[] = userAddresses.map((address: any) => ({
          _id: address._id || Date.now().toString(),
          label: address.label,
          coordinates: address.coordinates || { latitude: 19.0760, longitude: 72.8777 },
          address: {
            street: address.street || '',
            area: '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            landmark: address.landmark || ''
          },
          isDefault: address.isDefault || false,
          createdAt: new Date().toISOString()
        }));
        
        setLocations(convertedLocations);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationAdd = async (newAddress: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add addresses');
        return;
      }

      // Save to database API for proper persistence
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAddress),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add address');
      }

      // Reload locations from database
      await loadLocations();
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('addressesUpdated'));
      
      setShowLocationSelector(false);
    } catch (error) {
      console.error('Error adding location:', error);
      setError('Failed to add location');
    }
  };

  const handleLocationUpdate = async (updatedAddress: any) => {
    if (!editingLocation) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update addresses');
        return;
      }

      // Update in database API for proper persistence
      const response = await fetch('/api/users/addresses', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: editingLocation._id,
          label: updatedAddress.label,
          name: updatedAddress.name,
          phone: updatedAddress.phone,
          street: updatedAddress.street,
          landmark: updatedAddress.landmark || '',
          city: updatedAddress.city,
          state: updatedAddress.state,
          pincode: updatedAddress.pincode,
          coordinates: updatedAddress.coordinates ? {
            latitude: updatedAddress.coordinates.latitude || updatedAddress.coordinates.lat,
            longitude: updatedAddress.coordinates.longitude || updatedAddress.coordinates.lng
          } : undefined,
          isDefault: updatedAddress.isDefault || false
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update address');
      }

      // Reload locations from database
      await loadLocations();
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('addressesUpdated'));
      
      setEditingLocation(null);
      setShowLocationSelector(false);
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location');
    }
  };

  const setDefaultLocation = async (locationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update addresses');
        return;
      }

      // Update in database API for proper persistence
      const response = await fetch('/api/users/addresses', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: locationId,
          isDefault: true
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set default address');
      }
      
      // Reload locations from database
      await loadLocations();
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('addressesUpdated'));
    } catch (error) {
      console.error('Error setting default location:', error);
      setError('Failed to set default location');
    }
  };

  const deleteLocation = async (locationId: string) => {
    if (locations.length <= 1) {
      setError('You must have at least one location');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete addresses');
        return;
      }

      // Delete from database API for proper persistence
      const response = await fetch(`/api/users/addresses?addressId=${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete address');
      }
      
      // Reload locations from database
      await loadLocations();
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('addressesUpdated'));
    } catch (error) {
      console.error('Error deleting location:', error);
      setError('Failed to delete location');
    }
  };

  const getLocationIcon = (label: Location['label']) => {
    switch (label) {
      case 'Home':
        return <Home className="h-5 w-5 text-green-600" />;
      case 'Work':
        return <Briefcase className="h-5 w-5 text-blue-600" />;
      default:
        return <MoreHorizontal className="h-5 w-5 text-gray-600" />;
    }
  };

  const getLocationTypeLabel = (label: Location['label']) => {
    return label;
  };

  const formatAddress = (address: Location['address']) => {
    if (!address) return 'Address not available';
    
    const parts = [
      address.street,
      address.area,
      address.city,
      address.pincode
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Delivery Locations</h1>
                <p className="text-gray-600">Manage your saved addresses</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setEditingLocation(null);
                setShowLocationSelector(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Location</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Current Location Detection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Navigation className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Quick Location Detection</h3>
                <p className="text-sm text-gray-600">Use GPS to quickly add your current location</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingLocation(null);
                setShowLocationSelector(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Navigation className="h-4 w-4" />
              <span>Detect Location</span>
            </button>
          </div>
        </div>

        {/* Locations List */}
        <div className="space-y-4">
          {locations.map((location) => (
            <div
              key={location._id}
              className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 ${
                location.isDefault 
                  ? 'border-red-200 ring-2 ring-red-100' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getLocationIcon(location.label)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {getLocationTypeLabel(location.label)}
                      </h3>
                      {location.isDefault && (
                        <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-1">{formatAddress(location.address)}</p>
                    
                    {location.address.landmark && (
                      <p className="text-sm text-gray-500">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {location.address.landmark}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!location.isDefault && (
                    <button
                      onClick={() => setDefaultLocation(location._id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50 transition-colors touch-target no-tap-highlight"
                      title="Set as default"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setEditingLocation(location);
                      setShowLocationSelector(true);
                    }}
                    className="text-gray-400 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-50 transition-colors touch-target no-tap-highlight"
                    title="Edit location"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {locations.length > 1 && (
                    <button
                      onClick={() => deleteLocation(location._id)}
                      className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Delete location"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Coordinates (for debugging) */}
              {location.coordinates && location.coordinates.latitude && location.coordinates.longitude && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Coordinates: {location.coordinates.latitude.toFixed(6)}, {location.coordinates.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {locations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No locations saved</h3>
            <p className="text-gray-600 mb-6">Add your first delivery location to get started</p>
            <button
              onClick={() => setShowLocationSelector(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Your First Location
            </button>
          </div>
        )}
      </div>

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <LocationSelector
          isOpen={showLocationSelector}
          onLocationSelect={editingLocation ? handleLocationUpdate : handleLocationAdd}
          onClose={() => {
            setShowLocationSelector(false);
            setEditingLocation(null);
          }}
        />
      )}
    </div>
  );
} 