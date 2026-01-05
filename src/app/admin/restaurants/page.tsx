'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cuisine: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isActive: boolean;
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  deliveryFee: number;
  preparationTime: number;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Unauthorized. Please login again.');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Restaurant ${!currentStatus ? 'enabled' : 'disabled'}`);
        fetchRestaurants();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update restaurant');
      }
    } catch (error) {
      toast.error('Failed to update restaurant');
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${restaurantName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success('Restaurant deleted permanently');
        fetchRestaurants();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete restaurant');
      }
    } catch (error) {
      toast.error('Failed to delete restaurant');
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-white">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#232323] overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Restaurant Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage all restaurants on the platform</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-yellow-400 text-[#232323] px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Restaurant</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {restaurant.name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>{restaurant.address.street}</p>
                    <p>{restaurant.address.city}, {restaurant.address.state}</p>
                    <p className="text-white font-medium">
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(restaurant._id, restaurant.isActive)}
                  className={`p-2 rounded-lg transition-colors ${
                    restaurant.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {restaurant.isActive ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white">{restaurant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{restaurant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-yellow-400 font-semibold">{restaurant.rating || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Fee:</span>
                  <span className="text-yellow-400 font-semibold">₹{restaurant.deliveryFee || 0}</span>
                </div>
                {restaurant.owner && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-white">{restaurant.owner.name}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {!restaurant.owner && (
                  <button
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Assign Admin</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRestaurant(restaurant._id, restaurant.name)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  title="Delete permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No restaurants found</p>
          </div>
        )}
      </div>
    </div>
  );
}
