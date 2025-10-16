'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Calendar,
  Users,
  ShoppingBag,
  DollarSign,
  Star,
  Package,
  Activity,
  ArrowLeft,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
  };
  restaurants: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    rating: number;
    growth: number;
  }>;
  orders: {
    byStatus: Record<string, number>;
    byHour: Array<{ hour: number; count: number }>;
    byDay: Array<{ day: string; count: number; revenue: number }>;
  };
  users: {
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
    byLocation: Array<{ city: string; count: number }>;
  };
  payments: {
    cod: number;
    online: number;
    failed: number;
  };
  delivery: {
    averageTime: number;
    onTimeRate: number;
    performance: Array<{ partner: string; deliveries: number; rating: number }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Mock analytics data - replace with actual API calls
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 285000,
          totalOrders: 1250,
          totalUsers: 8500,
          averageOrderValue: 385,
          revenueGrowth: 15.2,
          orderGrowth: 12.8
        },
        restaurants: [
          { id: '3', name: 'Symposium Restaurant', revenue: 125000, orders: 580, rating: 4.7, growth: 18.5 },
          { id: '1', name: 'Panache', revenue: 98000, orders: 420, rating: 4.8, growth: 22.3 },
          { id: '2', name: 'Cafe After Hours', revenue: 62000, orders: 250, rating: 4.6, growth: 8.7 }
        ],
        orders: {
          byStatus: {
            delivered: 1050,
            pending: 45,
            preparing: 32,
            cancelled: 123
          },
          byHour: [
            { hour: 8, count: 12 }, { hour: 9, count: 25 }, { hour: 10, count: 45 },
            { hour: 11, count: 65 }, { hour: 12, count: 85 }, { hour: 13, count: 95 },
            { hour: 14, count: 75 }, { hour: 15, count: 55 }, { hour: 16, count: 45 },
            { hour: 17, count: 35 }, { hour: 18, count: 65 }, { hour: 19, count: 95 },
            { hour: 20, count: 125 }, { hour: 21, count: 105 }, { hour: 22, count: 75 }
          ],
          byDay: [
            { day: 'Mon', count: 180, revenue: 45000 },
            { day: 'Tue', count: 165, revenue: 42000 },
            { day: 'Wed', count: 195, revenue: 48000 },
            { day: 'Thu', count: 210, revenue: 52000 },
            { day: 'Fri', count: 245, revenue: 58000 },
            { day: 'Sat', count: 285, revenue: 68000 },
            { day: 'Sun', count: 220, revenue: 55000 }
          ]
        },
        users: {
          newUsers: 450,
          activeUsers: 6200,
          retentionRate: 73.5,
          byLocation: [
            { city: 'Mumbai', count: 3200 },
            { city: 'Delhi', count: 2800 },
            { city: 'Bangalore', count: 1850 },
            { city: 'Chennai', count: 650 }
          ]
        },
        payments: {
          cod: 62,
          online: 36,
          failed: 2
        },
        delivery: {
          averageTime: 28,
          onTimeRate: 89.2,
          performance: [
            { partner: 'Speed Delivery', deliveries: 485, rating: 4.8 },
            { partner: 'Quick Rush', deliveries: 325, rating: 4.6 },
            { partner: 'Fast Track', deliveries: 240, rating: 4.5 }
          ]
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive business intelligence and insights</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
            
            <button
              onClick={loadAnalyticsData}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className={`flex items-center text-sm ${
                data?.overview.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data?.overview.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(data?.overview.revenueGrowth || 0)}%
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">₹{data?.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-gray-600">Total Revenue</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`flex items-center text-sm ${
                data?.overview.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {data?.overview.orderGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(data?.overview.orderGrowth || 0)}%
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{data?.overview.totalOrders.toLocaleString()}</p>
              <p className="text-gray-600">Total Orders</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{data?.overview.totalUsers.toLocaleString()}</p>
              <p className="text-gray-600">Total Users</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">₹{data?.overview.averageOrderValue}</p>
              <p className="text-gray-600">Avg Order Value</p>
            </div>
          </div>
        </div>

        {/* Restaurant Performance */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Restaurant Performance</h2>
            <Link href="/admin/restaurants" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View Details →
            </Link>
          </div>
          
          <div className="space-y-4">
            {data?.restaurants.map((restaurant, index) => (
              <div key={restaurant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{restaurant.orders} orders</span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {restaurant.rating}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{restaurant.revenue.toLocaleString()}</p>
                  <p className={`text-sm flex items-center ${
                    restaurant.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {restaurant.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(restaurant.growth)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status Distribution</h3>
            <div className="space-y-4">
              {Object.entries(data?.orders.byStatus || {}).map(([status, count]) => {
                const total = Object.values(data?.orders.byStatus || {}).reduce((a, b) => a + b, 0);
                const percentage = ((count / total) * 100).toFixed(1);
                
                const statusColors = {
                  delivered: 'bg-green-500',
                  pending: 'bg-yellow-500',
                  preparing: 'bg-orange-500',
                  cancelled: 'bg-red-500'
                };
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`}></div>
                      <span className="capitalize text-gray-700">{status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">{count}</span>
                      <span className="text-gray-500 text-sm ml-2">({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-gray-700">Cash on Delivery</span>
                </div>
                <span className="font-semibold text-gray-900">{data?.payments.cod}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-gray-700">Online Payment</span>
                </div>
                <span className="font-semibold text-gray-900">{data?.payments.online}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">Failed</span>
                </div>
                <span className="font-semibold text-gray-900">{data?.payments.failed}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Performance</h3>
          <div className="grid grid-cols-7 gap-4">
            {data?.orders.byDay.map((day) => (
              <div key={day.day} className="text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">{day.day}</div>
                <div className="bg-indigo-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600">{day.count}</div>
                  <div className="text-xs text-gray-600">orders</div>
                  <div className="text-sm font-medium text-gray-900 mt-1">₹{(day.revenue / 1000).toFixed(0)}k</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users & Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* User Analytics */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">User Analytics</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data?.users.newUsers}</div>
                  <div className="text-sm text-gray-600">New Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{data?.users.activeUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{data?.users.retentionRate}%</div>
                  <div className="text-sm text-gray-600">Retention</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Users by Location</h4>
                <div className="space-y-2">
                  {data?.users.byLocation.map((location) => (
                    <div key={location.city} className="flex justify-between items-center">
                      <span className="text-gray-700">{location.city}</span>
                      <span className="font-medium text-gray-900">{location.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Performance */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Performance</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{data?.delivery.averageTime}m</div>
                  <div className="text-sm text-gray-600">Avg Delivery Time</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{data?.delivery.onTimeRate}%</div>
                  <div className="text-sm text-gray-600">On-Time Rate</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Top Delivery Partners</h4>
                <div className="space-y-3">
                  {data?.delivery.performance.map((partner, index) => (
                    <div key={partner.partner} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{partner.partner}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{partner.deliveries}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                          {partner.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
