'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  Clock, 
  Plus, 
  Sparkles,
  Heart,
  ChefHat
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  tags: string[];
  dietaryFlags: string[];
  allergens: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'very_hot';
  preparationTime: number;
  rating: number;
  nutritionScore: number;
  restaurantId: string;
  restaurantName: string;
}

interface HealthProfile {
  dietaryPreferences: string[];
  healthGoals: string[];
  allergies: string[];
  calorieGoal?: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  restrictions: string[];
  favoriteCuisines: string[];
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [restaurantResults, setRestaurantResults] = useState<any[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    isVeg: 'all',
    priceRange: 'all',
    spiceLevel: 'all',
    preparationTime: 'all',
    dietaryPreference: 'all'
  });
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating' | 'health'>('relevance');

  // Restaurant data mapping
  const restaurantNames = {
    '1': 'Panache',
    '2': 'Cafe After Hours', 
    '3': 'Symposium'
  };

  // Load real menu data from all restaurants
  useEffect(() => {
    const loadAllMenuData = async () => {
      try {
        setIsLoading(true);
        const allMenuItems: MenuItem[] = [];

        // Fetch menu data from all three restaurants
        for (const [restaurantId, restaurantName] of Object.entries(restaurantNames)) {
          try {
            // Try to get synced menu data first
            const response = await fetch(`/api/restaurants/${restaurantId}/menu-sync`);
            
            if (response.ok) {
              const syncedData = await response.json();
              
              // Process each category and its items
              if (syncedData.categories) {
                syncedData.categories.forEach((category: any) => {
                  category.items.forEach((item: any) => {
                    allMenuItems.push({
                      _id: item._id,
                      name: item.name,
                      description: item.description || '',
                      price: item.price,
                      image: item.image || '/images/placeholder-food.jpg',
                      category: category.name.toLowerCase().replace(/\s+/g, '_'),
                      isVeg: item.isVeg || false,
                      calories: 300, // Default values for now
                      protein: 15,
                      carbs: 30,
                      fat: 10,
                      fiber: 5,
                      tags: [category.name.toLowerCase(), item.isVeg ? 'vegetarian' : 'non-vegetarian'],
                      dietaryFlags: item.isVeg ? ['vegetarian'] : [],
                      allergens: [],
                      spiceLevel: 'medium' as const,
                      preparationTime: parseInt(item.preparationTime?.replace(/[^0-9]/g, '') || '20'),
                      rating: item.rating || 4.0,
                      nutritionScore: item.isVeg ? 75 : 65,
                      restaurantId: restaurantId,
                      restaurantName: restaurantName
                    });
                  });
                });
              }
            } else {
              console.warn(`Failed to load menu for restaurant ${restaurantId}`);
            }
          } catch (error) {
            console.error(`Error loading menu for restaurant ${restaurantId}:`, error);
          }
        }

        console.log(`Loaded ${allMenuItems.length} menu items from all restaurants`);
        setMenuItems(allMenuItems);
      } catch (error) {
        console.error('Error loading all menu data:', error);
        // Fallback to empty array
        setMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllMenuData();
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchQuery, filters, sortBy, menuItems, healthProfile]);

  const performSearch = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let results = [...menuItems];
      let restaurantMatches: any[] = [];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        
        // Search for restaurants that match the query
        Object.entries(restaurantNames).forEach(([id, name]) => {
          if (name.toLowerCase().includes(query)) {
            restaurantMatches.push({
              id,
              name,
              image: `/images/restaurants/${name.toLowerCase().replace(/\s+/g, '-')}.jpg`,
              description: `Explore ${name}'s delicious menu`,
              itemCount: menuItems.filter(item => item.restaurantId === id).length
            });
          }
        });

        // Filter menu items
        results = results.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query)) ||
          item.category.toLowerCase().includes(query) ||
          item.restaurantName.toLowerCase().includes(query)
        );
      }

      results = applyFilters(results);
      setFilteredItems(results);
      setRestaurantResults(restaurantMatches);
      setIsLoading(false);
    }, 300);
  };

  const applyFilters = (items: MenuItem[]) => {
    return items.filter(item => {
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.isVeg === 'veg' && !item.isVeg) return false;
      if (filters.isVeg === 'nonveg' && item.isVeg) return false;
      if (filters.priceRange === 'under200' && item.price >= 200) return false;
      if (filters.priceRange === '200to400' && (item.price < 200 || item.price > 400)) return false;
      if (filters.priceRange === 'above400' && item.price <= 400) return false;
      return true;
    });
  };

  const addToCart = async (item: any) => {
    try {
      // Enhanced cart service for better item management
      const { enhancedCartService } = await import('@/lib/api');
      
      const success = enhancedCartService.addItem({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
        isVeg: item.isVeg,
        quantity: 1
      });

      if (success) {
        toast.success(`${item.name} added to cart!`);
        
        // Update cart count in header
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        toast.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding item to cart');
    }
  };

  const getHealthBadge = (item: MenuItem) => {
    const score = item.nutritionScore || 50;
    
    if (score >= 85) return { text: 'Excellent', color: 'bg-green-100 text-green-700' };
    if (score >= 70) return { text: 'Good', color: 'bg-blue-100 text-blue-700' };
    if (score >= 50) return { text: 'Fair', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Poor', color: 'bg-red-100 text-red-700' };
  };

  const categories = ['all', 'pizza', 'burger', 'indian', 'chinese', 'italian', 'healthy'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Menu</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dishes, restaurants, or cuisines..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white text-gray-900 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {restaurantResults.length > 0 && `${restaurantResults.length} restaurants, `}
              {filteredItems.length} dishes
              {searchQuery && ' for "' + searchQuery + '"'}
            </span>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Preference</label>
                <select
                  value={filters.isVeg}
                  onChange={(e) => setFilters(prev => ({ ...prev, isVeg: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All</option>
                  <option value="veg">Vegetarian</option>
                  <option value="nonveg">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Prices</option>
                  <option value="under200">Under ₹200</option>
                  <option value="200to400">₹200 - ₹400</option>
                  <option value="above400">Above ₹400</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Restaurant Results */}
            {restaurantResults.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Restaurants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {restaurantResults.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <div className="relative h-48">
                        <Image
                          src={restaurant.image}
                          alt={restaurant.name}
                          fill
                          className="object-cover rounded-t-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder-restaurant.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-t-lg"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-lg mb-1">{restaurant.name}</h3>
                          <p className="text-white/90 text-sm">{restaurant.description}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">{restaurant.itemCount} dishes available</span>
                          <span className="text-red-600 font-medium text-sm">View Menu →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Dish Results */}
            {filteredItems.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dishes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => {
                    const healthBadge = getHealthBadge(item);
                    return (
                      <div key={item._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div className="relative h-48">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                          <div className="absolute top-3 left-3 flex space-x-2">
                            {item.isVeg && (
                              <span className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                            <span className={'text-xs px-2 py-1 rounded-full font-medium ' + healthBadge.color}>
                              {healthBadge.text}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {item.preparationTime}m
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Link 
                              href={'/dish/' + encodeURIComponent(item.name)}
                              className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center text-sm text-gray-500">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              {item.rating}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                          {item.calories && (
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                              <span>{item.calories} cal</span>
                              {item.protein && <span>{item.protein}g protein</span>}
                              {item.fiber && <span>{item.fiber}g fiber</span>}
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-500">{item.restaurantName}</p>
                            <Link 
                              href={`/restaurant/${item.restaurantId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Menu →
                            </Link>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-lg">₹{item.price}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {!isLoading && restaurantResults.length === 0 && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No dishes found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'We could not find any dishes matching "' + searchQuery + '"'
                : "Try adjusting your filters or search for something else"
              }
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  category: 'all',
                  isVeg: 'all',
                  priceRange: 'all',
                  spiceLevel: 'all',
                  preparationTime: 'all',
                  dietaryPreference: 'all'
                });
              }}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>}>
        <SearchPageContent />
      </Suspense>
    </AuthGuard>
  );
}
