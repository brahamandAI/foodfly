'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Store, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Home,
  DollarSign,
  ChefHat,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  totalUsers: number;
  activeUsers: number;
  cancelledOrders: number;
  failedOrders: number;
  pendingChefs: number;
  totalChefs: number;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Get admin user from localStorage
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      setAdminUser(JSON.parse(adminData));
    }

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#232323] overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="FoodFly"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-yellow-400 font-black text-lg">FoodFly</h1>
              <p className="text-gray-400 text-xs">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 bg-gray-800 text-white rounded-lg font-semibold"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/admin/restaurants"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Store className="w-5 h-5" />
            <span>Restaurants</span>
          </Link>
          
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </Link>
          
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>

          <Link
            href="/admin/chefs"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors relative"
          >
            <ChefHat className="w-5 h-5" />
            <span>Chefs</span>
            {stats && stats.pendingChefs > 0 && (
              <span className="ml-auto bg-yellow-400 text-[#232323] text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.pendingChefs}
              </span>
            )}
          </Link>
          
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Super Admin Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">
                Welcome back, {adminUser?.name || 'Admin'}
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Restaurants */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Store className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.totalRestaurants || 0}
                </p>
                <p className="text-sm text-gray-400">Restaurants</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.activeRestaurants || 0} active</p>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.todayOrders || 0} today</p>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  ₹{stats?.totalRevenue?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-xs text-gray-500 mt-1">₹{stats?.todayRevenue?.toLocaleString() || 0} today</p>
              </div>
            </div>

            {/* Users */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-400">Users</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.activeUsers || 0} active</p>
              </div>
            </div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Chefs */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <ChefHat className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.totalChefs || 0}
                </p>
                <p className="text-sm text-gray-400">Chefs</p>
                {stats && stats.pendingChefs > 0 && (
                  <p className="text-xs text-yellow-400 mt-1 font-semibold">
                    {stats.pendingChefs} pending approval
                  </p>
                )}
              </div>
            </div>

            {/* Cancelled Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.cancelledOrders || 0}
                </p>
                <p className="text-sm text-gray-400">Cancelled Orders</p>
              </div>
            </div>

            {/* Failed Orders */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {stats?.failedOrders || 0}
                </p>
                <p className="text-sm text-gray-400">Failed Orders</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/admin/restaurants"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                Manage Restaurants
              </Link>
              <Link
                href="/admin/orders"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                View All Orders
              </Link>
              <Link
                href="/admin/chefs"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center relative"
              >
                Review Chefs
                {stats && stats.pendingChefs > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#232323] text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.pendingChefs}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/settings"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors text-center"
              >
                System Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
