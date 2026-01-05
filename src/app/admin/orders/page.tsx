'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  restaurantName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    restaurant: '',
    status: '',
    date: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.restaurant) queryParams.append('restaurant', filters.restaurant);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.date) queryParams.append('date', filters.date);

      const response = await fetch(`/api/admin/orders?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'text-orange-400',
      confirmed: 'text-blue-400',
      preparing: 'text-orange-400',
      ready: 'text-purple-400',
      delivered: 'text-green-400',
      cancelled: 'text-red-400',
    };
    return colors[status] || 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-white">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#232323] overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Order Oversight</h1>
              <p className="text-gray-400 text-sm mt-1">View all platform orders (read-only)</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <select
            value={filters.restaurant}
            onChange={(e) => setFilters({ ...filters, restaurant: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-600"
          >
            <option value="">All Restaurants</option>
            {/* Populate from restaurants */}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-600"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      Order #{order.orderNumber}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)} bg-gray-800`}>
                      {order.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.paymentStatus === 'paid' ? 'text-green-400' : 'text-red-400'
                    } bg-gray-800`}>
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Restaurant: <span className="text-white">{order.restaurantName}</span></p>
                    <p>Customer: <span className="text-white">{order.customerEmail}</span></p>
                    <p>Placed: <span className="text-white">{new Date(order.placedAt).toLocaleString()}</span></p>
                    <p>Total: <span className="text-yellow-400 font-semibold">₹{order.totalAmount}</span></p>
                  </div>
                  <div className="mt-3 text-sm">
                    <p className="text-gray-400 mb-1">Items:</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <p key={idx} className="text-gray-300">
                          {item.quantity}x {item.name} - ₹{item.price * item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
