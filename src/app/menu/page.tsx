'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Heart, ChefHat, MapPin, Phone } from 'lucide-react';
import { Playfair_Display, Dancing_Script, Cormorant_Garamond } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });
const dancingScript = Dancing_Script({ subsets: ['latin'] });
const cormorant = Cormorant_Garamond({ 
  weight: ['400', '600'],
  subsets: ['latin'] 
});

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  rating: number;
  deliveryTime: string;
  image: string;
  theme: 'panache' | 'cafe' | 'symposium';
  specialties: string[];
  address: string;
  phone: string;
}

const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Panache',
    description: 'Fine dining with exquisite European and Continental cuisine',
    cuisine: ['European', 'Continental', 'Italian'],
    rating: 4.8,
    deliveryTime: '25-35 mins',
    image: '/images/restaurants/panache.jpg',
    theme: 'panache',
    specialties: ['Truffle Pasta', 'Beef Wellington', 'Chocolate Soufflé'],
    address: 'Downtown Plaza, Main Street',
    phone: '+91 98765 43210'
  },
  {
    id: '2',
    name: 'Cafe After Hours',
    description: 'Cozy cafe with artisanal coffee and comfort food',
    cuisine: ['Cafe', 'Continental', 'Desserts'],
    rating: 4.6,
    deliveryTime: '20-30 mins',
    image: '/images/restaurants/cafe.jpg',
    theme: 'cafe',
    specialties: ['Cappuccino', 'Cheesecake', 'Sandwiches'],
    address: 'Park Avenue, City Center',
    phone: '+91 98765 43211'
  },
  {
    id: '3',
    name: 'Symposium Restaurant',
    description: 'Traditional Indian cuisine with modern presentation',
    cuisine: ['North Indian', 'Mughlai', 'Chinese'],
    rating: 4.7,
    deliveryTime: '30-40 mins',
    image: '/images/restaurants/symposium.jpg',
    theme: 'symposium',
    specialties: ['Butter Chicken', 'Biryani', 'Naan'],
    address: 'Heritage Block, Old City',
    phone: '+91 98765 43212'
  }
];

const getThemeStyles = (theme: string) => {
  switch (theme) {
    case 'panache':
      return {
        bg: 'from-purple-900 via-purple-800 to-purple-900',
        accent: 'purple-500',
        text: 'text-purple-100'
      };
    case 'cafe':
      return {
        bg: 'from-amber-900 via-amber-800 to-amber-900',
        accent: 'amber-500',
        text: 'text-amber-100'
      };
    case 'symposium':
      return {
        bg: 'from-red-900 via-red-800 to-red-900',
        accent: 'red-500',
        text: 'text-red-100'
      };
    default:
      return {
        bg: 'from-gray-900 via-gray-800 to-gray-900',
        accent: 'gray-500',
        text: 'text-gray-100'
      };
  }
};

export default function MenuPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[300px] bg-black overflow-hidden">
        <Image
          src="/images/hero-burger.jpg"
          alt="Menu Hero"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className={`${cormorant.className} text-6xl md:text-8xl font-semibold mb-4 tracking-wider uppercase`}>
              <span className="text-red-500">Our</span> Restaurants
            </h1>
            <p className={`${dancingScript.className} text-3xl md:text-4xl text-gray-200 flex items-center justify-center gap-3`}>
              Choose your dining experience
            </p>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`${cormorant.className} text-4xl font-semibold tracking-wide text-white mb-4`}>
              Three Unique Dining Experiences
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Each restaurant offers its own distinct atmosphere, cuisine, and culinary journey. 
              Click on any restaurant to explore their menu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => {
              const themeStyles = getThemeStyles(restaurant.theme);
              
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group relative bg-gray-900 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl"
                  onMouseEnter={() => setSelectedRestaurant(restaurant.id)}
                  onMouseLeave={() => setSelectedRestaurant(null)}
                >
                  {/* Restaurant Image */}
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${themeStyles.bg} opacity-60 group-hover:opacity-70 transition-opacity`} />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium text-sm">{restaurant.rating}</span>
                    </div>

                    {/* Quick Info Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                        <MapPin className="h-4 w-4 ml-2" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`${cormorant.className} text-2xl font-semibold text-white group-hover:text-${themeStyles.accent} transition-colors`}>
                        {restaurant.name}
                      </h3>
                      <ChefHat className={`h-6 w-6 text-${themeStyles.accent}`} />
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>

                    {/* Cuisine Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.cuisine.map((type) => (
                        <span
                          key={type}
                          className={`px-3 py-1 bg-${themeStyles.accent}/20 text-${themeStyles.accent} rounded-full text-xs font-medium`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className="text-white font-medium text-sm mb-2">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {restaurant.specialties.map((specialty, index) => (
                          <span key={index} className="text-gray-400 text-xs">
                            {specialty}{index < restaurant.specialties.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Phone className="h-4 w-4" />
                      <span>{restaurant.phone}</span>
                    </div>

                    {/* View Menu Button */}
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className={`flex items-center justify-center gap-2 text-${themeStyles.accent} font-medium group-hover:text-white transition-colors`}>
                        <span>View Full Menu</span>
                        <Heart className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className={`absolute inset-0 border-2 border-${themeStyles.accent} rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none`} />
                </Link>
              );
            })}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 bg-gray-900/50 rounded-2xl p-8 text-center">
            <h3 className={`${cormorant.className} text-3xl font-semibold text-white mb-4`}>
              Delivery Available
            </h3>
            <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
              All our restaurants offer delivery services. Free delivery on orders above ₹300. 
              Fresh ingredients, expert chefs, and timely delivery guaranteed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <ChefHat className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="text-white font-medium mb-1">Expert Chefs</h4>
                <p className="text-gray-500 text-sm">Trained culinary professionals</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="text-white font-medium mb-1">Quick Delivery</h4>
                <p className="text-gray-500 text-sm">20-40 minutes average time</p>
              </div>
              <div className="text-center">
                <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="text-white font-medium mb-1">Made with Love</h4>
                <p className="text-gray-500 text-sm">Fresh ingredients, quality assured</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}