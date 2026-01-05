'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CreditCard, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Home, 
  CheckCircle, 
  ShoppingBag, 
  Edit, 
  Plus, 
  Loader2,
  Wallet,
  Building2,
  X,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import RealUserGuard from '@/components/RealUserGuard';
import PaymentModal from '@/components/PaymentModal';
import { backupAuthentication, restoreAuthentication } from '@/lib/api';

interface CartItem {
  id?: string;
  menuItemId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
  isVeg?: boolean;
  restaurantId?: string;
  restaurantName?: string;
  customizations?: any[];
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  restaurantId?: string;
  restaurantName?: string;
}

interface Address {
  _id?: string;
  label: 'Home' | 'Work' | 'Other' | 'Custom';
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  enabled: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, totalItems: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    label: 'Home',
    name: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Wallet,
      description: 'Pay when your order arrives',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: CreditCard,
      description: 'Pay with UPI apps',
      enabled: true
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay with your card',
      enabled: true
    }
  ]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    loadCartData();
    loadAddresses();
    captureUserLocation();
    
    // Listen for address updates from LocationSelector
    const handleAddressUpdate = () => {
      loadAddresses();
    };
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadAddresses();
    };
    
    window.addEventListener('addressesUpdated', handleAddressUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('addressesUpdated', handleAddressUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const captureUserLocation = async () => {
    try {
      // Try to get stored location first
      const storedLocation = localStorage.getItem('userLocation');
      if (storedLocation) {
        const location = JSON.parse(storedLocation);
        if (location.latitude && location.longitude) {
          setUserLocation(location);
          return;
        }
      }

      // Try to get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setUserLocation(location);
            localStorage.setItem('userLocation', JSON.stringify(location));
          },
          (error) => {
            console.warn('Could not get user location:', error);
            // Location will be geocoded from address on server side
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      }
    } catch (error) {
      console.warn('Error capturing location:', error);
    }
  };

  const loadCartData = async () => {
    try {
      // Use unified cart service that works for both guests and authenticated users
      const { unifiedCartService } = require('@/lib/api');
      const cartData = await unifiedCartService.getCart();
      
      if (cartData && cartData.items && cartData.items.length > 0) {
        setCart({
          items: cartData.items,
          subtotal: cartData.subtotal || 0,
          totalItems: cartData.totalItems || 0,
          restaurantId: cartData.restaurantId,
          restaurantName: cartData.restaurantName
        });
      } else {
        router.push('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      router.push('/cart');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      // Use database address API exclusively
      const response = await fetch('/api/users/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load addresses');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
      
      // Set default address if available
      const defaultAddress = data.addresses?.find((addr: any) => addr.isDefault);
      if (defaultAddress && !selectedAddress) {
        setSelectedAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    }
  };

  const deleteAddress = async (addressId: string | undefined) => {
    if (!addressId) return;
    
    if (addresses.length <= 1) {
      toast.error('You must have at least one address');
      return;
    }

    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete addresses');
        return;
      }

      const response = await fetch(`/api/users/addresses?addressId=${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete address');
      }

      // If deleted address was selected, select another one
      if (selectedAddress?._id === addressId) {
        const remainingAddresses = addresses.filter(addr => addr._id !== addressId);
        if (remainingAddresses.length > 0) {
          setSelectedAddress(remainingAddresses[0]);
        } else {
          setSelectedAddress(null);
        }
      }

      // Reload addresses
      await loadAddresses();
      
      // Dispatch event for other components
      window.dispatchEvent(new Event('addressesUpdated'));
      localStorage.setItem('addressesUpdated', Date.now().toString());
      
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete address';
      toast.error(errorMessage);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      label: address.label,
      name: address.name,
      phone: address.phone,
      street: address.street,
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
      coordinates: address.coordinates
    });
    setShowAddressForm(true);
  };

  const saveAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save addresses');
        return;
      }

      // Use database address API - PUT for edit, POST for new
      const response = await fetch('/api/users/addresses', {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAddress ? {
          addressId: editingAddress._id,
          label: newAddress.label,
          name: newAddress.name,
          phone: newAddress.phone,
          street: newAddress.street,
          landmark: newAddress.landmark || '',
          city: newAddress.city,
          state: newAddress.state,
          pincode: newAddress.pincode,
          coordinates: newAddress.coordinates ? {
            latitude: newAddress.coordinates.latitude || newAddress.coordinates.lat,
            longitude: newAddress.coordinates.longitude || newAddress.coordinates.lng
          } : undefined,
          isDefault: newAddress.isDefault || false
        } : newAddress),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save address');
      }

      const data = await response.json();
      
      // Update addresses list from database (ensures persistence)
      await loadAddresses();
      
      // Select the newly added/updated address
      if (data.address) {
        setSelectedAddress(data.address);
      }

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('addressesUpdated'));
      
      setShowAddressForm(false);
      setEditingAddress(null);
      setNewAddress({
        label: 'Home',
        name: '',
        phone: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      
      toast.success(editingAddress ? 'Address updated successfully!' : 'Address saved successfully!');
    } catch (error) {
      console.error('Error saving address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save address';
      toast.error(errorMessage);
    }
  };

  const placeOrder = async () => {
    // Comprehensive authentication check
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isGuest = localStorage.getItem('guest') === 'true';
    
    // Check if user is properly authenticated (not guest)
    if (!token || !userData || !isLoggedIn || isGuest) {
      toast.error('Please register or login to place an order. Guest users cannot place orders.');
      return;
    }
    
    // Additional check for user object
    let userObj;
    try {
      userObj = JSON.parse(userData);
      if (userObj.isGuest === true) {
        toast.error('Please register or login to place an order. Guest users cannot place orders.');
        return;
      }
    } catch (e) {
      toast.error('Authentication error. Please login again.');
      return;
    }

    // Backup authentication to session storage as safety net
    backupAuthentication();

    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Use database order API exclusively
      const { orderService } = require('@/lib/api');
      
      const orderData = {
        items: cart.items.map(item => ({
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || [],
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName
        })),
        deliveryAddress: {
          name: selectedAddress.name,
          phone: selectedAddress.phone,
          street: selectedAddress.street,
          landmark: selectedAddress.landmark || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        },
        paymentMethod: selectedPaymentMethod === 'cod' ? 'cod' : 'pending', // Set COD immediately
        specialInstructions: specialInstructions,
        totalAmount: total,
        userLocation: selectedAddress.coordinates ? {
          latitude: selectedAddress.coordinates.latitude,
          longitude: selectedAddress.coordinates.longitude
        } : userLocation // Use address coordinates if available, fallback to GPS
      };

      console.log('Placing order with data:', orderData); // Debug log

      const response = await orderService.placeOrder(orderData);
      console.log('Order creation response:', response); // Debug log
      
      if (!response.orderId) {
        throw new Error('Order creation failed - no order ID received');
      }
      
      // Handle COD orders differently - confirm directly without payment modal
      if (selectedPaymentMethod === 'cod') {
        try {
          // Process COD payment directly
          const paymentResponse = await fetch('/api/payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderId: response.orderId,
              paymentMethod: 'cod'
            }),
          });

          if (!paymentResponse.ok) {
            const error = await paymentResponse.json();
            throw new Error(error.message || 'COD order confirmation failed');
          }

          // Clear cart after successful COD order
          const { cartService } = require('@/lib/api');
          await cartService.clearCart();
          
          // Ensure authentication is maintained after order
          restoreAuthentication();
          
          toast.success('Order placed successfully! You can pay cash on delivery.');
          router.push(`/checkout/success?orderId=${response.orderId}`);
          return;
          
        } catch (error) {
          console.error('Error processing COD order:', error);
          toast.error('Failed to confirm COD order. Please try again.');
          return;
        }
      }
      
      // For online payment methods, show payment modal
      const orderForModal = {
        id: response.orderId,
        orderNumber: response.order?.orderNumber || `ORD${Date.now()}`,
        totalAmount: total
      };
      
      console.log('Setting current order:', orderForModal);
      setCurrentOrder(orderForModal);
      
      console.log('Opening payment modal for order:', response.orderId);
      setShowPaymentModal(true);
      
      console.log('Modal state set to:', true, 'currentOrder:', orderForModal);
      
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      
      // Check if it's a Razorpay configuration error
      if (errorMessage.includes('Razorpay credentials not configured')) {
        toast.error('Payment system configuration error. Please contact support.');
      } else if (errorMessage.includes('No token provided')) {
        toast.error('Please login again to place your order.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      console.log('Payment successful, clearing cart...');
      // Only clear cart after successful payment
      const { cartService } = require('@/lib/api');
      await cartService.clearCart();
      
      // Ensure authentication is maintained after payment
      restoreAuthentication();
      
      setShowPaymentModal(false);
      toast.success('Payment completed successfully!');
      router.push(`/checkout/success?orderId=${currentOrder.id}`);
      
    } catch (error) {
      console.error('Error after payment success:', error);
      // Still redirect to success page as payment was successful
      setShowPaymentModal(false);
      toast.success('Payment completed! Redirecting...');
      router.push(`/checkout/success?orderId=${currentOrder.id}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.log('Payment failed/cancelled - preserving cart');
    // IMPORTANT: Do NOT clear cart on payment failure/cancellation
    setShowPaymentModal(false);
    toast.error(error);
    // Cart remains intact for user to try again
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user - preserving cart');
    // IMPORTANT: Do NOT clear cart on payment cancellation
    setShowPaymentModal(false);
    setCurrentOrder(null);
    // Cart remains intact for user to try again
  };

  // Safe calculation functions
  const safeNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const subtotal = safeNumber(cart.subtotal);
  const deliveryFee = subtotal >= 299 ? 0 : 40;
  const taxes = Math.round(subtotal * 0.05);
  const packagingFee = safeNumber(cart.totalItems) * 5;
  const total = subtotal + deliveryFee + taxes + packagingFee;

  if (isLoading) {
    return (
      <RealUserGuard>
        <div className="min-h-screen bg-[#232323] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </RealUserGuard>
    );
  }

  return (
    <RealUserGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Header */}
        <div className="bg-[#232323] shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="flex items-center space-x-4">
              <Link href="/cart" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Checkout
                </h1>
                <p className="text-sm text-gray-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Review and place your order
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-5">
              {/* Delivery Address */}
              <div className="bg-[#232323] rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    <MapPin className="h-5 w-5 text-white mr-2" />
                    Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center text-white hover:text-gray-300 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      No saved addresses
                    </h3>
                    <p className="text-sm text-gray-300 mb-5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      Add your first address to continue with checkout
                    </p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-yellow-400 text-[#232323] px-6 py-2.5 rounded-lg hover:bg-yellow-300 font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{ fontFamily: "'Satoshi', sans-serif" }}
                    >
                      Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`relative p-5 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAddress?._id === address._id
                            ? 'bg-yellow-400/10 border border-yellow-400/30 shadow-md'
                            : 'bg-gray-800 hover:bg-gray-750 border border-gray-700'
                        }`}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3 flex-wrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                address.label === 'Home' ? 'bg-gray-700 text-white' :
                                address.label === 'Work' ? 'bg-gray-700 text-white' :
                                address.label === 'Custom' ? 'bg-gray-700 text-white' :
                                'bg-gray-700 text-gray-300'
                              }`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                {address.label === 'Home' ? '🏠' : 
                                 address.label === 'Work' ? '🏢' : 
                                 address.label === 'Custom' ? '⭐' : '📍'} {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/20 text-green-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                  ✓ Default
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <p className="font-semibold text-white text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                {address.name}
                              </p>
                              <p className="text-sm text-gray-300 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                📞 {address.phone}
                              </p>
                              <p className="text-sm text-gray-300 leading-relaxed" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                📍 {address.street}
                                {address.landmark && `, near ${address.landmark}`}
                                <br />
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors touch-target"
                              title="Edit address"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAddress(address._id);
                              }}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors touch-target"
                              title="Delete address"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {selectedAddress?._id === address._id && (
                              <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
                                <CheckCircle className="h-4 w-4 text-[#232323]" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Improved Add/Edit Address Form */}
                {showAddressForm && (
                  <div className="mt-5 p-6 rounded-lg bg-gray-800">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({
                            label: 'Home',
                            name: '',
                            phone: '',
                            street: '',
                            landmark: '',
                            city: '',
                            state: '',
                            pincode: '',
                            isDefault: false
                          });
                        }}
                        className="text-white hover:text-gray-300 touch-target"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Address Type
                        </label>
                        <select
                          value={newAddress.label}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value as 'Home' | 'Work' | 'Other' | 'Custom' }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        >
                          <option value="Home"> Home</option>
                          <option value="Work"> Work</option>
                          <option value="Other"> Other</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newAddress.name || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter your full name"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={newAddress.phone || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter phone number"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={newAddress.pincode || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter pincode"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={newAddress.street || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="House/Flat/Office No, Building Name, Street"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAddress.landmark || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, landmark: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Nearby landmark"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          City *
                        </label>
                        <input
                          type="text"
                          value={newAddress.city || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter city"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          State *
                        </label>
                        <input
                          type="text"
                          value={newAddress.state || ''}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-3 py-2.5 text-base border border-gray-600 rounded-md focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                          placeholder="Enter state"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center bg-gray-700 p-3 rounded-md">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault || false}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="h-4 w-4 text-yellow-400 focus:ring-yellow-400 border-gray-600 rounded bg-gray-800"
                      />
                      <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Make this my default address
                      </label>
                    </div>
                    <div className="mt-5 flex space-x-3">
                      <button
                        onClick={saveAddress}
                        className="bg-yellow-400 text-[#232323] px-6 py-2.5 rounded-md hover:bg-yellow-300 font-bold text-base shadow-sm hover:shadow-md transition-all duration-200 touch-target"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({
                            label: 'Home',
                            name: '',
                            phone: '',
                            street: '',
                            landmark: '',
                            city: '',
                            state: '',
                            pincode: '',
                            isDefault: false
                          });
                        }}
                        className="bg-gray-700 text-white px-6 py-2.5 rounded-md hover:bg-gray-600 font-semibold text-base transition-colors duration-200 touch-target"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-[#232323] rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-white mb-5 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <CreditCard className="h-5 w-5 text-white mr-2" />
                  Payment Method
                </h2>
                
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'bg-yellow-400/10'
                          : 'bg-gray-800 hover:bg-gray-750'
                      } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => method.enabled && setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <method.icon className={`h-5 w-5 ${selectedPaymentMethod === method.id ? 'text-yellow-400' : 'text-white'}`} />
                          <div>
                            <p className={`font-semibold text-base ${selectedPaymentMethod === method.id ? 'text-yellow-400' : 'text-white'}`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              {method.name}
                            </p>
                            <p className="text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {selectedPaymentMethod === method.id && (
                          <CheckCircle className="h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-[#232323] rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Special Instructions
                </h2>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests for your order? (optional)"
                  className="w-full px-4 py-3 text-base border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-gray-700 text-white placeholder-gray-400"
                  rows={3}
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#232323] rounded-xl shadow-xl sticky top-20">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    <ShoppingBag className="h-5 w-5 text-white mr-2" />
                    Order Summary
                  </h2>
                  
                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item, index) => (
                      <div key={item.id || item.menuItemId || `item-${index}`} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800">
                        <div className="w-12 h-12 relative flex-shrink-0">
                          <Image
                            src={sanitizeImageUrl(item.image)}
                            alt={item.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            {item.name}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-xs text-gray-400">Qty:</span>
                            <span className="text-xs font-semibold text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded">
                              {safeNumber(item.quantity)}
                            </span>
                            <span className="text-xs text-gray-400">×</span>
                            <span className="text-xs font-medium text-gray-300">₹{safeNumber(item.price)}</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          ₹{safeNumber(item.price) * safeNumber(item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pricing Breakdown */}
                  <div className="space-y-3 text-base border-t border-gray-700 pt-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-medium">Subtotal ({cart.totalItems} items)</span>
                      <span className="font-semibold text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-medium">Delivery Fee</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-400' : 'text-white'}`}>
                        {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-medium">Taxes (5%)</span>
                      <span className="font-semibold text-white">₹{taxes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-medium">Packaging Fee</span>
                      <span className="font-semibold text-white">₹{packagingFee}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          Total
                        </span>
                        <span className="text-xl font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          ₹{total}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Info */}
                  <div className="mt-5 p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>Delivery in 30-45 minutes</span>
                    </div>
                  </div>
                  
                  {/* Place Order Button */}
                  <button
                    onClick={placeOrder}
                    disabled={!selectedAddress || isProcessingOrder}
                    className="w-full mt-6 bg-yellow-400 text-[#232323] py-3.5 px-5 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2 font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    {isProcessingOrder ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Proceed to Payment ₹{total}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && currentOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={currentOrder}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
    </RealUserGuard>
  );
} 