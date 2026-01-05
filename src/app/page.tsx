'use client';

import React from "react";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mic, Sparkles, Utensils, Flame } from 'lucide-react';
import VoiceOrder from '../components/VoiceOrder';
import AuthPopup from '../components/AuthPopup';
import LocationSelector from '../components/LocationSelector';
import { toast } from 'react-hot-toast';
import SignupPopup from '../components/SignupPopup';

interface Restaurant {
  _id: string;
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
  isActive: boolean;
  offers?: string[];
  menu?: MenuItem[];
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  preparationTime: string;
  customizations?: {
    name: string;
    options: { name: string; price: number }[];
  }[];
}

interface Address {
  _id?: string;
  label: 'Home' | 'Work' | 'Other';
  name: string;
  phone?: string;
  street?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode?: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Address | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showVoiceOrder, setShowVoiceOrder] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showSignupPopup, setShowSignupPopup] = useState(false);

  // Mock data for testing
  const mockRestaurants: Restaurant[] = [
    {
      _id: 'rest_001',
      name: 'Symposium Restaurant',
      cuisine: ['Multi-Cuisine', 'Continental', 'Indian', 'Oriental'],
      rating: 4.7,
      deliveryTime: '30-40 mins',
      minimumOrder: 300,
      deliveryFee: 50,
      image: '/images/categories/restaurant-panache.jpg',
      address: { city: 'Mumbai', area: 'Andheri' },
      isActive: true,
      offers: ['Free Dessert on orders above ₹800'],
      menu: [
        {
          _id: 'symp_001',
          name: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken',
          price: 445,
          image: '/images/categories/butter-chicken.jpg',
          category: 'Main Course',
          isVeg: false,
          rating: 4.8,
          preparationTime: '25-30 mins'
        },
        {
          _id: 'symp_002',
          name: 'Paneer Butter Masala',
          description: 'Creamy cottage cheese curry in rich tomato gravy',
          price: 345,
          image: '/images/categories/paneer-butter-masala.jpg',
          category: 'Main Course',
          isVeg: true,
          rating: 4.7,
          preparationTime: '20-25 mins'
        },
        {
          _id: 'symp_003',
          name: 'Classic Margherita Pizza',
          description: 'Traditional pizza with tomato, mozzarella, and basil',
          price: 345,
          image: '/images/categories/margherita-pizza.jpg',
          category: 'Pizza',
          isVeg: true,
          rating: 4.6,
          preparationTime: '15-20 mins'
        },
        {
          _id: 'symp_004',
          name: 'Hyderabadi Chicken Biryani',
          description: 'Traditional Hyderabadi biryani with tender chicken',
          price: 545,
          image: '/images/categories/chicken-biryani.jpg',
          category: 'Rice & Biryani',
          isVeg: false,
          rating: 4.8,
          preparationTime: '30-35 mins'
        },
        {
          _id: 'symp_005',
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee and mascarpone',
          price: 325,
          image: '/images/categories/tiramisu.jpg',
          category: 'Desserts',
          isVeg: true,
          rating: 4.7,
          preparationTime: '5-10 mins'
        }
      ]
    },
    {
      _id: 'rest_002',
      name: 'Burger Junction',
      cuisine: ['American', 'Fast Food'],
      rating: 4.3,
      deliveryTime: '20-30 mins',
      minimumOrder: 150,
      deliveryFee: 30,
      image: '/images/categories/burger-2.jpg',
      address: { city: 'Mumbai', area: 'Powai' },
      isActive: true,
      offers: ['Buy 1 Get 1 Free on Burgers'],
      menu: [
        {
          _id: 'burger_001',
          name: 'Classic Beef Burger',
          description: 'Juicy beef patty with lettuce, tomato, and cheese',
          price: 199,
          image: '/images/categories/burger-2.jpg',
          category: 'Burgers',
          isVeg: false,
          rating: 4.4,
          preparationTime: '12-18 mins'
        },
        {
          _id: 'burger_002',
          name: 'Chicken Burger',
          description: 'Grilled chicken patty with fresh vegetables',
          price: 179,
          image: '/images/categories/burger-2.jpg',
          category: 'Burgers',
          isVeg: false,
          rating: 4.3,
          preparationTime: '10-15 mins'
        },
        {
          _id: 'burger_003',
          name: 'Veggie Burger',
          description: 'Plant-based patty with lettuce and tomato',
          price: 159,
          image: '/images/categories/burger-2.jpg',
          category: 'Burgers',
          isVeg: true,
          rating: 4.2,
          preparationTime: '10-15 mins'
        }
      ]
    },
    {
      _id: 'rest_003',
      name: 'Restaurant Panache',
      cuisine: ['Multi-Cuisine', 'Continental', 'Indian', 'Oriental'],
      rating: 4.7,
      deliveryTime: '30-40 mins',
      minimumOrder: 300,
      deliveryFee: 50,
      image: '/images/categories/restaurant-panache.jpg',
      address: { city: 'Mumbai', area: 'Andheri' },
      isActive: true,
      offers: ['Free Dessert on orders above ₹800'],
      menu: [
        {
          _id: 'panache_001',
          name: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken',
          price: 445,
          image: '/images/categories/butter-chicken.jpg',
          category: 'Main Course',
          isVeg: false,
          rating: 4.8,
          preparationTime: '25-30 mins'
        },
        {
          _id: 'panache_002',
          name: 'Paneer Butter Masala',
          description: 'Creamy cottage cheese curry in rich tomato gravy',
          price: 345,
          image: '/images/categories/paneer-butter-masala.jpg',
          category: 'Main Course',
          isVeg: true,
          rating: 4.7,
          preparationTime: '20-25 mins'
        },
        {
          _id: 'panache_003',
          name: 'Classic Margherita Pizza',
          description: 'Traditional pizza with tomato, mozzarella, and basil',
          price: 345,
          image: '/images/categories/margherita-pizza.jpg',
          category: 'Pizza',
          isVeg: true,
          rating: 4.6,
          preparationTime: '15-20 mins'
        },
        {
          _id: 'panache_004',
          name: 'Hyderabadi Chicken Biryani',
          description: 'Traditional Hyderabadi biryani with tender chicken',
          price: 545,
          image: '/images/categories/chicken-biryani.jpg',
          category: 'Rice & Biryani',
          isVeg: false,
          rating: 4.8,
          preparationTime: '30-35 mins'
        },
        {
          _id: 'panache_005',
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee and mascarpone',
          price: 325,
          image: '/images/categories/tiramisu.jpg',
          category: 'Desserts',
          isVeg: true,
          rating: 4.7,
          preparationTime: '5-10 mins'
        }
      ]
    }
  ];

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('guest');
    
    if (token || isGuest) {
      setIsAuthenticated(true);
      if (token) {
      loadUserData();
      } else if (isGuest) {
        // Load guest user data from localStorage
        const guestUser = localStorage.getItem('user');
        if (guestUser) {
          try {
            setCurrentUser(JSON.parse(guestUser));
          } catch (error) {
            console.error('Error parsing guest user data:', error);
          }
        }
      }
    }

    // Load restaurants from API
    loadRestaurants();

    // Load cart count
    updateCartCount();
    
    // Load default location
    loadDefaultLocation();
    
    // Add event listeners
    window.addEventListener('authStateChange', handleAuthStateChange);
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Listen for logout events to clear location data
    const handleLogout = () => {
      setSelectedLocation(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    };
    
    window.addEventListener('userLoggedOut', handleLogout);
    
    return () => {
      window.removeEventListener('authStateChange', handleAuthStateChange);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('userLoggedOut', handleLogout);
    };
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      if (response.ok) {
        const data = await response.json();
        if (data.restaurants && data.restaurants.length > 0) {
          // Map API response to match our interface
          const mappedRestaurants = data.restaurants.map((r: any) => ({
            _id: r.id,
            name: r.name,
            cuisine: Array.isArray(r.cuisine) ? r.cuisine : [r.cuisine || 'Multi-Cuisine'],
            rating: r.rating || 4.5,
            deliveryTime: r.deliveryTime || '30-40 mins',
            minimumOrder: r.minimumOrder || 200,
            deliveryFee: r.deliveryFee || 40,
            image: r.image || '/images/restaurants/cafe.jpg',
            address: {
              city: r.location?.split(',')[1]?.trim() || 'New Delhi',
              area: r.location?.split(',')[0]?.trim() || 'Dwarka'
            },
            isActive: r.isActive !== false && r.isOpen !== false, // Check both fields
            offers: r.offers || [],
            menu: r.menu || []
          }));
          setRestaurants(mappedRestaurants);
        } else {
          // Fallback to mock data
          setRestaurants(mockRestaurants);
        }
      } else {
        // Fallback to mock data on error
        setRestaurants(mockRestaurants);
      }
    } catch (error) {
      console.error('Error loading restaurants:', error);
      // Fallback to mock data on error
      setRestaurants(mockRestaurants);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAuthStateChange = (e: CustomEvent) => {
    setIsAuthenticated(e.detail.isLoggedIn);
    if (e.detail.isLoggedIn) {
      if (e.detail.user && e.detail.user.isGuest) {
        // Handle guest user
        setCurrentUser(e.detail.user);
      } else {
        // Handle regular user
      loadUserData();
      }
    } else {
      setCurrentUser(null);
    }
  };

  const loadDefaultLocation = async () => {
    // For logged-in users, sync with their saved addresses
    if (isAuthenticated) {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        try {
          const user = JSON.parse(currentUser);
          const userAddressKey = `user_addresses_${user.id}`;
          const userAddresses = localStorage.getItem(userAddressKey);
          
          if (userAddresses) {
            const addresses = JSON.parse(userAddresses);
            const defaultAddress = addresses.find((addr: any) => addr.isDefault);
            
            if (defaultAddress) {
              // Convert address format to match the expected Location interface
              const locationFromAddress: Address = {
                _id: defaultAddress._id,
                label: defaultAddress.label,
                name: defaultAddress.name,
                phone: defaultAddress.phone,
                street: defaultAddress.street,
                landmark: defaultAddress.landmark,
                city: defaultAddress.city,
                state: defaultAddress.state,
                pincode: defaultAddress.pincode,
                isDefault: defaultAddress.isDefault,
                coordinates: defaultAddress.coordinates
              };
              
              setSelectedLocation(locationFromAddress);
              localStorage.setItem('selectedLocation', JSON.stringify(locationFromAddress));
              return;
            }
          }
        } catch (error) {
          console.error('Error loading user addresses:', error);
        }
      }
    }
    
    // For non-logged-in users, only load if previously saved
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      try {
        setSelectedLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing saved location:', error);
        setSelectedLocation(null);
      }
    } else {
      // Auto-detect location using GPS if no saved location exists
      await autoDetectLocation();
    }
  };

  const autoDetectLocation = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      setSelectedLocation(null);
      return;
    }

    // Check if user has already denied permission
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      if (permissionStatus.state === 'denied') {
        console.log('Location permission denied');
        setSelectedLocation(null);
        return;
      }
    } catch (error) {
      // Permissions API might not be supported, continue anyway
      console.log('Permissions API not supported, attempting geolocation anyway');
    }

    // Try to get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get city name
          const address = await reverseGeocodeLocation(latitude, longitude);
          
          const detectedLocation: Address = {
            label: 'Other',
            name: 'Current Location',
            city: address.city || 'Your Location',
            state: address.state || '',
            pincode: address.pincode || '',
            isDefault: false,
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          };
          
          setSelectedLocation(detectedLocation);
          localStorage.setItem('selectedLocation', JSON.stringify(detectedLocation));
          console.log('Location auto-detected:', address.city || 'Your Location');
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          // Set a basic location with coordinates only
          const basicLocation: Address = {
            label: 'Other',
            name: 'Current Location',
            city: 'Your Location',
            isDefault: false,
            coordinates: {
              lat: latitude,
              lng: longitude
            }
          };
          setSelectedLocation(basicLocation);
          localStorage.setItem('selectedLocation', JSON.stringify(basicLocation));
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        // Don't show error toast for auto-detection failure
        setSelectedLocation(null);
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster positioning
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      }
    );
  };

  const reverseGeocodeLocation = async (lat: number, lng: number): Promise<Partial<Address>> => {
    try {
      // Try Google Maps geocoding first
      const { googleMapsService } = await import('@/lib/googleMapsService');
      
      if (googleMapsService.isConfigured()) {
        const result = await googleMapsService.reverseGeocode(lat, lng);
        return {
          city: result.components.city || '',
          state: result.components.state || '',
          pincode: result.components.pincode || ''
        };
      }
      
      // Return basic info if Google Maps not configured
      return {
        city: 'Your Location',
        state: '',
        pincode: ''
      };
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {
        city: 'Your Location',
        state: '',
        pincode: ''
      };
    }
  };

  const updateCartCount = () => {
    const savedCart = localStorage.getItem('testCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        const totalItems = Object.values(cartData).reduce((sum: number, count: unknown) => sum + Number(count), 0);
        setCartItemCount(Number(totalItems));
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCartItemCount(0);
      }
    } else {
      setCartItemCount(0);
    }
  };

  const handleAuthSuccess = () => {
    // The AuthPopup will handle the authentication state changes
    // We just need to close the popup and update local state
    setShowAuthPopup(false);
    updateCartCount();
    loadDefaultLocation(); // Reload location after login
    toast.success('Welcome back!');
  };

  const handleAIFeatureClick = (feature: string) => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    
    if (feature === 'voice') {
      setShowVoiceOrder(true);
    }
  };


  return (
    <React.Fragment>
      <SignupPopup isOpen={showSignupPopup} onClose={() => setShowSignupPopup(false)} />
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black relative min-h-[500px] sm:min-h-[600px] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 gap-6 sm:gap-8 relative z-10">
          {/* Left: Text */}
          <div className="flex-1 text-center md:text-left space-y-4 sm:space-y-6 text-white">
            <div className="inline-block bg-yellow-400 text-[#232323] px-4 py-1 rounded-full text-sm font-semibold mb-2 shadow-lg">From Screen To Stomach 🥘</div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">Order Tasty And<br />Fresh Food Any Time</h1>
            {/* Marquee Robo Delivery Announcement */}
            <div className="flex justify-center items-center w-full my-4 sm:my-6">
              <div className="overflow-hidden w-full bg-gradient-to-r from-yellow-900/20 via-yellow-800/30 to-yellow-900/20 rounded-xl border border-yellow-600/30 shadow-lg backdrop-blur-sm">
                <a href="/info-banner.pdf" target="_blank" rel="noopener noreferrer" className="block hover:bg-yellow-800/10 transition-all duration-300">
                  <div className="whitespace-nowrap animate-marquee flex items-center justify-center gap-2 sm:gap-4 cursor-pointer py-2 sm:py-3 px-2 sm:px-4 hover:scale-105 transition-transform duration-300">
                    <Image
                      src="/images/robo-delivery.png"
                      alt="Robo Delivery"
                      width={48}
                      height={48}
                      className="inline-block rounded-full border-2 border-yellow-400 bg-white shadow-lg hover:border-yellow-300 transition-all duration-300 hover:shadow-xl hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                    />
                    <span className="text-xs sm:text-base md:text-lg font-bold text-yellow-300 drop-shadow-lg hover:text-yellow-200 transition-colors duration-300">
                       Coming soon: Robo Meal deliveries within 2 km of our restaurant! The future of food is rolling your way! 
                    </span>
                    <Image
                      src="/images/robo-delivery.png"
                      alt="Robo Delivery"
                      width={48}
                      height={48}
                      className="inline-block rounded-full border-2 border-yellow-400 bg-white shadow-lg hover:border-yellow-300 transition-all duration-300 hover:shadow-xl hover:scale-110 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
                    />
                  </div>
                </a>
              </div>
            </div>
            
              {/* Menu & Deals Quick Access (replaces Search Form) */}
              <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-6 mt-4 sm:mt-6 w-full">
                <a href="/menu" className="flex flex-col items-center group flex-1 sm:flex-none">
                  <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-red-500 shadow-lg group-hover:scale-110 transition-transform">
                    <Utensils className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </span>
                  <span className="mt-2 text-xs sm:text-sm font-semibold text-yellow-300 group-hover:text-yellow-200 transition-colors">Menu</span>
                </a>
                <a href="/deals" className="flex flex-col items-center group flex-1 sm:flex-none">
                  <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-red-500 to-yellow-400 shadow-lg group-hover:scale-110 transition-transform">
                    <Flame className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-bounce" />
                  </span>
                  <span className="mt-2 text-xs sm:text-sm font-semibold text-red-300 group-hover:text-yellow-200 transition-colors">Deals</span>
                </a>
              </div>

            {/* Voice Order Quick Access */}
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => handleAIFeatureClick('voice')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 sm:px-8 rounded-lg transition-colors text-base font-semibold shadow-lg"
              >
                <Mic className="h-5 w-5" />
                Voice Order
              </button>
            </div>
              </div>

          {/* Right: Food Images */}
          <div className="flex-1">
            {/* Mobile: single hero image */}
            <div className="flex sm:hidden justify-center items-center py-6">
              <Image
                src="/images/hero-vegthali.jpg"
                alt="Veg Thali Hero"
                width={240}
                height={240}
                className="object-contain drop-shadow-2xl rounded-full border-4 border-white bg-white w-40 h-40"
                priority
              />
            </div>
            {/* Tablet/Desktop: dual images */}
            <div className="hidden sm:flex justify-center items-center relative min-h-[280px] md:min-h-[320px] gap-4 md:gap-6">
              <Image
                src="/images/hero-vegthali.jpg"
                alt="Veg Thali Hero"
                width={320}
                height={320}
                className="object-contain drop-shadow-2xl rounded-full border-4 sm:border-8 border-white bg-white w-40 h-40 sm:w-48 sm:h-48 md:w-80 md:h-80"
                priority
              />
              <Image
                src="/images/hero-burger.jpg"
                alt="Burger Hero"
                width={220}
                height={220}
                className="object-contain drop-shadow-xl rounded-full border-4 sm:border-8 border-white bg-white md:-ml-12 -ml-2 w-28 h-28 sm:w-36 sm:h-36 md:w-56 md:h-56"
                priority
              />
            </div>
          </div>
        </div>
        {/* Curved Divider */}
        <div className="divider-curve -mb-1">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0C360 60 1080 60 1440 0V60H0V0Z" fill="#fff"/></svg>
      </div>
      </section>

      {/* Voice Order Section - Only show for authenticated users */}
      {isAuthenticated && (
        <section className="py-12 sm:py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Voice Order</h2>
              <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">Order food naturally with your voice. Just speak and we'll understand your order.</p>
          </div>

            {/* Quick Navigation */}
            <div className="flex justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <Link 
                href="/menu" 
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700 text-sm sm:text-base"
              >
                <span className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-red-500 to-yellow-400 opacity-30 animate-pulse"></span>
                  <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 z-10 animate-bounce" />
                </span>
                <span className="font-semibold">Menu</span>
              </Link>
              <Link 
                href="/deals" 
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-700 text-sm sm:text-base"
              >
                <span className="relative flex items-center justify-center">
                  <span className="absolute w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 opacity-40 animate-pulse"></span>
                  <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 z-10 animate-bounce" />
                  <span className="absolute -top-1 -right-2 sm:-top-2 sm:-right-3 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full shadow animate-pulse">HOT</span>
                </span>
                <span className="font-semibold">Deals</span>
              </Link>
            </div>

            <div className="flex justify-center">
              {/* Voice Order Card */}
              <div 
                className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer max-w-md w-full"
                onClick={() => handleAIFeatureClick('voice')}
              >
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-900 rounded-full mb-4 mx-auto">
                  <Mic className="h-8 w-8 sm:h-10 sm:w-10 text-red-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white text-center">Voice Order</h3>
                <p className="text-gray-300 mb-4 text-sm sm:text-base text-center">Order food naturally with your voice. Just say what you want and we'll add it to your cart.</p>
                <div className="flex items-center justify-center text-xs sm:text-sm text-gray-400">
                  <Sparkles className="h-4 w-4 mr-1" />
                  AI-Powered Voice Recognition
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Restaurants Section */}
      <section className="py-12 sm:py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Our Restaurants</h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">Discover the most loved restaurants in your area, from local favorites to hidden gems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {restaurants.map((restaurant) => {
              // Map restaurant ID to route ID
              const routeIdMap: Record<string, string> = {
                'Symposium Restaurant': '3',
                'Panache': '1',
                'Cafe After Hours': '2'
              };
              const routeId = routeIdMap[restaurant.name] || restaurant._id;
              
              // Get image based on restaurant name
              const getImage = (name: string) => {
                if (name.includes('Symposium')) return '/images/restaurants/symposium.jpg';
                if (name.includes('Panache')) return '/images/restaurants/panache.jpg';
                if (name.includes('Cafe After Hours') || name.includes('Cafe')) return '/images/restaurants/cafe.jpg';
                return restaurant.image || '/images/restaurants/cafe.jpg';
              };

              const isClosed = !restaurant.isActive;

              return (
                <Link 
                  key={restaurant._id}
                  href={`/restaurant/${routeId}`}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                    isClosed 
                      ? 'opacity-50 grayscale hover:opacity-60' 
                      : 'hover:shadow-xl'
                  }`}
                >
                  <div className="relative h-40 sm:h-48">
                    <Image
                      src={getImage(restaurant.name)}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${isClosed ? 'from-black/80' : 'from-black/70'} to-transparent`} />
                    {isClosed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm sm:text-base">
                          CLOSED
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white text-lg sm:text-2xl font-bold">{restaurant.name}</h3>
                      <p className="text-white/90 text-xs sm:text-sm">⭐ {restaurant.rating} ({Math.floor(restaurant.rating * 100)}+ reviews)</p>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-gray-600 text-xs sm:text-sm">{restaurant.address.area}, {restaurant.address.city}</p>
                          <p className={`text-xs sm:text-sm mt-1 ${isClosed ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                            {isClosed ? 'Closed' : 'Open'} • {restaurant.deliveryTime}
                          </p>
                          <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                            {isClosed ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-semibold">Currently Closed</span>
                            ) : (
                              <>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Open Now</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {restaurant.cuisine[0] || 'Multi-Cuisine'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link 
              href="/menu" 
              className="inline-flex sm:inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-yellow-400 text-[#232323] px-6 py-4 sm:px-8 rounded-lg hover:bg-yellow-500 transition-colors font-semibold shadow-lg text-base"
            >
              View All Restaurants
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showAuthPopup && (
        <AuthPopup
          onClose={() => setShowAuthPopup(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showVoiceOrder && (
        <VoiceOrder
          isOpen={showVoiceOrder}
          onClose={() => setShowVoiceOrder(false)}
        />
      )}

      {showLocationSelector && (
        <LocationSelector
          isOpen={showLocationSelector}
          onClose={() => setShowLocationSelector(false)}
          onLocationSelect={(address: Address) => {
            // Convert Address to the expected format for selectedLocation
            const location: Address = {
              _id: address._id,
              label: address.label,
              name: address.name,
              phone: address.phone,
              street: address.street,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
              isDefault: address.isDefault,
              coordinates: address.coordinates
            };
            setSelectedLocation(location);
            setShowLocationSelector(false);
          }}
        />
      )}
    </div>
  </React.Fragment>
  );
} 