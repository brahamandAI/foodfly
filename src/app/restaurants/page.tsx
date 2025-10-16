'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, MapPin, ArrowLeft, Utensils } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';

const cormorant = Cormorant_Garamond({ 
  weight: ['400', '600'],
  subsets: ['latin'] 
});

interface Restaurant {
  id: string;
  name: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  deliveryFee: number;
  image: string;
  address: {
    city: string;
    area: string;
  };
  description: string;
  theme: string;
  offers?: string[];
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Panache',
    cuisine: ['Continental', 'Mediterranean', 'Oriental'],
    rating: 4.8,
    deliveryTime: '25-35 mins',
    minimumOrder: 300,
    deliveryFee: 40,
    image: '/images/restaurants/panache.jpg',
    address: { city: 'Mumbai', area: 'Bandra West' },
    description: 'Sophisticated dining with global flavors and elegant ambiance',
    theme: 'elegant',
    offers: ['20% off on orders above ₹500', 'Free dessert on weekends']
  },
  {
    id: '2', 
    name: 'Cafe After Hours',
    cuisine: ['Italian', 'Continental', 'Comfort Food'],
    rating: 4.6,
    deliveryTime: '30-45 mins',
    minimumOrder: 250,
    deliveryFee: 50,
    image: '/images/restaurants/cafe.jpg',
    address: { city: 'Mumbai', area: 'Juhu' },
    description: 'Cozy cafe perfect for late-night cravings and comfort meals',
    theme: 'cozy',
    offers: ['Buy 1 Get 1 on beverages', 'Late night special menu']
  },
  {
    id: '3',
    name: 'Symposium',
    cuisine: ['Multi-Cuisine', 'Indian', 'Chinese', 'Continental'],
    rating: 4.7,
    deliveryTime: '20-30 mins',
    minimumOrder: 200,
    deliveryFee: 30,
    image: '/images/restaurants/symposium.jpg',
    address: { city: 'Mumbai', area: 'Andheri East' },
    description: 'Diverse menu celebrating flavors from around the world',
    theme: 'vibrant',
    offers: ['Free delivery on orders above ₹400', '15% off first order']
  }
];

const getThemeStyles = (theme: string) => {
  switch (theme) {
    case 'elegant':
      return {
        gradient: 'from-purple-600 to-pink-600',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700'
      };
    case 'cozy':
      return {
        gradient: 'from-orange-600 to-red-600',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    case 'vibrant':
      return {
        gradient: 'from-green-600 to-teal-600',
        border: 'border-green-500/30',
        text: 'text-green-400',
        button: 'bg-green-600 hover:bg-green-700'
      };
    default:
      return {
        gradient: 'from-gray-600 to-gray-800',
        border: 'border-gray-500/30',
        text: 'text-gray-400',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
  }
};

export default function RestaurantsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                <Utensils className="text-black w-6 h-6" />
              </div>
              <h1 className={`${cormorant.className} text-4xl font-semibold tracking-wide text-white`}>
                All Restaurants
              </h1>
            </div>
            <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover our three unique dining experiences, each offering its own distinct atmosphere and culinary journey
            </p>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => {
            const themeStyles = getThemeStyles(restaurant.theme);
            
            return (
              <div
                key={restaurant.id}
                className={`group relative bg-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl ${themeStyles.border} border`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Restaurant Image */}
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder-restaurant.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-semibold text-sm">{restaurant.rating}</span>
                    </div>
                  </div>

                  {/* Offers Badge */}
                  {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="absolute top-4 left-4 bg-green-600 px-3 py-1 rounded-full">
                      <span className="text-white font-semibold text-xs">
                        {restaurant.offers.length} Offer{restaurant.offers.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Restaurant Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className={`${cormorant.className} text-2xl font-semibold text-white mb-2`}>
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">{restaurant.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {restaurant.cuisine.map((cuisine, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full bg-gray-800 ${themeStyles.text}`}
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <span className="text-gray-400">₹{restaurant.deliveryFee} delivery</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.address.area}</span>
                      </div>
                      <span className="text-gray-400">Min ₹{restaurant.minimumOrder}</span>
                    </div>
                  </div>

                  {/* Offers */}
                  {restaurant.offers && restaurant.offers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-white font-semibold text-sm mb-2">Special Offers:</h4>
                      <div className="space-y-1">
                        {restaurant.offers.slice(0, 2).map((offer, idx) => (
                          <p key={idx} className="text-green-400 text-xs">• {offer}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/restaurant/${restaurant.id}`}
                    className={`w-full ${themeStyles.button} text-white py-3 rounded-lg font-semibold text-center block transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className={`${cormorant.className} text-3xl font-semibold text-white mb-4`}>
              Why Choose FoodFly?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 rounded-full bg-yellow-500 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-400 text-sm">Quick delivery from all our partner restaurants</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-3 flex items-center justify-center">
                  <Star className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Quality Food</h3>
                <p className="text-gray-400 text-sm">Carefully curated restaurants with high-quality dishes</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-3 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-white font-semibold mb-2">Wide Coverage</h3>
                <p className="text-gray-400 text-sm">Serving across Mumbai with multiple restaurant options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
