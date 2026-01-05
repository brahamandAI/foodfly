'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Minus, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { MenuCategory, MenuItem } from '@/data/symposiumMenu';
import { getCategoryImage } from '@/lib/categoryImages';

interface RestaurantMenuProps {
  categories: MenuCategory[];
  restaurantId: string;
  restaurantName: string;
  onAddToCart?: (item: MenuItem) => void;
  highlightDish?: string; // Dish name to highlight
}

export default function RestaurantMenu({ 
  categories, 
  restaurantId, 
  restaurantName,
  onAddToCart,
  highlightDish
}: RestaurantMenuProps) {
  const [viewMode, setViewMode] = useState<'categories' | 'dishes'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>({});
  const highlightedDishRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load cart quantities on mount
  useEffect(() => {
    loadCartQuantities();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartQuantities();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Handle dish highlighting from search
  useEffect(() => {
    if (highlightDish && categories.length > 0 && viewMode === 'dishes') {
      // Scroll to dish after a short delay to allow rendering
      setTimeout(() => {
        const dishKey = highlightDish.toLowerCase();
        const dishRef = highlightedDishRefs.current[dishKey];
        if (dishRef) {
          dishRef.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a pulse animation
          dishRef.classList.add('animate-pulse');
          setTimeout(() => {
            dishRef.classList.remove('animate-pulse');
          }, 2000);
        }
      }, 500);
    }
  }, [highlightDish, categories, viewMode]);

  // Auto-select category when highlightDish is provided
  useEffect(() => {
    if (highlightDish && categories.length > 0 && viewMode === 'categories') {
      // Find the category containing the highlighted dish
      const categoryWithDish = categories.find(cat => 
        cat.items.some((item: any) => 
          item.name.toLowerCase() === highlightDish.toLowerCase()
        )
      );

      if (categoryWithDish) {
        setSelectedCategory(categoryWithDish.name);
        setViewMode('dishes');
      }
    }
  }, [highlightDish, categories, viewMode]);

  const loadCartQuantities = async () => {
    try {
      const { unifiedCartService } = await import('@/lib/api');
      const cartData = await unifiedCartService.getCart();
      
      if (cartData && cartData.items) {
        const cartQuantities: Record<string, number> = {};
        cartData.items.forEach((item: any) => {
          // Match by name (case-insensitive)
          const itemName = item.name.toLowerCase().trim();
          cartQuantities[itemName] = item.quantity || 0;
        });
        setQuantities(cartQuantities);
      }
    } catch (error) {
      console.error('Error loading cart quantities:', error);
    }
  };

  const updateQuantity = async (item: MenuItem, change: number) => {
    const itemName = item.name.toLowerCase().trim();
    const currentQty = quantities[itemName] || 0;
    const newQty = Math.max(0, Math.min(10, currentQty + change));
    
    setUpdatingItems(prev => ({ ...prev, [itemName]: true }));
    
    try {
      const { unifiedCartService } = await import('@/lib/api');
      
      if (newQty === 0) {
        // Remove from cart
        const cartData = await unifiedCartService.getCart();
        const cartItem = cartData?.items?.find((i: any) => 
          i.name.toLowerCase().trim() === itemName
        );
        if (cartItem) {
          await unifiedCartService.removeFromCart(cartItem.menuItemId);
        }
      } else if (currentQty === 0) {
        // Add new item
        await unifiedCartService.addToCart(
          `${itemName.replace(/\s+/g, '_')}_menu`,
          item.name,
          `Delicious ${item.name}`,
          typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          newQty,
          '/images/placeholder.svg',
          restaurantId,
          restaurantName,
          []
        );
      } else {
        // Update quantity
        const cartData = await unifiedCartService.getCart();
        const cartItem = cartData?.items?.find((i: any) => 
          i.name.toLowerCase().trim() === itemName
        );
        if (cartItem) {
          await unifiedCartService.updateItemQuantity(cartItem.menuItemId, newQty);
        }
      }
      
      setQuantities(prev => ({ ...prev, [itemName]: newQty }));
      window.dispatchEvent(new Event('cartUpdated'));
      
      if (newQty === 0) {
        toast.success(`${item.name} removed from cart`);
      } else {
        toast.success(`${newQty} ${item.name}(s) in cart`);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update cart');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemName]: false }));
    }
  };

  const handleAddToCart = async (item: MenuItem) => {
    await updateQuantity(item, 1);
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') {
      return `₹${price}`;
    }
    return `₹${price}`;
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setViewMode('dishes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory('');
  };

  // Show categories with images first
  if (viewMode === 'categories') {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="bg-[#232323] py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Select a Category
            </h2>
            <p className="text-gray-300 text-base font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Choose a category to view dishes
            </p>
          </div>
        </div>

        {/* Category Grid */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
              >
                {/* Category Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <Image
                    src={getCategoryImage(category.name)}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-transparent to-transparent opacity-60" />
                  
                  {/* Item Count Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 text-[#232323] px-3 py-1 rounded-lg font-bold text-sm">
                    {category.items.length}
                  </div>
                </div>

                {/* Category Name */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-[#232323] text-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    {category.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="font-medium">{category.items.length} items</span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show dishes for selected category
  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  if (!selectedCategoryData) {
    setViewMode('categories');
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Category Header with Back Button */}
      <div className="sticky top-0 z-30 bg-[#232323] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCategories}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors font-semibold"
              style={{ fontFamily: "'Satoshi', sans-serif" }}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
              <span>Back to Categories</span>
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              {selectedCategory}
            </h2>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Category Banner Image */}
      <div className="relative h-64 w-full overflow-hidden bg-gray-200">
        <Image
          src={getCategoryImage(selectedCategory)}
          alt={selectedCategory}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#232323] tracking-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
            {selectedCategory}
          </h2>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedCategoryData.items.filter((item: any) => item.isAvailable !== false).map((item, index) => {
            const isHighlighted = highlightDish && item.name.toLowerCase() === highlightDish.toLowerCase();
            const dishKey = item.name.toLowerCase();
            return (
                <div
                  key={`${item.name}-${index}`}
                  ref={(el) => {
                    if (isHighlighted) {
                      highlightedDishRefs.current[dishKey] = el;
                    }
                  }}
                  className={`group bg-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    isHighlighted ? 'ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105 z-10' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 min-w-0">
                      {/* Item Name & Veg/Non-Veg Indicator */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`flex-shrink-0 w-6 h-6 border-2 rounded flex items-center justify-center mt-0.5 ${
                          item.isVeg 
                            ? 'border-green-600' 
                            : 'border-red-600'
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            item.isVeg 
                              ? 'bg-green-600' 
                              : 'bg-red-600'
                          }`} />
                        </div>
                        <h3 className="text-lg font-semibold text-[#232323] leading-tight" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          {item.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Price - Pushed to hard right */}
                      <div className="text-right">
                        <span className="text-2xl font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          {formatPrice(item.price)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      {quantities[item.name.toLowerCase().trim()] > 0 ? (
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1.5">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            disabled={updatingItems[item.name.toLowerCase().trim()]}
                            className="w-8 h-8 rounded bg-white text-[#232323] hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-[#232323] font-semibold text-sm min-w-[2rem] text-center">
                            {updatingItems[item.name.toLowerCase().trim()] ? '...' : quantities[item.name.toLowerCase().trim()]}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            disabled={updatingItems[item.name.toLowerCase().trim()] || quantities[item.name.toLowerCase().trim()] >= 10}
                            className="w-8 h-8 rounded bg-white text-[#232323] hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={updatingItems[item.name.toLowerCase().trim()]}
                          className="flex-shrink-0 bg-yellow-400 text-[#232323] px-5 py-3 rounded-lg hover:bg-yellow-300 hover:shadow-lg transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Add ${item.name} to cart`}
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

      {/* Floating Legend */}
      <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-5 z-20">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-green-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-600" />
            </div>
            <span className="text-[#232323] font-semibold" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Vegetarian
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-red-600 rounded flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-red-600" />
            </div>
            <span className="text-[#232323] font-semibold" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Non-Vegetarian
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

