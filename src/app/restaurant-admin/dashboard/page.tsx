'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Menu, 
  Settings,
  Power,
  PowerOff,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Bell,
  TrendingUp,
  DollarSign,
  Home
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'handed_to_delivery' | 'delivered' | 'cancelled';
  customerEmail: string;
  deliveryAddress: {
    street: string;
    city: string;
    pincode: string;
  };
  specialInstructions?: string;
  placedAt: string;
  estimatedDeliveryTime?: string;
}

interface Restaurant {
  _id: string;
  name: string;
  isActive: boolean;
  preparationTime?: number;
}

export default function RestaurantAdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'history' | 'analytics' | 'settings'>('orders');
  const [menu, setMenu] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    isVeg: true,
    isAvailable: true
  });

  useEffect(() => {
    checkAuth();
    loadRestaurantData();
    loadOrders();
    loadMenu();
    loadNotifications();
    
    // Poll for new orders every 2 seconds
    const interval = setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 2000);

    // Load analytics periodically for accurate revenue stats
    const analyticsInterval = setInterval(() => {
      if (activeTab === 'orders') {
        loadAnalytics();
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadOrderHistory();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const checkAuth = () => {
    const token = localStorage.getItem('restaurantAdminToken');
    const restaurantAdmin = localStorage.getItem('restaurantAdmin');
    
    if (!token || !restaurantAdmin) {
      router.push('/restaurant-admin/login');
    }
  };

  const loadRestaurantData = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (restaurantData) {
        setRestaurant(JSON.parse(restaurantData));
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      const response = await fetch(`/api/restaurant-admin/orders?restaurantId=${restaurant._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, reason?: string) => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      
      const response = await fetch(`/api/restaurant-admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, reason })
      });

      if (response.ok) {
        toast.success(`Order ${status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'updated'} successfully`);
        loadOrders();
        loadAnalytics(); // Refresh analytics when order status changes
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Failed to update order');
    }
  };

  const toggleRestaurantStatus = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      const newStatus = !restaurant.isActive;

      const response = await fetch(`/api/restaurant-admin/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          restaurantId: restaurant._id,
          isActive: newStatus 
        })
      });

      if (response.ok) {
        const updatedRestaurant = { ...restaurant, isActive: newStatus };
        localStorage.setItem('restaurant', JSON.stringify(updatedRestaurant));
        setRestaurant(updatedRestaurant);
        toast.success(`Restaurant ${newStatus ? 'opened' : 'closed'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating restaurant status:', error);
      toast.error('Failed to update restaurant status');
    }
  };

  const loadMenu = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      // Load from database (will auto-initialize from static files if empty)
      const response = await fetch(`/api/restaurant-admin/menu?restaurantId=${restaurant._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const menuCategories = data.menuCategories || data.menu || [];
        setMenu(menuCategories);
        
        // Set default selected category to first category if none selected
        if (menuCategories.length > 0) {
          if (!selectedCategory || !menuCategories.find((c: any) => c.name === selectedCategory)) {
            setSelectedCategory(menuCategories[0].name);
          }
        }
        
        if (data.initialized) {
          toast.success('Menu initialized from default menu!');
        }
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Failed to load menu');
    }
  };

  const loadOrderHistory = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      const response = await fetch(`/api/restaurant-admin/orders/history?restaurantId=${restaurant._id}&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data.orders || []);
      }
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      // Load today's analytics for accurate revenue
      const todayResponse = await fetch(`/api/restaurant-admin/analytics?restaurantId=${restaurant._id}&period=today`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        if (todayData.analytics?.totalRevenue) {
          setTodayRevenue(todayData.analytics.totalRevenue);
        }
      }

      // Load month analytics for analytics tab
      const response = await fetch(`/api/restaurant-admin/analytics?restaurantId=${restaurant._id}&period=month`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      const response = await fetch(`/api/restaurant-admin/notifications?restaurantId=${restaurant._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      const response = await fetch('/api/restaurant-admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          category: newItem.category,
          item: {
            name: newItem.name,
            price: parseFloat(newItem.price.toString()),
            description: newItem.description,
            isVeg: newItem.isVeg,
            isAvailable: newItem.isAvailable
          }
        })
      });

      if (response.ok) {
        toast.success('Menu item added successfully!');
        setShowAddItemForm(false);
        setNewItem({
          name: '',
          price: '',
          description: '',
          category: '',
          isVeg: true,
          isAvailable: true
        });
        // Reload menu immediately to reflect changes
        await loadMenu();
        // Set selected category to the new item's category
        if (newItem.category) {
          setSelectedCategory(newItem.category);
        }
        // Trigger menu update event for frontend (all tabs/windows)
        window.dispatchEvent(new Event('menuUpdated'));
        // Also use localStorage for cross-tab communication
        localStorage.setItem('menuUpdated', Date.now().toString());
        setTimeout(() => localStorage.removeItem('menuUpdated'), 100);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add menu item');
      }
    } catch (error: any) {
      console.error('Error adding menu item:', error);
      toast.error(error.message || 'Failed to add menu item');
    }
  };

  const updateMenuItem = async (itemId: string, updates: any) => {
    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) {
        toast.error('Authentication required');
        return;
      }

      const restaurant = JSON.parse(restaurantData);
      
      // Convert price to number if it's a string
      let priceValue = updates.price;
      if (typeof priceValue === 'string') {
        // Handle price strings like "600" or "600/700"
        priceValue = parseFloat(priceValue.split('/')[0].trim()) || 0;
      }
      if (typeof priceValue !== 'number' || isNaN(priceValue)) {
        priceValue = 0;
      }
      
      // Ensure all required fields are in updates
      const fullUpdates = {
        name: updates.name || '',
        price: priceValue,
        category: updates.category || '',
        description: updates.description || '',
        isVeg: updates.isVeg !== undefined ? updates.isVeg : true,
        isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : true
      };
      
      const response = await fetch('/api/restaurant-admin/menu', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          itemId: itemId || 'new',
          updates: fullUpdates
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        toast.success('Menu item updated successfully!');
        setEditingItem(null);
        setShowAddItemForm(false);
        // Reload menu immediately to reflect changes
        await loadMenu();
        // Trigger menu update event for frontend (all tabs/windows)
        window.dispatchEvent(new Event('menuUpdated'));
        // Also use localStorage for cross-tab communication
        localStorage.setItem('menuUpdated', Date.now().toString());
        setTimeout(() => localStorage.removeItem('menuUpdated'), 100);
      } else {
        throw new Error(responseData.error || 'Failed to update menu item');
      }
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      toast.error(error.message || 'Failed to update menu item');
      // Reload menu on error to revert optimistic updates
      await loadMenu();
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantData = localStorage.getItem('restaurant');
      
      if (!token || !restaurantData) return;

      const restaurant = JSON.parse(restaurantData);
      
      const response = await fetch(`/api/restaurant-admin/menu?restaurantId=${restaurant._id}&itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Menu item deleted successfully!');
        // Reload menu immediately to reflect changes
        await loadMenu();
        // Trigger menu update event for frontend (all tabs/windows)
        window.dispatchEvent(new Event('menuUpdated'));
        // Also use localStorage for cross-tab communication
        localStorage.setItem('menuUpdated', Date.now().toString());
        setTimeout(() => localStorage.removeItem('menuUpdated'), 100);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete menu item');
      }
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      toast.error(error.message || 'Failed to delete menu item');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurantAdminToken');
    localStorage.removeItem('restaurantAdmin');
    localStorage.removeItem('restaurant');
    router.push('/restaurant-admin/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'accepted': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'preparing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'handed_to_delivery': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => ['confirmed', 'accepted', 'preparing', 'ready', 'out_for_delivery'].includes(o.status));
  
  // Calculate today's revenue from orders if analytics not loaded yet
  const calculatedTodayRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.placedAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString() && 
             o.status === 'delivered';
    })
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  
  // Use analytics revenue if available, otherwise use calculated
  const displayTodayRevenue = todayRevenue > 0 ? todayRevenue : calculatedTodayRevenue;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#232323] flex overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="FoodFly"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FoodFly</h1>
              <p className="text-xs text-gray-400">Restaurant Admin</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-800 hover:text-white mb-2"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Home</span>
          </Link>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'orders' 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Orders</span>
            {pendingOrders.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'menu' 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Menu className="h-5 w-5" />
            <span className="font-medium">Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'history' 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="font-medium">Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'settings' 
                ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </nav>

        {/* Restaurant Status Toggle */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={toggleRestaurantStatus}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              restaurant?.isActive
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
            }`}
          >
            {restaurant?.isActive ? (
              <>
                <Power className="h-5 w-5" />
                <span>Open</span>
              </>
            ) : (
              <>
                <PowerOff className="h-5 w-5" />
                <span>Closed</span>
              </>
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{restaurant?.name || 'Restaurant'}</h2>
              <p className="text-sm text-gray-400">Manage your restaurant operations</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors relative">
                  <Bell className="h-5 w-5 text-white" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Today's Revenue</p>
                  <p className="text-lg font-bold text-yellow-400">₹{displayTodayRevenue.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Active Orders</p>
                  <p className="text-lg font-bold text-white">{activeOrders.length}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Order Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Pending</span>
                    <ShoppingCart className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{pendingOrders.length}</p>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Preparing</span>
                    <Clock className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {orders.filter(o => o.status === 'preparing').length}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Ready</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {orders.filter(o => o.status === 'ready').length}
                  </p>
                </div>
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Delivered</span>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>

              {/* Live Orders Panel */}
              <div className="bg-gray-900 rounded-xl border border-gray-800">
                <div className="p-6 border-b border-gray-800">
                  <h3 className="text-xl font-bold text-white">Live Orders</h3>
                  <p className="text-sm text-gray-400">New orders appear here automatically</p>
                </div>
                <div className="p-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-400/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-bold text-white">Order #{order.orderNumber}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                  {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {new Date(order.placedAt).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-yellow-400">₹{order.totalAmount}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-300 mb-2">Items:</p>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-400">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-400">
                              <span className="font-medium text-gray-300">Delivery:</span> {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                            </p>
                            {order.specialInstructions && (
                              <p className="text-sm text-gray-400 mt-1">
                                <span className="font-medium text-gray-300">Instructions:</span> {order.specialInstructions}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'accepted')}
                                  className="flex-1 bg-yellow-400 text-[#232323] font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = prompt('Reason for rejection:');
                                    if (reason) {
                                      updateOrderStatus(order._id, 'cancelled', reason);
                                    }
                                  }}
                                  className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 px-4 rounded-lg hover:bg-red-500/30 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {(order.status === 'confirmed' || order.status === 'accepted') && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'preparing')}
                                className="flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold py-2 px-4 rounded-lg hover:bg-orange-500/30 transition-colors"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'ready')}
                                className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-2 px-4 rounded-lg hover:bg-green-500/30 transition-colors"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'handed_to_delivery')}
                                className="flex-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold py-2 px-4 rounded-lg hover:bg-purple-500/30 transition-colors"
                              >
                                Hand to Delivery
                              </button>
                            )}
                            {order.status === 'out_for_delivery' && (
                              <div className="flex-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold py-2 px-4 rounded-lg text-center">
                                Out for Delivery
                              </div>
                            )}
                            {order.status === 'delivered' && (
                              <div className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 font-bold py-2 px-4 rounded-lg text-center">
                                Delivered ✓
                              </div>
                            )}
                            {order.status === 'cancelled' && (
                              <div className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 px-4 rounded-lg text-center">
                                Cancelled
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Menu Management</h3>
                  <button 
                    onClick={() => {
                      setShowAddItemForm(true);
                      setEditingItem(null);
                      setNewItem({
                        name: '',
                        price: '',
                        description: '',
                        category: '',
                        isVeg: true,
                        isAvailable: true
                      });
                    }}
                    className="bg-yellow-400 text-[#232323] font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {showAddItemForm && (
                  <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <h4 className="text-lg font-bold text-white mb-4">
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Item Name *</label>
                        <input
                          type="text"
                          value={editingItem?.name || newItem.name}
                          onChange={(e) => editingItem 
                            ? setEditingItem({...editingItem, name: e.target.value})
                            : setNewItem({...newItem, name: e.target.value})
                          }
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="e.g., Butter Chicken"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingItem?.price !== undefined ? editingItem.price : (newItem.price || '')}
                          onChange={(e) => {
                            const priceVal = e.target.value;
                            if (editingItem) {
                              setEditingItem({...editingItem, price: priceVal === '' ? 0 : parseFloat(priceVal) || 0});
                            } else {
                              setNewItem({...newItem, price: priceVal});
                            }
                          }}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="250"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                        <input
                          type="text"
                          list="categories-list"
                          value={editingItem?.category || newItem.category}
                          onChange={(e) => editingItem
                            ? setEditingItem({...editingItem, category: e.target.value})
                            : setNewItem({...newItem, category: e.target.value})
                          }
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="e.g., Main Course, Soups, Salads"
                        />
                        <datalist id="categories-list">
                          {menu.map((cat: any) => (
                            <option key={cat.name} value={cat.name} />
                          ))}
                        </datalist>
                        {menu.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            Existing: {menu.map((c: any) => c.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <input
                          type="text"
                          value={editingItem?.description || newItem.description}
                          onChange={(e) => editingItem
                            ? setEditingItem({...editingItem, description: e.target.value})
                            : setNewItem({...newItem, description: e.target.value})
                          }
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingItem?.isVeg !== undefined ? editingItem.isVeg : newItem.isVeg}
                            onChange={(e) => editingItem
                              ? setEditingItem({...editingItem, isVeg: e.target.checked})
                              : setNewItem({...newItem, isVeg: e.target.checked})
                            }
                            className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400"
                          />
                          <span className="text-sm text-gray-300">Vegetarian</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={editingItem?.isAvailable !== undefined ? editingItem.isAvailable : newItem.isAvailable}
                            onChange={(e) => editingItem
                              ? setEditingItem({...editingItem, isAvailable: e.target.checked})
                              : setNewItem({...newItem, isAvailable: e.target.checked})
                            }
                            className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400"
                          />
                          <span className="text-sm text-gray-300">Available</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => {
                          if (editingItem) {
                            updateMenuItem(editingItem._id, editingItem);
                          } else {
                            addMenuItem();
                          }
                        }}
                        className="bg-yellow-400 text-[#232323] font-bold py-2 px-6 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        {editingItem ? 'Update' : 'Add'} Item
                      </button>
                      <button
                        onClick={() => {
                          setShowAddItemForm(false);
                          setEditingItem(null);
                        }}
                        className="bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {menu.length === 0 ? (
                  <div className="text-center py-12">
                    <Menu className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No menu items yet. Add your first item!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Category Selector */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-300">Select Category:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-[200px]"
                      >
                        {menu.map((cat: any) => (
                          <option key={cat.name} value={cat.name}>
                            {cat.name} ({cat.items?.length || 0} items)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Items for Selected Category */}
                    {selectedCategory && (() => {
                      const selectedCat = menu.find((cat: any) => cat.name === selectedCategory);
                      if (!selectedCat || !selectedCat.items || selectedCat.items.length === 0) {
                        return (
                          <div className="text-center py-12 bg-gray-800 rounded-lg">
                            <p className="text-gray-400">No items in this category yet.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                          <h4 className="text-lg font-bold text-white mb-6">{selectedCat.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedCat.items.map((item: any, itemIdx: number) => {
                              const isOutOfStock = !item.isAvailable;
                              return (
                                <div 
                                  key={itemIdx} 
                                  className={`rounded-lg p-4 border transition-all ${
                                    isOutOfStock 
                                      ? 'bg-red-950/30 border-red-800/50' 
                                      : 'bg-gray-900 border-gray-700'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className={`font-bold ${isOutOfStock ? 'text-red-300' : 'text-white'}`}>
                                        {item.name}
                                      </h5>
                                      <p className={`text-sm ${isOutOfStock ? 'text-red-200/70' : 'text-gray-400'}`}>
                                        {item.description || 'No description'}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        item.isVeg ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                      }`}>
                                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-3">
                                    <span className={`text-lg font-bold ${isOutOfStock ? 'text-red-400' : 'text-yellow-400'}`}>
                                      ₹{typeof item.price === 'string' ? item.price : item.price}
                                    </span>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={async () => {
                                          try {
                                            // Toggle out of stock status
                                            const newAvailability = !item.isAvailable;
                                            const itemId = item._id || `${selectedCat.name}_${itemIdx}`;
                                            
                                            // Get current price value
                                            let currentPrice = item.price;
                                            if (typeof currentPrice === 'string') {
                                              currentPrice = parseFloat(currentPrice.split('/')[0].trim()) || 0;
                                            }
                                            
                                            // Update in database first (no optimistic update to avoid confusion)
                                            await updateMenuItem(itemId, {
                                              name: item.name,
                                              price: currentPrice,
                                              description: item.description || '',
                                              category: selectedCat.name,
                                              isVeg: item.isVeg !== undefined ? item.isVeg : true,
                                              isAvailable: newAvailability
                                            });
                                            
                                            // Success message is handled in updateMenuItem
                                          } catch (error: any) {
                                            toast.error(error.message || 'Failed to update availability');
                                          }
                                        }}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                          isOutOfStock
                                            ? 'bg-red-700 text-white hover:bg-red-800 border border-red-600'
                                            : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                                        }`}
                                        title={isOutOfStock ? 'Mark as Available' : 'Mark as Out of Stock'}
                                      >
                                        {isOutOfStock ? '✓ In Stock' : '✗ Out'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          // Extract price properly - handle both string and number formats
                                          let priceValue = item.price;
                                          if (typeof priceValue === 'string') {
                                            // Handle formats like "600" or "600/700"
                                            priceValue = parseFloat(priceValue.split('/')[0].trim()) || 0;
                                          }
                                          if (typeof priceValue !== 'number' || isNaN(priceValue)) {
                                            priceValue = 0;
                                          }
                                          
                                          const itemToEdit = {
                                            _id: item._id || `${selectedCat.name}_${itemIdx}`,
                                            name: item.name,
                                            price: priceValue,
                                            description: item.description || '',
                                            category: selectedCat.name,
                                            isVeg: item.isVeg !== undefined ? item.isVeg : true,
                                            isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
                                          };
                                          setEditingItem(itemToEdit);
                                          setShowAddItemForm(true);
                                        }}
                                        className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                        title="Edit item"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const itemId = item._id || `${selectedCat.name}_${itemIdx}`;
                                          deleteMenuItem(itemId);
                                        }}
                                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                                        title="Delete item"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  {isOutOfStock && (
                                    <div className="mt-2 pt-2 border-t border-red-800/50">
                                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-900/50 text-red-300 border border-red-700">
                                        OUT OF STOCK
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Order History</h3>
              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No order history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <div key={order._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-bold text-white">Order #{order.orderNumber}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {new Date(order.placedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-yellow-400">₹{order.totalAmount}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-300 mb-2">Items:</p>
                        <div className="space-y-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-400">
                              <span>{item.quantity}x {item.name}</span>
                              <span>₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {analytics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Total Orders</span>
                        <ShoppingCart className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold text-white">{analytics.totalOrders}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Total Revenue</span>
                        <DollarSign className="h-5 w-5 text-green-400" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-400">₹{analytics.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Avg Order Value</span>
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold text-white">₹{analytics.averageOrderValue.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <h4 className="text-lg font-bold text-white mb-4">Order Status Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(analytics.statusCounts).map(([status, count]: [string, any]) => (
                        <div key={status} className="bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-gray-400 mb-1">{status.toUpperCase()}</p>
                          <p className="text-2xl font-bold text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Loading analytics...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Restaurant Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      value={restaurant?.preparationTime || 30}
                      onChange={async (e) => {
                        const newTime = parseInt(e.target.value);
                        try {
                          const token = localStorage.getItem('restaurantAdminToken');
                          const restaurantData = localStorage.getItem('restaurant');
                          
                          if (!token || !restaurantData) return;

                          const restaurant = JSON.parse(restaurantData);
                          
                          const response = await fetch('/api/restaurant-admin/status', {
                            method: 'PATCH',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              restaurantId: restaurant._id,
                              preparationTime: newTime
                            })
                          });

                          if (response.ok) {
                            const updated = { ...restaurant, preparationTime: newTime };
                            localStorage.setItem('restaurant', JSON.stringify(updated));
                            setRestaurant(updated);
                            toast.success('Preparation time updated');
                          }
                        } catch (error) {
                          console.error('Error updating preparation time:', error);
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      min="10"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Restaurant Status</label>
                    <button
                      onClick={toggleRestaurantStatus}
                      className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                        restaurant?.isActive
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {restaurant?.isActive ? 'Restaurant is OPEN' : 'Restaurant is CLOSED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

