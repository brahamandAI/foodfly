'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import RestaurantMenu from '@/components/RestaurantMenu';

export default function MenuPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);

  const handleRestaurantSelect = (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurant(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchRestaurants = async () => {
    setIsLoadingRestaurants(true);
    try {
      const response = await fetch('/api/restaurants', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.restaurants && data.restaurants.length > 0) {
        // Map restaurant data to match expected format
        const formattedRestaurants = data.restaurants.map((r: any) => ({
          id: r.id || r._id?.toString() || '',
          name: r.name,
          cuisine: Array.isArray(r.cuisine) ? r.cuisine[0] : r.cuisine || 'Multi-Cuisine',
          rating: r.rating || 4.5,
          deliveryTime: r.deliveryTime || '30-45 mins',
          deliveryFee: r.deliveryFee || 40,
          location: r.location || `${r.address?.city || ''}, ${r.address?.state || ''}`,
          address: r.address || '',
          image: r.image || '/images/restaurants/cafe.jpg',
          isActive: r.isActive !== false
        }));
        setRestaurants(formattedRestaurants);
      } else {
        setRestaurants([]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const fetchMenu = async (restaurantId: string, showLoading = false) => {
    if (showLoading) setIsLoading(true);
    
    try {
      // Add cache-busting timestamp to ensure fresh data
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/restaurants/${restaurantId}/menu?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      
      if (data.menu && data.menu.length > 0) {
        setMenu(data.menu);
      } else {
        setMenu([]);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenu([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      // Fetch menu from database when restaurant is selected
      fetchMenu(selectedRestaurant, true);
      
      // Listen for menu updates from admin
      const handleMenuUpdate = () => {
        console.log('Menu update event received, refreshing menu...');
        fetchMenu(selectedRestaurant, false);
      };
      
      // Also poll for updates every 5 seconds as a fallback
      const pollInterval = setInterval(() => {
        fetchMenu(selectedRestaurant, false);
      }, 5000);
      
      window.addEventListener('menuUpdated', handleMenuUpdate);
      
      // Listen for storage events (cross-tab communication)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'menuUpdated' && e.newValue) {
          handleMenuUpdate();
        }
      };
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('menuUpdated', handleMenuUpdate);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(pollInterval);
      };
    }
  }, [selectedRestaurant]);

  // If restaurant is selected, show menu
  if (selectedRestaurant) {
    const restaurant = restaurants.find(r => r.id === selectedRestaurant);
    if (!restaurant) {
      setSelectedRestaurant(null);
      return null;
    }

    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-[#232323] border-b-2 sm:border-b-4 border-yellow-400">
          <div className="max-w-7xl mx-auto mobile-padding-x py-4 sm:py-6 md:py-8">
            <button
              onClick={handleBackToRestaurants}
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-4 sm:mb-6 transition-colors font-bold touch-target no-tap-highlight"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back to Restaurants</span>
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
              <div className="w-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-yellow-400 mb-2 sm:mb-3 tracking-tight line-clamp-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {restaurant.name}
                </h1>
                <p className="text-yellow-300 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {restaurant.cuisine} Fine Dining Experience
                </p>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-400 text-[#232323] px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg font-bold text-xs sm:text-sm md:text-base">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#232323]" />
                    <span>{restaurant.rating}</span>
                    <span className="hidden sm:inline text-xs sm:text-sm">(2.5k+)</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg font-bold text-xs sm:text-sm md:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">{restaurant.deliveryTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg font-bold text-xs sm:text-sm md:text-base">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{restaurant.location}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-400 text-[#232323] rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border-2 sm:border-4 border-[#232323] shadow-xl w-full sm:w-auto">
                <p className="text-xs sm:text-sm mb-1 font-semibold">Delivery Fee</p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black">₹{restaurant.deliveryFee}</p>
                <p className="text-xs mt-1 font-bold">Within 2km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Component - Fetch from database */}
        {!isLoading && (
          <RestaurantMenu 
            categories={menu}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
          />
        )}
        {isLoading && (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading menu...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show restaurant selection
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#232323] border-b-2 sm:border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto mobile-padding-x py-6 sm:py-8 md:py-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-4 sm:mb-6 transition-colors font-bold touch-target no-tap-highlight"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-yellow-400 mb-2 sm:mb-3 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Our Restaurants
          </h1>
          <p className="text-yellow-300 text-base sm:text-lg font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Select a restaurant to view their menu
          </p>
        </div>
      </div>

      {/* Restaurant Cards */}
      <div className="max-w-7xl mx-auto mobile-padding-x mobile-padding-y">
        {isLoadingRestaurants ? (
          <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 mobile-text">Loading restaurants...</p>
            </div>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p className="text-gray-600 text-base sm:text-lg">No restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="responsive-grid">
            {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => handleRestaurantSelect(restaurant.id)}
              className="group mobile-card bg-white border-2 border-gray-200 overflow-hidden hover:border-yellow-400 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 md:hover:-translate-y-2 no-tap-highlight"
            >
              {/* Restaurant Image */}
              <div className="relative mobile-card-height w-full overflow-hidden bg-gray-200">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-transparent to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-yellow-400 text-[#232323] px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 rounded-lg font-black flex items-center gap-1 text-xs sm:text-sm md:text-base">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-[#232323]" />
                  <span>{restaurant.rating}</span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-3 sm:p-4 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-black text-[#232323] mb-1.5 sm:mb-2 group-hover:text-yellow-600 transition-colors line-clamp-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 mb-2 sm:mb-3 font-semibold mobile-text line-clamp-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {restaurant.cuisine}
                </p>

                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-4 sm:mb-5 md:mb-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="font-medium mobile-text truncate">{restaurant.deliveryTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                    <span className="font-medium mobile-text truncate">{restaurant.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs font-semibold text-gray-600">Delivery Fee:</span>
                    <span className="text-base sm:text-lg font-black text-[#232323]">₹{restaurant.deliveryFee}</span>
                  </div>
                </div>

                {/* View Menu Button */}
                <button className="w-full bg-[#232323] text-yellow-400 mobile-btn rounded-lg sm:rounded-xl font-bold hover:bg-yellow-400 hover:text-[#232323] transition-all duration-200 border-2 border-yellow-400 flex items-center justify-center gap-2 touch-target no-tap-highlight">
                  <span>View Menu</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
