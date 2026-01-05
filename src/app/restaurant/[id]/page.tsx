'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react';
import RestaurantMenu from '@/components/RestaurantMenu';
import { symposiumMenu } from '@/data/symposiumMenu';
import { cafeAfterHoursMenu } from '@/data/cafeAfterHoursMenu';
import { panacheMenu } from '@/data/panacheMenu';

export default function RestaurantPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [menu, setMenu] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Restaurant mapping with their menus (fallback)
  const restaurantInfo = {
    '1': { 
      name: 'Panache', 
      cuisine: 'Indian', 
      rating: 4.5, 
      deliveryTime: '30-45 mins', 
      deliveryFee: 40, 
      location: 'Sector 13, Dwarka, New Delhi',
      address: 'Ground Floor, Soul City Mall, Sector 13, Dwarka, New Delhi, Delhi, 110078',
      menu: panacheMenu
    },
    '2': { 
      name: 'Cafe After Hours', 
      cuisine: 'Italian', 
      rating: 4.2, 
      deliveryTime: '25-35 mins', 
      deliveryFee: 35, 
      location: 'Sector 17, Dwarka, New Delhi',
      address: '17, Pocket A St, Pocket A, Sector 17 Dwarka, Kakrola, New Delhi, Delhi, 110078',
      menu: cafeAfterHoursMenu
    },
    '3': { 
      name: 'Symposium Restaurant', 
      cuisine: 'Multi-Cuisine', 
      rating: 4.7, 
      deliveryTime: '30-40 mins', 
      deliveryFee: 50, 
      location: 'Sector 12, Dwarka, New Delhi',
      address: 'First floor, City Centre Mall, 101, Sector 12 Dwarka, New Delhi, Delhi 110078',
      menu: symposiumMenu
    }
  };

  const restaurantId = params.id as string;
  const info = restaurantInfo[restaurantId as keyof typeof restaurantInfo] || restaurantInfo['3'];

  const fetchMenu = async (showLoading = false) => {
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

  useEffect(() => {
    // Initial fetch
    fetchMenu(true);
    
    // Listen for menu updates from admin
    const handleMenuUpdate = () => {
      console.log('Menu update event received, refreshing menu...');
      fetchMenu(false);
    };
    
    // Also poll for updates every 5 seconds as a fallback
    const pollInterval = setInterval(() => {
      fetchMenu(false);
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
  }, [restaurantId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#232323] border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-yellow-400 mb-2 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {info.name}
              </h1>
              <p className="text-yellow-300 text-lg mb-5 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                {info.cuisine} Fine Dining Experience
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-yellow-400 text-[#232323] px-5 py-2.5 rounded-lg font-bold">
                  <Star className="w-5 h-5 fill-[#232323]" />
                  <span>{info.rating}</span>
                  <span className="text-sm">(2.5k+ ratings)</span>
                </div>
                
                <div className="flex items-center gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-5 py-2.5 rounded-lg font-bold">
                  <Clock className="w-5 h-5" />
                  <span>{info.deliveryTime}</span>
                </div>
                
                <div className="flex items-center gap-2 bg-[#2a2a2a] text-yellow-400 border-2 border-yellow-400 px-5 py-2.5 rounded-lg font-bold">
                  <MapPin className="w-5 h-5" />
                  <span>{info.location}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-400 text-[#232323] rounded-xl p-6 text-center border-4 border-[#232323] shadow-xl">
              <p className="text-sm mb-1 font-semibold">Delivery Fee</p>
              <p className="text-4xl font-black">₹{info.deliveryFee}</p>
              <p className="text-xs mt-1 font-bold">Within 2km</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Component - Shows restaurant-specific menu */}
      {!isLoading && (
        <RestaurantMenu 
          categories={menu}
          restaurantId={restaurantId}
          restaurantName={info.name}
          highlightDish={searchParams.get('highlight') || undefined}
        />
      )}
    </div>
  );
}
