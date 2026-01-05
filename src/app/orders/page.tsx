'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sanitizeImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Star, 
  Package, 
  Truck, 
  CheckCircle, 
  Phone, 
  RefreshCw, 
  Receipt, 
  AlertCircle, 
  Search, 
  Eye,
  Repeat,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { checkAuthState, redirectToLogin } from '@/lib/utils/auth';

interface OrderItem {
  _id: string;
  menuItem: {
    _id: string;
    name: string;
    price: number;
    image: string;
    isVeg: boolean;
  };
  quantity: number;
  price: number;
  customization?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  restaurant: {
    _id: string;
    name: string;
    image: string;
    phone: string;
    address: {
      street: string;
      city: string;
      area: string;
    };
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  subtotal: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDeliveryTime: string;
  placedAt: string;
  deliveredAt?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  cancelledAt?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusConfig = {
    pending: { 
      label: 'Order Placed', 
      icon: Clock, 
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200', 
      description: 'Waiting for confirmation' 
    },
    confirmed: { 
      label: 'Confirmed', 
      icon: CheckCircle, 
      color: 'text-blue-600 bg-blue-100 border-blue-200', 
      description: 'Restaurant confirmed' 
    },
    preparing: { 
      label: 'Preparing', 
      icon: Package, 
      color: 'text-orange-600 bg-orange-100 border-orange-200', 
      description: 'Being prepared' 
    },
    ready: { 
      label: 'Ready', 
      icon: CheckCircle, 
      color: 'text-purple-600 bg-purple-100 border-purple-200', 
      description: 'Ready for pickup' 
    },
    out_for_delivery: { 
      label: 'Out for Delivery', 
      icon: Truck, 
      color: 'text-indigo-600 bg-indigo-100 border-indigo-200', 
      description: 'On the way' 
    },
    delivered: { 
      label: 'Delivered', 
      icon: CheckCircle, 
      color: 'text-green-600 bg-green-100 border-green-200', 
      description: 'Successfully delivered' 
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: AlertCircle, 
      color: 'text-red-600 bg-red-100 border-red-200', 
      description: 'Order cancelled' 
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedFilter]); // Refetch when filter changes

  const filterOptions = [
    { value: 'all', label: 'All Orders', count: orders.length },
    { value: 'active', label: 'Active Orders', count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length },
    { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const authState = checkAuthState();

      if (!authState.isAuthenticated) {
        console.log('Orders: No authentication found', authState);
        toast.error('Authentication required. Please login again.');
        redirectToLogin();
        return;
      }

      const params = new URLSearchParams();
      if (selectedFilter === 'cancelled') {
        params.append('status', 'cancelled');
      } else if (selectedFilter !== 'all') {
        params.append('status', selectedFilter);
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const apiOrders = (data && (data.orders || data.data?.orders)) || [];

        // Transform orders from API shape to UI Order type
        const transformedOrders: Order[] = apiOrders.map((o: any) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          restaurant: {
            _id: o.restaurant?._id || 'default-restaurant',
            name: o.restaurant?.name || 'Restaurant',
            image: '/images/restaurants/cafe.jpg',
            phone: '+91 9876543210',
            address: {
              street: o.deliveryAddress?.street || 'Main Street',
              city: o.deliveryAddress?.city || 'Your City',
              area: 'Food District'
            }
          },
          items: (o.items || []).map((it: any) => ({
            _id: it._id || it.menuItemId || `${o._id}_${it.name}`,
            menuItem: {
              _id: it.menuItemId || it._id || `${o._id}_${it.name}`,
              name: it.name,
              price: it.price,
              image: it.image || '/images/placeholder.svg',
              isVeg: true
            },
            quantity: it.quantity,
            price: it.price,
            customization: Array.isArray(it.customizations) ? it.customizations.join(', ') : (it.customization || '')
          })),
          status: o.status,
          totalAmount: o.totalAmount,
          deliveryFee: o.deliveryFee || 0,
          tax: o.taxes || o.tax || 0,
          subtotal: o.subtotal || 0,
          paymentMethod: o.paymentMethod || 'cod',
          paymentStatus: o.paymentStatus || 'pending',
          deliveryAddress: o.deliveryAddress || {
            name: '', phone: '', street: '', city: '', state: '', pincode: ''
          },
          estimatedDeliveryTime: o.estimatedDeliveryTime || o.placedAt,
          placedAt: o.placedAt || o.createdAt,
          deliveredAt: o.deliveredAt,
          rating: o.rating,
          review: o.review,
          createdAt: o.createdAt,
          cancelledAt: o.cancelledAt
        }));

        setOrders(transformedOrders);
      } else if (response.status === 401) {
        console.log('Orders: Unauthorized, redirecting to login');
        toast.error('Session expired. Please login again.');
        redirectToLogin();
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      // Clear current cart first and add items using unified cart service
      const { unifiedCartService } = require('@/lib/api');
      await unifiedCartService.clearCart();
      
      // Add items to cart using unified cart service
      for (const orderItem of order.items) {
        await unifiedCartService.addToCart(
          orderItem.menuItem._id,
          orderItem.menuItem.name,
          `Delicious ${orderItem.menuItem.name}`,
          orderItem.menuItem.price,
          orderItem.quantity,
          orderItem.menuItem.image || '/images/placeholder.svg',
          order.restaurant._id,
          order.restaurant.name,
          []
        );
      }

      toast.success('Items added to cart successfully!');
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder items');
    }
  };

  const filteredOrders = orders.filter(order => {
    // Server-side filtering handles status filters, we only need to handle search
    const matchesSearch = searchQuery === '' || 
      order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.menuItem.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEstimatedTime = (estimatedDeliveryTime: string) => {
    const estimated = new Date(estimatedDeliveryTime);
    const now = new Date();
    const diffMinutes = Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60));
    
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-300 text-sm" style={{ fontFamily: "'Satoshi', sans-serif" }}>Loading your orders...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Header */}
        <div className="bg-[#232323] shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Your Orders
                  </h1>
                  <p className="text-sm text-gray-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Track and manage your food orders
                  </p>
                </div>
              </div>
              
              <button
                onClick={fetchOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-base"
                style={{ fontFamily: "'Satoshi', sans-serif" }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Search and Filters */}
          <div className="bg-[#232323] rounded-xl shadow-md p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders, restaurants, or dishes..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-base placeholder-gray-400"
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                />
              </div>
              
              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      selectedFilter === option.value
                        ? 'bg-yellow-400 text-[#232323]'
                        : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                {orders.length === 0 ? 'No orders yet' : 'No orders found'}
              </h2>
              <p className="text-base text-yellow-300 mb-6" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                {orders.length === 0 
                  ? "You haven't placed any orders yet. Start exploring our delicious menu!"
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {orders.length === 0 && (
                <Link
                  href="/menu"
                className="inline-flex items-center px-5 py-2.5 bg-[#232323] text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-[#232323] transition-colors font-semibold text-base border-2 border-yellow-400"
                style={{ fontFamily: "'Satoshi', sans-serif" }}
              >
                Browse Menu
              </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status];
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={order._id} className="bg-gray-800 rounded-xl shadow-md border-2 border-yellow-400/30 hover:border-yellow-400 hover:shadow-lg transition-all">
                    <div className="p-5">
                      {/* Order Header - Black & Yellow Theme */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              {order.restaurant.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold border-2 ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-yellow-100 text-yellow-700 border-yellow-300'
                            }`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-sm text-yellow-300 flex-wrap" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            <span className="font-medium">Order #{order.orderNumber}</span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(order.placedAt)} at {formatTime(order.placedAt)}
                            </span>
                            {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                              <span className="flex items-center text-green-400 font-semibold">
                                <Clock className="h-4 w-4 mr-1" />
                                {getEstimatedTime(order.estimatedDeliveryTime)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-black text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            ₹{order.totalAmount}
                          </p>
                          <p className="text-sm text-yellow-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            {order.items.length} items
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-bold text-yellow-400 mb-2 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            Items Ordered
                          </h4>
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <div className="w-9 h-9 relative flex-shrink-0">
                                  <Image
                                    src={sanitizeImageUrl(item.menuItem.image)}
                                    alt={item.menuItem.name}
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                  {item.menuItem.isVeg && (
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                      <div className="w-1 h-1 bg-white rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-yellow-400 truncate" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    {item.menuItem.name}
                                  </p>
                                  <p className="text-sm text-yellow-300/80">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-yellow-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                  ₹{item.price}
                                </p>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-yellow-300/80 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-yellow-400 mb-2 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            Delivery Address
                          </h4>
                          <div className="text-sm text-yellow-300/80" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            <p className="font-semibold text-yellow-400">{order.deliveryAddress.name}</p>
                            <p>{order.deliveryAddress.street}</p>
                            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                            <p className="flex items-center mt-1">
                              <Phone className="h-4 w-4 mr-1" />
                              {order.deliveryAddress.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Actions - Black & Yellow Theme */}
                      <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-yellow-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            Payment: <span className="font-semibold capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                          </span>
                          <span className={`text-sm font-semibold ${
                            order.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                          }`} style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReorder(order)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-300"
                            style={{ fontFamily: "'Satoshi', sans-serif" }}
                          >
                            <Repeat className="h-4 w-4" />
                            <span>Reorder</span>
                          </button>
                          
                          <Link
                            href={`/orders/${order._id}`}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#232323] text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-[#232323] transition-colors text-sm font-semibold border-2 border-yellow-400"
                            style={{ fontFamily: "'Satoshi', sans-serif" }}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 