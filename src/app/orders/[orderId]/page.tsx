'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Receipt, 
  AlertCircle, 
  Calendar,
  Repeat,
  Eye,
  Heart,
  MessageCircle,
  Share2
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
    description?: string;
    category?: string;
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const statusConfig = {
    pending: { 
      label: 'Order Placed', 
      icon: Clock, 
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200', 
      description: 'Waiting for confirmation',
      step: 1
    },
    confirmed: { 
      label: 'Confirmed', 
      icon: CheckCircle, 
      color: 'text-blue-600 bg-blue-100 border-blue-200', 
      description: 'Restaurant confirmed',
      step: 2
    },
    preparing: { 
      label: 'Preparing', 
      icon: Package, 
      color: 'text-orange-600 bg-orange-100 border-orange-200', 
      description: 'Your food is being prepared',
      step: 3
    },
    ready: { 
      label: 'Ready', 
      icon: CheckCircle, 
      color: 'text-green-600 bg-green-100 border-green-200', 
      description: 'Your order is ready',
      step: 4
    },
    out_for_delivery: { 
      label: 'Out for Delivery', 
      icon: Truck, 
      color: 'text-purple-600 bg-purple-100 border-purple-200', 
      description: 'Your food is on the way',
      step: 5
    },
    delivered: { 
      label: 'Delivered', 
      icon: CheckCircle, 
      color: 'text-green-600 bg-green-100 border-green-200', 
      description: 'Order completed successfully',
      step: 6
    },
    cancelled: { 
      label: 'Cancelled', 
      icon: AlertCircle, 
      color: 'text-red-600 bg-red-100 border-red-200', 
      description: 'Order has been cancelled',
      step: 0
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      
      const authState = checkAuthState();
      
      if (!authState.isAuthenticated) {
        console.log('Order Details: No authentication found', authState);
        toast.error('Authentication required. Please login again.');
        redirectToLogin();
        return;
      }
      
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Order Details: Unauthorized, redirecting to login');
          toast.error('Session expired. Please login again.');
          redirectToLogin();
          return;
        }
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    
    try {
      // Add items to cart
      const { unifiedCartService } = await import('@/lib/api');
      
      for (const item of order.items) {
        await unifiedCartService.addToCart(
          item.menuItem._id,
          item.menuItem.name,
          item.menuItem.description || '',
          item.menuItem.price,
          item.quantity,
          item.menuItem.image,
          order.restaurant._id,
          order.restaurant.name,
          item.customization ? [item.customization] : []
        );
      }
      
      toast.success('Items added to cart!');
      router.push('/cart');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to add items to cart');
    }
  };

  const handleReviewSubmit = async () => {
    if (!order || rating === 0) return;
    
    try {
      const response = await fetch(`/api/reviews/order/${order._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review,
          restaurantId: order.restaurant._id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setRating(0);
      setReview('');
      fetchOrderDetails(); // Refresh to show the review
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedTime = (estimatedDeliveryTime: string) => {
    const estimated = new Date(estimatedDeliveryTime);
    const now = new Date();
    const diffMs = estimated.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins <= 0) return 'Delivered';
    if (diffMins < 60) return `${diffMins} mins`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoading) {
    return (
      <AuthGuard>
      <div className="min-h-screen bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!order) {
    return (
      <AuthGuard>
      <div className="min-h-screen bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/orders"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const statusInfo = statusConfig[order.status];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Header */}
        <div className="bg-[#232323] border-b-4 border-gray-700 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/orders" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Order Details
                  </h1>
                  <p className="text-sm text-gray-300 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Order #{order.orderNumber}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleReorder}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-300"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <Repeat className="h-4 w-4" />
                    <span>Reorder</span>
                  </button>
                  
                  <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-300"
                    style={{ fontFamily: "'Satoshi', sans-serif" }}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Order Status
                  </h2>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'delivered' ? 'bg-green-500 text-white' :
                    order.status === 'cancelled' ? 'bg-red-500 text-white' :
                    order.status === 'ready' ? 'bg-blue-500 text-white' :
                    order.status === 'preparing' ? 'bg-orange-500 text-white' :
                    order.status === 'confirmed' ? 'bg-purple-500 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    <statusInfo.icon className="h-4 w-4 mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
                
                <div className="space-y-3 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 font-medium">Order Placed</span>
                    <span className="text-sm text-white font-semibold">{formatDate(order.placedAt)} at {formatTime(order.placedAt)}</span>
                  </div>
                  
                  {order.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">Delivered</span>
                      <span className="text-sm text-white font-semibold">{formatDate(order.deliveredAt)} at {formatTime(order.deliveredAt)}</span>
                    </div>
                  )}
                  
                  {['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">Estimated Delivery</span>
                      <span className="text-sm text-green-400 font-bold">{getEstimatedTime(order.estimatedDeliveryTime)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Items Ordered
                </h2>
                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={item._id || `item-${index}`} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={sanitizeImageUrl(item.menuItem?.image)}
                            alt={item.menuItem?.name || 'Item'}
                            fill
                            className="object-cover rounded-lg"
                          />
                          {item.menuItem?.isVeg && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            {item.menuItem?.name || item.name || 'Unknown Item'}
                          </h3>
                          {item.menuItem?.description && (
                            <p className="text-sm text-gray-300 mt-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              {item.menuItem.description}
                            </p>
                          )}
                          {item.menuItem?.category && (
                            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              {item.menuItem.category}
                            </p>
                          )}
                          {item.customization && (
                            <p className="text-sm text-blue-300 mt-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              Customization: {item.customization}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-base text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              Qty: {item.quantity || 1}
                            </span>
                            <span className="text-xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                              ₹{item.price || (item.menuItem?.price || 0) * (item.quantity || 1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                            ₹{item.menuItem?.price || item.price || 0} each
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">No items found</p>
                  )}
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Restaurant Details
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 relative">
                    <Image
                      src={sanitizeImageUrl(order.restaurant.image)}
                      alt={order.restaurant.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      {order.restaurant.name}
                    </h3>
                    <p className="text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      {order.restaurant.address.street}
                    </p>
                    <p className="text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      {order.restaurant.address.area}, {order.restaurant.address.city}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <a href={`tel:${order.restaurant.phone}`} className="flex items-center text-base text-blue-400 hover:text-blue-300 font-semibold" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        <Phone className="h-4 w-4 mr-1" />
                        {order.restaurant.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {order.status === 'delivered' && (
                <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                  <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                    Rate Your Experience
                  </h2>
                  
                  {order.rating ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 ${
                              star <= order.rating! ? 'text-blue-400 fill-current' : 'text-gray-500'
                            }`}
                          />
                        ))}
                        <span className="text-base text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          ({order.rating}/5)
                        </span>
                      </div>
                      {order.review && (
                        <p className="text-base text-gray-300 italic" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          "{order.review}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className={`h-8 w-8 ${
                              star <= rating ? 'text-blue-400 fill-current' : 'text-gray-500'
                            } hover:text-blue-300 transition-colors`}
                          >
                            <Star className="h-full w-full" />
                          </button>
                        ))}
                        <span className="text-base text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                          ({rating}/5)
                        </span>
                      </div>
                      
                      <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience (optional)"
                        className="w-full p-3 text-base border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none bg-gray-700 text-white placeholder-gray-400"
                        rows={3}
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      />
                      
                      <button
                        onClick={handleReviewSubmit}
                        disabled={rating === 0}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-base"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        Submit Review
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Order Summary
                </h2>
                <div className="space-y-3 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-medium">Subtotal</span>
                    <span className="font-semibold text-white">₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-medium">Delivery Fee</span>
                    <span className="font-semibold text-white">₹{order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-medium">Tax</span>
                    <span className="font-semibold text-white">₹{order.tax ?? (order as any).taxes ?? 0}</span>
                  </div>
                  <div className="border-t-2 border-gray-600 pt-3">
                    <div className="flex justify-between">
                      <span className="text-xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Total
                      </span>
                      <span className="text-xl font-black text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Payment Details
                </h2>
                <div className="space-y-3 text-base" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payment Method</span>
                    <span className="font-semibold text-white capitalize">{order.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payment Status</span>
                    <span className={`font-medium ${
                      order.paymentStatus === 'completed' ? 'text-green-400' : 'text-orange-400'
                    }`}>
                      {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-800 rounded-xl shadow-md border-2 border-gray-700 p-5">
                <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>Delivery Address</h2>
                <div className="space-y-2">
                  <p className="font-medium text-white">{order.deliveryAddress.name}</p>
                  <p className="text-gray-300">{order.deliveryAddress.street}</p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-gray-300">Landmark: {order.deliveryAddress.landmark}</p>
                  )}
                  <p className="text-gray-300">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  <div className="flex items-center text-blue-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {order.deliveryAddress.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 