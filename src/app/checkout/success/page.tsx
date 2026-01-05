'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, MapPin, Phone, Receipt, ArrowRight, Home } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { ensureAuthInCookies } from '@/lib/api';

interface Order {
  _id: string;
  orderNumber: string;
  restaurant: {
    name: string;
    phone: string;
    address: {
      street: string;
      city: string;
      area: string;
    };
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDeliveryTime: string;
  status: string;
  items: Array<{
    menuItem: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Check and maintain authentication
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (!token || !user || isLoggedIn !== 'true') {
        console.log('Authentication lost, attempting to restore...');
        // Try to restore from session storage or other sources
        const sessionToken = sessionStorage.getItem('token');
        const sessionUser = sessionStorage.getItem('user');
        
        if (sessionToken && sessionUser) {
          localStorage.setItem('token', sessionToken);
          localStorage.setItem('user', sessionUser);
          localStorage.setItem('isLoggedIn', 'true');
          console.log('Authentication restored from session storage');
        } else {
          console.log('No backup authentication found');
        }
      }
      
      // Ensure authentication is set in cookies for middleware
      ensureAuthInCookies();
    };

    checkAuth();
    
    // Check auth every 5 seconds to prevent loss
    const authInterval = setInterval(checkAuth, 5000);
    
    return () => clearInterval(authInterval);
  }, []);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    loadOrder();
  }, [orderId, router]);

  useEffect(() => {
    // Countdown timer for redirect
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Ensure authentication is maintained before redirect
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          const isLoggedIn = localStorage.getItem('isLoggedIn');
          
          if (!token || !user || isLoggedIn !== 'true') {
            console.log('Authentication lost before redirect, going to login');
            router.push('/login');
            return 0;
          }
          
          router.push('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const loadOrder = async () => {
    try {
      // Ensure we have valid authentication
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (!token || !user || isLoggedIn !== 'true') {
        console.log('Authentication lost during order load');
        toast.error('Authentication lost. Please login again.');
        router.push('/login');
        return;
      }

      // Fetch specific order from database API
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Token expired or invalid');
          toast.error('Session expired. Please login again.');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      const foundOrder = data.order;
      
      if (foundOrder) {
        // Transform the order data to match the expected format
        setOrder({
          _id: foundOrder._id,
          orderNumber: foundOrder.orderNumber,
          restaurant: {
            name: foundOrder.restaurant?.name || 'FoodFly Kitchen',
            phone: foundOrder.restaurant?.phone || '+91 9876543210',
            address: {
              street: 'Main Street',
              city: 'Your City',
              area: 'Food District'
            }
          },
          totalAmount: foundOrder.totalAmount,
          paymentMethod: foundOrder.paymentMethod,
          paymentStatus: foundOrder.paymentStatus,
          deliveryAddress: foundOrder.deliveryAddress,
          estimatedDeliveryTime: foundOrder.estimatedDeliveryTime,
          status: foundOrder.status,
          items: foundOrder.items.map((item: any) => ({
            menuItem: {
              name: item.name,
              price: item.price
            },
            quantity: item.quantity
          }))
        });
      } else {
        toast.error('Order not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEstimatedDeliveryTime = () => {
    if (!order) return '';
    const estimatedTime = new Date(order.estimatedDeliveryTime);
    const now = new Date();
    const diffMinutes = Math.ceil((estimatedTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Arriving soon';
    if (diffMinutes < 60) return `${diffMinutes} mins`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#232323] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#232323] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Order Not Found
            </h1>
            <Link href="/" className="text-yellow-400 hover:text-yellow-300 font-semibold text-sm" style={{ fontFamily: "'Satoshi', sans-serif" }}>
              Go to Home
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Success Header - Black & Yellow Theme */}
        <div className="bg-[#232323] border-b-4 border-yellow-400">
          <div className="max-w-4xl mx-auto px-4 py-10 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-bold text-green-500 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                Order Placed Successfully!
              </h1>
              <p className="text-base text-gray-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                Thank you for your order. We're preparing your delicious meal!
              </p>
            </div>
            
            <div className="bg-gray-800 border-2 border-yellow-400 rounded-xl p-5 max-w-md mx-auto">
              <p className="text-base font-semibold mb-2 text-yellow-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                Order Number
              </p>
              <p className="text-2xl font-black tracking-wider text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                {order.orderNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Order Details */}
            <div className="space-y-5">
              {/* Delivery Information - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                  Delivery Information
                </h2>
                
                <div className="space-y-2.5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <div>
                    <p className="font-semibold text-yellow-400 text-base">{order.deliveryAddress.name}</p>
                    <p className="text-sm text-yellow-300/80">{order.deliveryAddress.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-300/80 leading-relaxed">
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}, 
                      {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Restaurant Information - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <Phone className="h-5 w-5 text-yellow-400 mr-2" />
                  Restaurant Details
                </h2>
                
                <div className="space-y-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <p className="font-semibold text-yellow-400 text-base">{order.restaurant.name}</p>
                  <p className="text-sm text-yellow-300/80">{order.restaurant.phone}</p>
                  <p className="text-sm text-yellow-300/80">
                    {order.restaurant.address.street}, {order.restaurant.address.area}, {order.restaurant.address.city}
                  </p>
                </div>
              </div>

              {/* Payment Information - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <Receipt className="h-5 w-5 text-yellow-400 mr-2" />
                  Payment Details
                </h2>
                
                <div className="space-y-2 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <div className="flex justify-between">
                    <span className="text-yellow-300/80">Payment Method</span>
                    <span className="font-semibold text-yellow-400 capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-300/80">Payment Status</span>
                    <span className={`font-semibold capitalize ${
                      order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-black pt-2 border-t-2 border-yellow-400/20">
                    <span className="text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      Total Amount
                    </span>
                    <span className="text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Status */}
            <div className="space-y-5">
              {/* Delivery Status - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4 flex items-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                  Delivery Status
                </h2>
                
                <div className="text-center">
                  <div className="bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400 px-4 py-2 rounded-full inline-block font-bold text-base mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Order Confirmed
                  </div>
                  
                  <p className="text-2xl font-black text-yellow-400 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    {getEstimatedDeliveryTime()}
                  </p>
                  <p className="text-sm text-yellow-300/80 mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Estimated delivery time
                  </p>
                  
                  <div className="bg-yellow-400/10 border-2 border-yellow-400/30 rounded-lg p-3">
                    <p className="text-sm text-yellow-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      🍳 Your order is being prepared by our chef. 
                      You'll receive updates as your order progresses!
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Order Items
                </h2>
                
                <div className="space-y-2.5">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b-2 border-yellow-400/20 last:border-b-0">
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-400 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          {item.menuItem.name}
                        </p>
                        <p className="text-sm text-yellow-300/80">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-yellow-400 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        ₹{item.menuItem.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions - Black & Yellow Theme */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400 p-5">
                <h2 className="text-lg font-bold text-yellow-400 mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  What's Next?
                </h2>
                
                <div className="space-y-2.5">
                  <Link
                    href="/orders"
                    className="w-full bg-yellow-400 text-[#232323] py-2.5 px-4 rounded-lg hover:bg-yellow-300 transition-colors flex items-center justify-center space-x-2 font-bold text-base border-2 border-yellow-400"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Track Your Order</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  
                  <Link
                    href="/menu"
                    className="w-full bg-gray-700 text-yellow-400 py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 font-semibold text-base border-2 border-yellow-400/30"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <span>Order More Food</span>
                  </Link>
                  
                  <Link
                    href="/"
                    className="w-full bg-gray-700 text-yellow-400 py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 font-semibold text-base border-2 border-yellow-400/30"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <Home className="h-4 w-4" />
                    <span>Back to Home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Redirect Notice - Black & Yellow Theme */}
          <div className="mt-6 text-center">
            <div className="bg-yellow-400/10 border-2 border-yellow-400/30 rounded-lg p-3 inline-block">
              <p className="text-sm text-yellow-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                You'll be automatically redirected to order tracking in {countdown} seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}