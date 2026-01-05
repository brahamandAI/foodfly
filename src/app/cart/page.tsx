'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CheckCircle, Clock, MapPin, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  isVeg?: boolean;
  restaurantId?: string;
  restaurantName?: string;
  menuItemId: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  restaurantId?: string;
  restaurantName?: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      
      // Use unified cart service that works for both guests and authenticated users
      const { unifiedCartService } = require('@/lib/api');
      const cartData = await unifiedCartService.getCart();
      
      if (cartData && cartData.items) {
        setCart({
          items: cartData.items,
          subtotal: cartData.subtotal || 0,
          totalItems: cartData.totalItems || 0
        });
      } else {
        setCart({ items: [], subtotal: 0, totalItems: 0 });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart({ items: [], subtotal: 0, totalItems: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      // Use startTransition to prevent UI jank
      startTransition(() => {
        setCart(prevCart => ({
          ...prevCart,
          items: prevCart.items.map(item =>
            item.menuItemId === itemId
              ? { ...item, quantity: newQuantity }
              : item
          ),
          subtotal: prevCart.items.reduce((sum, item) =>
            sum + (item.menuItemId === itemId ? item.price * newQuantity : item.price * item.quantity), 0
          ),
          totalItems: prevCart.items.reduce((sum, item) =>
            sum + (item.menuItemId === itemId ? newQuantity : item.quantity), 0
          )
        }));
      });

      // Background API call
      const { unifiedCartService } = require('@/lib/api');
      await unifiedCartService.updateItemQuantity(itemId, newQuantity);
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      // ROLLBACK - reload cart on error
      await loadCart();
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

    try {
      // Use startTransition to prevent UI jank
      startTransition(() => {
        setCart(prevCart => {
          const remainingItems = prevCart.items.filter(item => item.menuItemId !== itemId);
          return {
            ...prevCart,
            items: remainingItems,
            subtotal: remainingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            totalItems: remainingItems.reduce((sum, item) => sum + item.quantity, 0)
          };
        });
      });

      // Background API call
      const { unifiedCartService } = require('@/lib/api');
      await unifiedCartService.removeFromCart(itemId);
      
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      // ROLLBACK - reload cart on error
      await loadCart();
      toast.error('Failed to remove item');
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const clearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    try {
      // Use unified cart service that works for both guests and authenticated users
      const { unifiedCartService } = require('@/lib/api');
      await unifiedCartService.clearCart();
      await loadCart(); // Reload cart from database or localStorage
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear cart';
      toast.error(errorMessage);
    }
  };

  // Safe calculation functions to prevent NaN
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const getDeliveryFee = (subtotal: number) => safeNumber(subtotal) >= 299 ? 0 : 40;
  const getTaxes = (subtotal: number) => Math.round(safeNumber(subtotal) * 0.05);
  const getPackagingFee = (itemCount: number) => safeNumber(itemCount) * 5;

  const subtotal = safeNumber(cart.subtotal);
  const deliveryFee = getDeliveryFee(subtotal);
  const taxes = getTaxes(subtotal);
  const packagingFee = getPackagingFee(cart.totalItems);
  const total = subtotal + deliveryFee + taxes + packagingFee;

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#232323] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Header */}
        <div className="bg-[#232323] shadow-lg border-b border-gray-800">
          <div className="max-w-6xl mx-auto mobile-padding-x py-3 sm:py-4 md:py-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 min-w-0 flex-1">
                <Link href="/" className="p-1.5 sm:p-2 hover:bg-gray-800 rounded-lg transition-colors touch-target no-tap-highlight flex-shrink-0">
                  <ArrowLeft className="h-5 w-5 sm:h-5 sm:w-5 text-white" />
                </Link>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Your Cart
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 font-medium truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Review items
                  </p>
                </div>
              </div>
              {cart.items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-white hover:text-gray-300 font-semibold text-xs sm:text-sm md:text-base px-2 py-1.5 sm:px-3 rounded-lg hover:bg-gray-800 transition-colors touch-target no-tap-highlight flex-shrink-0"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mobile-padding-x py-4 sm:py-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                Your cart is empty
              </h2>
              <p className="mobile-text text-yellow-300 mb-4 sm:mb-6 px-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                Add some delicious items to get started!
              </p>
              <Link
                href="/menu"
                className="inline-flex items-center mobile-btn bg-[#232323] text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-[#232323] transition-colors font-semibold border-2 border-yellow-400 touch-target no-tap-highlight"
                style={{ fontFamily: "'Satoshi', sans-serif" }}
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                <div className="bg-[#232323] rounded-lg sm:rounded-xl shadow-md">
                  <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-2">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Items from {cart.restaurantName || 'FoodFly Kitchen'}
                      </h2>
                      <div className="flex items-center mobile-text text-gray-300 flex-shrink-0" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                        <span className="hidden xs:inline">30-45 mins</span>
                        <span className="xs:hidden">30-45m</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      {cart.items.map((item, index) => (
                        <div key={`${item.menuItemId}-${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 bg-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-750 transition-all duration-200 gap-3">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={sanitizeImageUrl(item.image)}
                                  alt={item.name}
                                  width={64}
                                  height={64}
                                  className="object-cover rounded-lg"
                                />
                              ) : (
                                <span className="text-xl sm:text-2xl">🍽️</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold mobile-text truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                  {item.description}
                                </p>
                              )}
                              <p className="text-base sm:text-lg md:text-xl font-bold text-yellow-400 mt-1 sm:hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                ₹{item.price}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 md:gap-6 sm:ml-4 flex-shrink-0">
                            {/* Price - Desktop only */}
                            <div className="text-right hidden sm:block">
                              <p className="text-lg md:text-xl font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                ₹{item.price}
                              </p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1.5 sm:space-x-2 bg-gray-700 rounded-lg p-1 sm:p-1.5">
                              <button
                                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                disabled={updatingItems[item.menuItemId] || item.quantity <= 1}
                                className="w-8 h-8 sm:w-8 sm:h-8 rounded bg-white text-[#232323] hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold touch-target no-tap-highlight"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="text-white font-semibold text-sm sm:text-base min-w-[1.5rem] sm:min-w-[2rem] text-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                {updatingItems[item.menuItemId] ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                disabled={updatingItems[item.menuItemId] || item.quantity >= 10}
                                className="w-8 h-8 sm:w-8 sm:h-8 rounded bg-white text-[#232323] hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold touch-target no-tap-highlight"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.menuItemId)}
                              disabled={updatingItems[item.menuItemId]}
                              className="w-9 h-9 rounded-lg bg-gray-700 text-white hover:bg-gray-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target no-tap-highlight"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-[#232323] rounded-lg sm:rounded-xl shadow-xl lg:sticky lg:top-20">
                  <div className="p-4 sm:p-5 md:p-6">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white mb-4 sm:mb-5 md:mb-6 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white" />
                      Order Summary
                    </h2>
                    
                    <div className="space-y-3 sm:space-y-4 mobile-text" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-gray-300 font-medium">Subtotal ({safeNumber(cart.totalItems)} items)</span>
                        <span className="font-semibold text-white">₹{subtotal}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-gray-300 font-medium">Delivery Fee</span>
                        <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-400' : 'text-white'}`}>
                          {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-gray-300 font-medium">Taxes & Fees (5%)</span>
                        <span className="font-semibold text-white">₹{taxes}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-gray-300 font-medium">Packaging Fee</span>
                        <span className="font-semibold text-white">₹{packagingFee}</span>
                      </div>
                      
                      <div className="border-t border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base sm:text-lg font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            Total
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            ₹{total}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {subtotal < 299 && (
                      <div className="mt-4 sm:mt-5 p-3 sm:p-4 bg-gray-800 rounded-lg">
                        <p className="mobile-text text-gray-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          💡 Add ₹{299 - subtotal} more for free delivery!
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 sm:mt-5 md:mt-6 space-y-2 sm:space-y-3">
                      <div className="flex items-center mobile-text text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                        <span>Delivery in 30-45 minutes</span>
                      </div>
                      
                      <Link
                        href="/checkout"
                        className="w-full bg-yellow-400 text-[#232323] mobile-btn rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2 font-bold shadow-lg hover:shadow-xl touch-target no-tap-highlight"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Proceed to Checkout</span>
                      </Link>
                      
                      <Link
                        href="/menu"
                        className="w-full bg-gray-800 text-white mobile-btn rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 font-semibold touch-target no-tap-highlight"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add More Items</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
