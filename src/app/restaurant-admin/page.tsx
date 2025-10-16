'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Eye,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  DollarSign,
  Star,
  Phone,
  Calendar,
  Search,
  X
} from 'lucide-react';
import Image from 'next/image';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  image?: string;
  rating?: number;
  preparationTime?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  subtotal?: number;
  deliveryFee?: number;
  taxes?: number;
  status: string;
  paymentMethod?: string;
  items: Array<{
    menuItemId?: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    customizations?: string[];
    image?: string;
    isVeg?: boolean;
    category?: string;
  }>;
  createdAt: string;
}

export default function RestaurantAdminDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    isVeg: true,
    isAvailable: true,
    image: '',
    preparationTime: '',
    rating: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isFillingImages, setIsFillingImages] = useState(false);
  const [fillSummary, setFillSummary] = useState<{ updated: number; failed: number; batches: number } | null>(null);
  const [isFillingCatImages, setIsFillingCatImages] = useState(false);
  const [catSummary, setCatSummary] = useState<{ updated: number; failed: number } | null>(null);
  const cancelFillRef = useRef(false);
  const cancelCatFillRef = useRef(false);
  
  // Order search and filter states
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('all');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const token = localStorage.getItem('adminToken');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'restaurant_admin') {
      router.push('/restaurant-admin/login');
      return;
    }

    loadRestaurantData();
  }, [isMounted]);

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      
      const adminData = localStorage.getItem('restaurantAdminData');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        setRestaurantId(parsed.restaurantId);
        setRestaurantName(parsed.restaurantName);
        setAdminName(parsed.adminName);
        
        // Load restaurant-specific orders using the new API
        const ordersResponse = await fetch('/api/restaurant-admin/orders', {
          headers: {
            'Authorization': `Bearer restaurant-admin-token-${parsed.restaurantId}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          console.log(`📋 Loaded ${ordersData.orders?.length || 0} orders for restaurant ${parsed.restaurantId}`);
          setOrders(ordersData.orders || []);
        } else {
          console.error('Failed to load restaurant orders:', ordersResponse.status);
          setOrders([]);
        }
        
        // Load actual menu items for this restaurant from database
        const adminToken = localStorage.getItem('adminToken');
        const menuResponse = await fetch('/api/restaurant-admin/menu-db', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (menuResponse.ok) {
          const menuData = await menuResponse.json();
          console.log('Menu data loaded:', menuData);
          setMenuItems(menuData.menu || []);
        } else {
          console.error('Failed to load menu:', menuResponse.status);
          const errorText = await menuResponse.text();
          console.error('Menu error details:', errorText);
        }
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAllImages = async () => {
    try {
      if (!restaurantId) {
        toast.error('Restaurant not loaded yet');
        return;
      }
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Not authenticated');
        return;
      }

      setIsFillingImages(true);
      setFillSummary(null);
      cancelFillRef.current = false;
      let totalUpdated = 0;
      let totalFailed = 0;
      let batches = 0;

      // Loop batches until candidates exhausted or safety limit reached
      for (let i = 0; i < 50; i++) {
        if (cancelFillRef.current) {
          toast('Image fill stopped');
          break;
        }
        batches++;
        const resp = await fetch('/api/restaurant-admin/menu-db/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            restaurantId,
            onlyMissing: true,
            max: 50,
            dryRun: false,
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: 'Image fill failed' }));
          toast.error(err.error || 'Image fill failed');
          break;
        }
        const data = await resp.json();
        totalUpdated += data.updated || 0;
        totalFailed += data.failed || 0;

        // Progress toast
        toast.success(`Batch ${batches}: +${data.updated || 0} images (remaining candidates: ${data.candidates || 0})`);

        if (!data.candidates || data.candidates <= 0) {
          break;
        }

        // Small delay between batches
        await new Promise(r => setTimeout(r, 600));
      }

      setFillSummary({ updated: totalUpdated, failed: totalFailed, batches });
      // Reload menu to reflect new image URLs
      await loadRestaurantData();
    } catch (e: any) {
      console.error('Fill images error:', e);
      toast.error(e?.message || 'Failed to fill images');
    } finally {
      setIsFillingImages(false);
    }
  };

  const fillCategoryImages = async () => {
    try {
      if (!restaurantId) {
        toast.error('Restaurant not loaded yet');
        return;
      }
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Not authenticated');
        return;
      }
      setIsFillingCatImages(true);
      setCatSummary(null);
      cancelCatFillRef.current = false;
      const resp = await fetch('/api/restaurant-admin/category-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ restaurantId, categories: selectedCategory !== 'all' ? [selectedCategory] : [], max: selectedCategory !== 'all' ? 1 : 20 })
      });
      const data = await resp.json();
      if (!resp.ok) {
        toast.error(data.error || 'Failed to fill category images');
        return;
      }
      setCatSummary({ updated: data.updated || 0, failed: data.failed || 0 });
      toast.success(`Category images updated: ${data.updated || 0}`);
    } catch (e: any) {
      console.error('Fill category images error:', e);
      toast.error(e?.message || 'Failed to fill category images');
    } finally {
      setIsFillingCatImages(false);
    }
  };

  // Get available categories for dropdown
  const availableCategories = Array.from(new Set(menuItems.map(item => item.category))).sort();

  const handleImageUpload = async (file: File, dishName: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dishName', dishName);
    formData.append('restaurantId', restaurantId);
    formData.append('isAdminUpload', 'true'); // Mark as admin priority upload

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const result = await response.json();
    return result.imagePath;
  };

  const updateOrderStatus = async (orderId: string, action: string, status?: string) => {
    try {
      console.log(`🏪 Restaurant ${restaurantId} taking action: ${action} on order ${orderId}`);
      
      const response = await fetch('/api/restaurant-admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer restaurant-admin-token-${restaurantId}`
        },
        body: JSON.stringify({ orderId, action, status })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Order ${action}ed successfully`);
        loadRestaurantData(); // Reload to get updated orders
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} order`);
      }
    } catch (error: any) {
      console.error(`Error ${action}ing order:`, error);
      toast.error(error.message || `Failed to ${action} order`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      accepted: 'bg-blue-50 text-blue-700 border-blue-200',
      preparing: 'bg-orange-50 text-orange-700 border-orange-200',
      ready: 'bg-purple-50 text-purple-700 border-purple-200',
      out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Filter orders based on search term, status, and date
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = orderSearchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customer?.phone?.includes(orderSearchTerm) ||
      order.items.some(item => item.name?.toLowerCase().includes(orderSearchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;

    // Date filter
    let matchesDate = true;
    if (orderDateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      switch (orderDateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          matchesDate = orderDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleAddMenuItem = async () => {
    try {
      setUploadingImage(true);
      
      // Handle image upload if file is selected
      let imagePath = newItem.image;
      if (selectedFile && newItem.name) {
        try {
          imagePath = await handleImageUpload(selectedFile, newItem.name);
          toast.success('Image uploaded successfully!');
        } catch (error: any) {
          toast.error('Failed to upload image: ' + error.message);
          setUploadingImage(false);
          return;
        }
      }
      
      const response = await fetch('/api/restaurant-admin/menu-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...newItem,
          image: imagePath,
          restaurantId
        })
      });

      if (response.ok) {
        toast.success('Menu item added successfully');
        setShowAddItem(false);
        setNewItem({
          name: '',
          description: '',
          price: 0,
          category: '',
          isVeg: true,
          isAvailable: true,
          image: '',
          preparationTime: '',
          rating: 0
        });
         setSelectedFile(null);
        setUploadingImage(false);
        loadRestaurantData();
      } else {
        throw new Error('Failed to add menu item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
      setUploadingImage(false);
    }
  };

  const handleUpdateMenuItem = async (itemId: string, updates: any) => {
    try {
      const response = await fetch('/api/restaurant-admin/menu-db', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ itemId: itemId, ...updates })
      });

      if (response.ok) {
        toast.success('Menu item updated successfully');
        loadRestaurantData();
      } else {
        const errorData = await response.json();
        console.error('Update error details:', errorData);
        throw new Error(errorData.error || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(`/api/restaurant-admin/menu-db?itemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Menu item deleted successfully');
        loadRestaurantData();
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {restaurantName} Admin Dashboard
              </h1>
              <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome back, {adminName}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/restaurant-admin/settings')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  router.push('/restaurant-admin/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
                { id: 'menu', label: 'Menu Management', icon: Users }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {orders.length}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTab('orders')}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {orders.filter(o => o.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      ₹{orders.reduce((total, order) => total + order.totalAmount, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Menu Items</p>
                    <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      {menuItems.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Recent Orders
                </h3>
                <button
                  onClick={() => setSelectedTab('orders')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Orders
                </button>
              </div>

              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 px-3 py-1 rounded-lg">
                          <p className="font-bold text-blue-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>#{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.items.length} items • ₹{order.totalAmount}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'accept')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm font-medium"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 text-sm font-medium"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'update_status', 'preparing')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Start Preparing</span>
                        </button>
                      )}
                      
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'update_status', 'ready')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span>Mark Ready</span>
                        </button>
                      )}
                      
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'update_status', 'out_for_delivery')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm font-medium"
                        >
                          <Package className="h-4 w-4" />
                          <span>Out for Delivery</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedTab('orders')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab - Exact Same as Super Admin with Actions */}
        {selectedTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Order Management
                </h2>
                <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Manage and update orders for {restaurantName}
                </p>
              </div>
              <button
                onClick={loadRestaurantData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Orders</span>
              </button>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}/{orders.length}</div>
                <div className="text-sm text-gray-600">Filtered/Total Orders</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredOrders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredOrders.filter(o => o.status === 'preparing').length}
                </div>
                <div className="text-sm text-gray-600">Preparing</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredOrders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by order number, customer name, email, phone, or item..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="lg:w-48">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="lg:w-48">
                  <select
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {/* Clear Filters */}
                {(orderSearchTerm || orderStatusFilter !== 'all' || orderDateFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setOrderSearchTerm('');
                      setOrderStatusFilter('all');
                      setOrderDateFilter('all');
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 font-medium"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table - Exact Same as Super Admin */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🍽️</div>
                  <p>
                    {orders.length === 0 
                      ? `No orders found for ${restaurantName}` 
                      : 'No orders match your current filters'
                    }
                  </p>
                  {orders.length > 0 && filteredOrders.length === 0 && (
                    <button
                      onClick={() => {
                        setOrderSearchTerm('');
                        setOrderStatusFilter('all');
                        setOrderDateFilter('all');
                      }}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Order Details</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Items & Total</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Time</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                #{order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-600">{restaurantName}</p>
                              <p className="text-sm text-gray-600 capitalize">{order.paymentMethod || 'Cash'}</p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {order.customerName || order.customer?.name || 'Customer'}
                              </p>
                              <p className="text-sm text-gray-600">{order.customerEmail || order.customer?.email || 'No email'}</p>
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {order.customerPhone || order.customer?.phone || 'No phone'}
                              </p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-bold text-emerald-600 text-xl" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                ₹{order.totalAmount}
                              </p>
                              <p className="text-sm text-gray-600">{order.items.length} items</p>
                              <div className="text-xs text-gray-500 max-w-xs">
                                {order.items.slice(0, 2).map((item, idx) => (
                                  <span key={idx}>
                                    {item.name} x{item.quantity}
                                    {idx < Math.min(order.items.length, 2) - 1 && ', '}
                                  </span>
                                ))}
                                {order.items.length > 2 && ` ... +${order.items.length - 2} more`}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-gray-600 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {/* Action buttons for restaurant admin only */}
                              {order.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'accept')}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-bold"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'reject')}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors font-bold"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              
                              {order.status === 'accepted' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'update_status', 'preparing')}
                                  className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors font-bold"
                                >
                                  Start Preparing
                                </button>
                              )}
                              
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'update_status', 'ready')}
                                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors font-bold"
                                >
                                  Mark Ready
                                </button>
                              )}
                              
                              {order.status === 'ready' && (
                                <button
                                  onClick={() => updateOrderStatus(order._id, 'update_status', 'out_for_delivery')}
                                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-bold"
                                >
                                  Dispatch
                                </button>
                              )}
                              
                              <button
                                onClick={() => setSelectedOrderId(order._id)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center font-bold shadow-sm"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Management Tab */}
        {selectedTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  {restaurantName} Menu Management
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Manage your restaurant's complete menu with all categories
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={fillAllImages}
                  disabled={isFillingImages}
                  className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-2 ${isFillingImages ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  title="Automatically fill menu item images via Pexels/Pixabay and upload to Cloudinary"
                >
                  {isFillingImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Filling Images...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Fill Images</span>
                    </>
                  )}
                </button>
                {isFillingImages && (
                  <button
                    onClick={() => {
                      cancelFillRef.current = true;
                    }}
                    className="px-3 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700"
                    title="Stop filling images"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={fillCategoryImages}
                  disabled={isFillingCatImages}
                  className={`px-4 py-3 rounded-lg font-medium flex items-center space-x-2 ${isFillingCatImages ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  title="Fill category banner images via Pexels/Pixabay"
                >
                  {isFillingCatImages ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Filling Categories...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      <span>Fill Category Images</span>
                    </>
                  )}
                </button>
                {isFillingCatImages && (
                  <button
                    onClick={() => {
                      cancelCatFillRef.current = true;
                    }}
                    className="px-3 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700"
                    title="Stop filling category images"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => setShowAddItem(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Item</span>
                </button>
              </div>
            </div>

            {fillSummary && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm">
                Filled images summary: {fillSummary.updated} updated, {fillSummary.failed} failed across {fillSummary.batches} batch(es).
              </div>
            )}
            {catSummary && (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg p-3 text-sm">
                Category images summary: {catSummary.updated} updated, {catSummary.failed} failed.
              </div>
            )}

            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Items ({menuItems.length})
                </button>
                {availableCategories.map(category => {
                  const count = menuItems.filter(item => item.category === category).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[720px] sm:min-w-[960px] w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Item Details</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {menuItems
                      .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                      .map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <Image
                              src={item.image || '/images/placeholder-food.jpg'}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-16 w-16 rounded-lg object-cover border-2 border-gray-200"
                              unoptimized
                            />
                            <div className="flex-1">
                              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1" style={{ maxWidth: '300px' }}>
                                {item.description}
                              </div>
                              {item.preparationTime && (
                                <div className="text-xs text-blue-600 mt-1 font-medium">
                                  ⏱️ {item.preparationTime}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xl font-bold text-emerald-600" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            ₹{item.price}
                          </div>
                          {item.rating && (
                            <div className="text-sm text-yellow-600 font-medium">
                              ⭐ {item.rating}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                            item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isVeg ? '🥬 VEG' : '🍖 NON-VEG'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full border-2 ${
                            item.isAvailable 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {item.isAvailable ? '✅ Available' : '❌ Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="overflow-x-auto"
                            style={{ scrollbarWidth: 'thin', overflowX: 'auto', maxWidth: '420px', WebkitOverflowScrolling: 'touch' as any }}
                          >
                            <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowAddItem(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-bold transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  const adminToken = localStorage.getItem('adminToken');
                                  if (!adminToken) {
                                    toast.error('Not authenticated');
                                    return;
                                  }
                                  // pass current image to avoid same pick
                                  const resp = await fetch('/api/restaurant-admin/menu-db/images', {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${adminToken}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ restaurantId, itemId: item._id, onlyMissing: false, max: 1, avoidUrl: item.image, force: true })
                                  });
                                  const data = await resp.json();
                                  if (!resp.ok) throw new Error(data.error || 'Regenerate failed');
                                  toast.success('Image regenerated');
                                  loadRestaurantData();
                                } catch (e: any) {
                                  toast.error(e?.message || 'Failed to regenerate image');
                                }
                              }}
                              className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-sm font-bold transition-colors"
                              title="Regenerate image from Pexels/Pixabay"
                            >
                              Regenerate Image
                            </button>
                            <label className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-bold transition-colors cursor-pointer">
                              Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  try {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const form = new FormData();
                                    form.append('file', file);
                                    form.append('dishName', item.name);
                                    form.append('restaurantId', restaurantId);
                                    form.append('itemId', item._id);
                                    const resp = await fetch('/api/upload-image', { method: 'POST', body: form });
                                    const data = await resp.json();
                                    if (!resp.ok) throw new Error(data.error || 'Upload failed');
                                    toast.success('Image uploaded');
                                    loadRestaurantData();
                                  } catch (err: any) {
                                    toast.error(err?.message || 'Failed to upload');
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                            <button
                              onClick={() => handleUpdateMenuItem(item._id, { isAvailable: !item.isAvailable })}
                              className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                                item.isAvailable 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {item.isAvailable ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item._id)}
                              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-bold transition-colors"
                            >
                              Delete
                            </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {showAddItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddItem(false);
                      setEditingItem(null);
                      setShowCustomCategory(false);
                      setCustomCategory('');
                      setNewItem({
                        name: '',
                        description: '',
                        price: 0,
                        category: '',
                        isVeg: true,
                        isAvailable: true,
                        image: '',
                        preparationTime: '',
                        rating: 0
                      });
                      setSelectedFile(null);
                      setUploadingImage(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                    <input
                      type="text"
                      value={editingItem ? editingItem.name : newItem.name}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({ ...editingItem, name: e.target.value });
                        } else {
                          setNewItem({ ...newItem, name: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Enter item name"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingItem ? editingItem.description : newItem.description}
                      onChange={(e) => {
                        if (editingItem) {
                          setEditingItem({ ...editingItem, description: e.target.value });
                        } else {
                          setNewItem({ ...newItem, description: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Enter item description"
                    />
                  </div>

                  {/* Price and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={editingItem ? editingItem.price || '' : newItem.price || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                          if (editingItem) {
                            setEditingItem({ ...editingItem, price: value });
                          } else {
                            setNewItem({ ...newItem, price: value });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="Enter price (e.g., 280)"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                      {!showCustomCategory ? (
                        <div className="space-y-2">
                          <select
                            value={editingItem ? editingItem.category : newItem.category}
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                setShowCustomCategory(true);
                                return;
                              }
                              if (editingItem) {
                                setEditingItem({ ...editingItem, category: e.target.value });
                              } else {
                                setNewItem({ ...newItem, category: e.target.value });
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          >
                            <option value="">Select Category</option>
                            {availableCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="custom" className="font-bold text-blue-600">+ Add New Category</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Enter new category name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (customCategory.trim()) {
                                  if (editingItem) {
                                    setEditingItem({ ...editingItem, category: customCategory.trim() });
                                  } else {
                                    setNewItem({ ...newItem, category: customCategory.trim() });
                                  }
                                  setShowCustomCategory(false);
                                  setCustomCategory('');
                                }
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium"
                            >
                              Use Category
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomCategory(false);
                                setCustomCategory('');
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image URL and Preparation Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                      <div className="space-y-3">
                        {/* File Upload Option */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Upload from Device</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedFile(file);
                                // Clear URL input when file is selected
                                if (editingItem) {
                                  setEditingItem({ ...editingItem, image: '' });
                                } else {
                                  setNewItem({ ...newItem, image: '' });
                                }
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                          />
                          {selectedFile && (
                            <p className="text-xs text-green-600 mt-1">
                              Selected: {selectedFile.name}
                            </p>
                          )}
                        </div>
                        
                        {/* URL Input Option */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Or Enter Image URL</label>
                          <input
                            type="url"
                            value={editingItem ? editingItem.image || '' : newItem.image}
                            onChange={(e) => {
                              // Clear file selection when URL is entered
                              if (e.target.value && selectedFile) {
                                setSelectedFile(null);
                              }
                              if (editingItem) {
                                setEditingItem({ ...editingItem, image: e.target.value });
                              } else {
                                setNewItem({ ...newItem, image: e.target.value });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Preparation Time</label>
                      <input
                        type="text"
                        value={editingItem ? editingItem.preparationTime || '' : newItem.preparationTime}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, preparationTime: e.target.value });
                          } else {
                            setNewItem({ ...newItem, preparationTime: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="e.g., 15-20 mins"
                      />
                    </div>
                  </div>

                  {/* Rating and Checkboxes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editingItem ? editingItem.rating || 0 : newItem.rating}
                        onChange={(e) => {
                          if (editingItem) {
                            setEditingItem({ ...editingItem, rating: Number(e.target.value) });
                          } else {
                            setNewItem({ ...newItem, rating: Number(e.target.value) });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        placeholder="4.5"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-8">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem ? editingItem.isVeg : newItem.isVeg}
                          onChange={(e) => {
                            if (editingItem) {
                              setEditingItem({ ...editingItem, isVeg: e.target.checked });
                            } else {
                              setNewItem({ ...newItem, isVeg: e.target.checked });
                            }
                          }}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-bold text-gray-700">Vegetarian</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-8">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem ? editingItem.isAvailable : newItem.isAvailable}
                          onChange={(e) => {
                            if (editingItem) {
                              setEditingItem({ ...editingItem, isAvailable: e.target.checked });
                            } else {
                              setNewItem({ ...newItem, isAvailable: e.target.checked });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-bold text-gray-700">Available</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      onClick={() => {
                        setShowAddItem(false);
                        setEditingItem(null);
                        setShowCustomCategory(false);
                        setCustomCategory('');
                        setNewItem({
                          name: '',
                          description: '',
                          price: 0,
                          category: '',
                          isVeg: true,
                          isAvailable: true,
                          image: '',
                          preparationTime: '',
                          rating: 0
                        });
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (editingItem) {
                          handleUpdateMenuItem(editingItem._id, editingItem);
                          setShowAddItem(false);
                          setEditingItem(null);
                        } else {
                          handleAddMenuItem();
                        }
                      }}
                      disabled={uploadingImage}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Uploading Image...
                        </span>
                      ) : (
                        editingItem ? 'Update Item' : 'Add Item'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrderId && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        Order Details
                      </h2>
                      <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Complete order information and management
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {(() => {
                  const selectedOrder = orders.find(order => order._id === selectedOrderId);
                  if (!selectedOrder) return <div className="text-center py-8 text-gray-500">Order not found</div>;
                  
                  // Debug logging
                  console.log('🔍 Selected Order Debug:', {
                    orderId: selectedOrder._id,
                    orderNumber: selectedOrder.orderNumber,
                    itemsCount: selectedOrder.items?.length,
                    items: selectedOrder.items,
                    totalAmount: selectedOrder.totalAmount,
                    customer: selectedOrder.customer
                  });
                  
                  // Debug each item structure
                  if (selectedOrder.items?.length > 0) {
                    selectedOrder.items.forEach((item, index) => {
                      console.log(`🍽️ Item ${index + 1}:`, {
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        menuItemId: item.menuItemId,
                        description: item.description,
                        fullItem: item
                      });
                    });
                  } else {
                    console.log('❌ No items found in order!');
                  }

                  return (
                    <div className="space-y-8">
                      {/* Order Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-blue-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              Order Information
                            </h3>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Order Number:</span>
                              <span className="font-bold text-blue-900 text-lg">#{selectedOrder.orderNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Status:</span>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Restaurant:</span>
                              <span className="font-bold text-gray-900">{restaurantName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Payment:</span>
                              <span className="font-bold text-emerald-600 uppercase">{selectedOrder.paymentMethod || 'Cash'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Order Time:</span>
                              <span className="font-bold text-gray-900">
                                {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-green-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                              Customer Information
                            </h3>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Name:</span>
                              <span className="font-bold text-green-900">{selectedOrder.customer?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Email:</span>
                              <span className="font-bold text-gray-900 text-sm">{selectedOrder.customer?.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700">Phone:</span>
                              <span className="font-bold text-gray-900">{selectedOrder.customer?.phone || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Address:</span>
                              <div className="mt-2 p-3 bg-white rounded-lg border border-green-200">
                                {(selectedOrder as any).deliveryAddress ? (
                                  <div className="text-sm font-medium text-gray-800">
                                    <p>{(selectedOrder as any).deliveryAddress.street}</p>
                                    <p>{(selectedOrder as any).deliveryAddress.city}, {(selectedOrder as any).deliveryAddress.state} {(selectedOrder as any).deliveryAddress.pincode}</p>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 italic">No address provided</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                            Order Items
                          </h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                              {selectedOrder.items?.length || 0} items
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
                              Total: ₹{selectedOrder.totalAmount}
                            </span>
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedOrder.items?.length > 0 ? selectedOrder.items.map((item, index) => {
                                // Enhanced data validation with detailed logging
                                const itemName = item.name || item.menuItemId || `Item ${index + 1}`;
                                const itemPrice = typeof item.price === 'number' ? item.price : (parseFloat(item.price) || 0);
                                const itemQuantity = typeof item.quantity === 'number' ? item.quantity : (parseInt(item.quantity) || 1);
                                const itemTotal = itemPrice * itemQuantity;
                                
                                // Log problematic items
                                if (!item.name || !item.price) {
                                  console.warn(`⚠️ Item ${index + 1} missing data:`, {
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                    menuItemId: item.menuItemId,
                                    fullItem: item
                                  });
                                }
                                
                                return (
                                  <tr key={item.menuItemId || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <div className="flex items-start space-x-3">
                                        {item.image && (
                                          <img 
                                            src={item.image} 
                                            alt={itemName}
                                            className="w-12 h-12 rounded-lg object-cover border"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = '/images/placeholder-food.jpg';
                                            }}
                                          />
                                        )}
                                        <div className="flex-1">
                                          <div className="text-sm font-bold text-gray-900">{itemName}</div>
                                          {item.description && (
                                            <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                          )}
                                          {item.category && (
                                            <div className="text-xs text-blue-600 font-medium mt-1">
                                              📂 {item.category}
                                            </div>
                                          )}
                                          {(item as any).customizations?.length > 0 && (
                                            <div className="text-xs text-purple-600 mt-1">
                                              🎛️ Customizations: {(item as any).customizations.join(', ')}
                                            </div>
                                          )}
                                          {item.isVeg !== undefined && (
                                            <div className={`inline-flex px-2 py-1 text-xs font-bold rounded-full mt-2 ${
                                              item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                              {item.isVeg ? '🥬 VEG' : '🍖 NON-VEG'}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-bold text-emerald-600">₹{itemPrice}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-full text-center">
                                        {itemQuantity}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-lg font-bold text-emerald-600">₹{itemTotal}</div>
                                    </td>
                                  </tr>
                                );
                              }) : (
                                <tr>
                                  <td colSpan={4} className="px-6 py-8 text-center">
                                    <div className="text-gray-500">
                                      <div className="text-4xl mb-4">🍽️</div>
                                      <p className="text-lg font-medium">No items found in this order</p>
                                      <p className="text-sm mt-2">This might indicate a data issue. Please contact support.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                          <span>Total: ₹{selectedOrder.totalAmount || 0}</span>
                          <span className="text-2xl">₹{selectedOrder.totalAmount || 0}</span>
                        </div>
                        {selectedOrder.subtotal && (
                          <div className="text-sm text-gray-600 mt-2">
                            <p>Subtotal: ₹{selectedOrder.subtotal}</p>
                            {selectedOrder.deliveryFee && <p>Delivery Fee: ₹{selectedOrder.deliveryFee}</p>}
                            {selectedOrder.taxes && <p>Taxes: ₹{selectedOrder.taxes}</p>}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t">
                        {selectedOrder.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                updateOrderStatus(selectedOrder._id, 'accept');
                                setSelectedOrderId(null);
                              }}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 font-medium"
                            >
                              <CheckCircle className="h-5 w-5" />
                              <span>Accept Order</span>
                            </button>
                            <button
                              onClick={() => {
                                updateOrderStatus(selectedOrder._id, 'reject');
                                setSelectedOrderId(null);
                              }}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 font-medium"
                            >
                              <XCircle className="h-5 w-5" />
                              <span>Reject Order</span>
                            </button>
                          </>
                        )}

                        {selectedOrder.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(selectedOrder._id, 'update_status', 'preparing');
                              setSelectedOrderId(null);
                            }}
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2 font-medium"
                          >
                            <Clock className="h-5 w-5" />
                            <span>Start Preparing</span>
                          </button>
                        )}

                        {selectedOrder.status === 'preparing' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(selectedOrder._id, 'update_status', 'ready');
                              setSelectedOrderId(null);
                            }}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 font-medium"
                          >
                            <AlertCircle className="h-5 w-5" />
                            <span>Mark Ready</span>
                          </button>
                        )}

                        {selectedOrder.status === 'ready' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(selectedOrder._id, 'update_status', 'out_for_delivery');
                              setSelectedOrderId(null);
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium"
                          >
                            <Package className="h-5 w-5" />
                            <span>Dispatch for Delivery</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
