'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  X, 
  Star, 
  Clock, 
  Plus,
  MapPin,
ChefHat,
ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Dish {
  _id: string;
  name: string;
  price: number | string;
  description: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  image: string;
  restaurantId: string;
  restaurantName: string;
}

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  location: string;
  isActive: boolean;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [intent, setIntent] = useState<any>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setDishes([]);
      setRestaurants([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      setDishes(data.dishes || []);
      setRestaurants(data.restaurants || []);
      setIntent(data.intent || null);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDishClick = (dish: Dish) => {
    // Navigate to restaurant page with dish highlighted
    // Store dish info in sessionStorage for highlighting
    sessionStorage.setItem('highlightDish', JSON.stringify({
      name: dish.name,
      restaurantId: dish.restaurantId
    }));
    
    // Find restaurant ID mapping (numeric to MongoDB ID)
    const restaurantIdMap: Record<string, string> = {
      '1': 'Panache',
      '2': 'Cafe After Hours',
      '3': 'Symposium Restaurant'
    };
    
    // Try to find numeric ID
    let restaurantRouteId = dish.restaurantId;
    for (const [numId, name] of Object.entries(restaurantIdMap)) {
      if (name === dish.restaurantName) {
        restaurantRouteId = numId;
        break;
      }
    }
    
    router.push(`/restaurant/${restaurantRouteId}?highlight=${encodeURIComponent(dish.name)}`);
  };

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'number') {
      return `₹${price}`;
    }
    return `₹${price}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#232323]" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                router.push(`/search?q=${encodeURIComponent(e.target.value)}`, { scroll: false });
              }}
              placeholder="Search for dishes, restaurants, cuisines... (e.g., 'paneer butter masala', 'biryani', 'veg pizza', 'cheap food')"
              className="w-full pl-12 pr-12 py-4 bg-gray-900 border-2 border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 placeholder-gray-500 text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  router.push('/search', { scroll: false });
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>

          {/* Intent Display */}
          {intent && Object.keys(intent).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {intent.isVeg !== undefined && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                  {intent.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                </span>
              )}
              {intent.priceRange && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                  {intent.priceRange === 'cheap' ? 'Budget Friendly' : 'Premium'}
                </span>
              )}
              {intent.category && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                  {intent.category.charAt(0).toUpperCase() + intent.category.slice(1)}
                </span>
              )}
              {intent.cuisine && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">
                  {intent.cuisine.charAt(0).toUpperCase() + intent.cuisine.slice(1)}
                </span>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Searching...</p>
            </div>
          </div>
        ) : searchQuery.trim() && dishes.length === 0 && restaurants.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 mb-4">
              We couldn't find any dishes or restaurants matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                router.push('/search');
              }}
              className="text-yellow-400 hover:text-yellow-300 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Dish Results - PRIMARY */}
            {dishes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Dishes ({dishes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dishes.map((dish) => (
                    <div
                      key={dish._id}
                      onClick={() => handleDishClick(dish)}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400 cursor-pointer transition-all hover:shadow-lg hover:shadow-yellow-400/20 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                              {dish.name}
                            </h3>
                            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                              dish.isVeg ? 'border-green-600' : 'border-red-600'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                dish.isVeg ? 'bg-green-600' : 'bg-red-600'
                              }`} />
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                            {dish.description || 'Delicious dish'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {dish.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">From</p>
                          <p className="text-sm font-semibold text-white">{dish.restaurantName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-400">
                            {formatPrice(dish.price)}
                          </p>
                          {!dish.isAvailable && (
                            <p className="text-xs text-red-400 mt-1">Out of Stock</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDishClick(dish);
                          }}
                          className="flex-1 bg-yellow-400 text-[#232323] font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <span>View at Restaurant</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurant Results - SECONDARY */}
            {restaurants.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Restaurants ({restaurants.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant._id}
                      href={`/restaurant/${restaurant._id}`}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-400 transition-all hover:shadow-lg hover:shadow-yellow-400/20 block"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">
                            {restaurant.name}
                          </h3>
                          <p className="text-sm text-gray-400">{restaurant.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          <span className="text-sm font-semibold">{restaurant.rating}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{restaurant.location}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-500">Delivery Fee: </span>
                          <span className="text-yellow-400 font-semibold">₹{restaurant.deliveryFee}</span>
                        </div>
                      </div>

                      {!restaurant.isActive && (
                        <div className="mt-4 px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                          <p className="text-xs text-red-400 font-semibold">Currently Closed</p>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
