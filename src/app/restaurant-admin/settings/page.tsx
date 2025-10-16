'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  LogOut, 
  ArrowLeft,
  Home,
  Save,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RestaurantAdmin {
  id: string;
  restaurantId: string;
  restaurantName: string;
  adminName: string;
  email: string;
  role: string;
}

interface RestaurantSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  openingHours: string;
  deliveryRadius: number;
  minOrderAmount: number;
  notifications: {
    newOrders: boolean;
    orderUpdates: boolean;
    emailNotifications: boolean;
  };
}

export default function RestaurantAdminSettings() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<RestaurantAdmin | null>(null);
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingHours: '9:00 AM - 11:00 PM',
    deliveryRadius: 5,
    minOrderAmount: 200,
    notifications: {
      newOrders: true,
      orderUpdates: true,
      emailNotifications: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurant-info');
  const [credentialsForm, setCredentialsForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [credentialsErrors, setCredentialsErrors] = useState<{[key: string]: string}>({});
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    // Check if user is authenticated as restaurant admin
    const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (!adminToken || userType !== 'restaurant_admin') {
      router.push('/restaurant-admin/login');
      return;
    }

    loadAdminData();
  }, [isMounted]);

  const loadAdminData = async () => {
    try {
      const storedAdminData = localStorage.getItem('restaurantAdminData');
      if (storedAdminData) {
        const adminInfo = JSON.parse(storedAdminData);
        setAdminData(adminInfo);
        
        // Load restaurant settings from database
        await loadRestaurantSettings();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRestaurantSettings = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/restaurant-admin/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings({
            name: data.settings.restaurantName,
            phone: data.settings.phone,
            email: data.settings.email,
            address: data.settings.address,
            openingHours: data.settings.openingHours,
            deliveryRadius: data.settings.deliveryRadius,
            minOrderAmount: data.settings.minOrderAmount,
            notifications: data.settings.notifications
          });
        }
      } else {
        console.error('Failed to load settings from database');
        // Fallback to localStorage data
        const storedAdminData = localStorage.getItem('restaurantAdminData');
        if (storedAdminData) {
          const adminInfo = JSON.parse(storedAdminData);
          setSettings(prev => ({
            ...prev,
            name: adminInfo.restaurantName,
            email: adminInfo.email
          }));
        }
      }
    } catch (error) {
      console.error('Error loading restaurant settings:', error);
      // Fallback to localStorage data
      const storedAdminData = localStorage.getItem('restaurantAdminData');
      if (storedAdminData) {
        const adminInfo = JSON.parse(storedAdminData);
        setSettings(prev => ({
          ...prev,
          name: adminInfo.restaurantName,
          email: adminInfo.email
        }));
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/restaurant-admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantName: settings.name,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          openingHours: settings.openingHours,
          deliveryRadius: settings.deliveryRadius,
          minOrderAmount: settings.minOrderAmount,
          notifications: settings.notifications
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update localStorage with new restaurant name if changed
        const storedAdminData = localStorage.getItem('restaurantAdminData');
        if (storedAdminData) {
          const adminInfo = JSON.parse(storedAdminData);
          if (adminInfo.restaurantName !== settings.name) {
            adminInfo.restaurantName = settings.name;
            localStorage.setItem('restaurantAdminData', JSON.stringify(adminInfo));
            localStorage.setItem('restaurantName', settings.name);
            setAdminData(adminInfo);
          }
        }

        toast.success('Settings saved successfully and will persist across sessions!');
      } else {
        throw new Error(data.error || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('restaurantName');
    localStorage.removeItem('adminName');
    localStorage.removeItem('restaurantAdminData');
    localStorage.removeItem('user');
    
    toast.success('Logged out successfully');
    router.push('/restaurant-admin/login');
  };

  const validateCredentialsForm = () => {
    const errors: {[key: string]: string} = {};

    if (!credentialsForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    // Username is optional; validate only if provided
    if (credentialsForm.newUsername && credentialsForm.newUsername.length < 3) {
      errors.newUsername = 'Username must be at least 3 characters';
    }

    // Password is optional; validate only if provided
    if (credentialsForm.newPassword && credentialsForm.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (credentialsForm.newPassword && !credentialsForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (credentialsForm.newPassword && credentialsForm.newPassword !== credentialsForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!credentialsForm.newUsername && !credentialsForm.newPassword) {
      errors.submit = 'Enter a new username and/or password.';
    }

    setCredentialsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCredentialsForm()) {
      return;
    }

    setIsUpdatingCredentials(true);
    setCredentialsErrors({});

    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await fetch('/api/restaurant-admin/update-credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          restaurantId: adminData?.restaurantId,
          currentPassword: credentialsForm.currentPassword,
          newUsername: credentialsForm.newUsername || undefined,
          newPassword: credentialsForm.newPassword || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update credentials');
      }

      // Persist updated admin from DB-of-record when available
      if (data.admin) {
        const updated = {
          id: data.admin.id,
          restaurantId: data.admin.restaurantId,
          restaurantName: data.admin.restaurantName,
          adminName: data.admin.adminName,
          email: data.admin.email,
          role: data.admin.role
        } as RestaurantAdmin;
        localStorage.setItem('restaurantAdminData', JSON.stringify(updated));
        localStorage.setItem('restaurantId', data.admin.restaurantId);
        localStorage.setItem('restaurantName', data.admin.restaurantName);
        localStorage.setItem('adminName', data.admin.adminName);
        setAdminData(updated);
      } else if (adminData && credentialsForm.newUsername) {
        // Fallback: update local cache if API didn't send full admin
        const updatedAdminData = {
          ...adminData,
          adminName: credentialsForm.newUsername
        };
        localStorage.setItem('restaurantAdminData', JSON.stringify(updatedAdminData));
        localStorage.setItem('adminName', credentialsForm.newUsername);
        setAdminData(updatedAdminData);
      }

      // Clear form
      setCredentialsForm({
        currentPassword: '',
        newUsername: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Credentials updated successfully! Please login again.');
      
      // Logout user to force re-login with new credentials
      setTimeout(() => {
        handleLogout();
      }, 2000);

    } catch (error: any) {
      console.error('Error updating credentials:', error);
      setCredentialsErrors({ submit: error.message });
      toast.error(error.message || 'Failed to update credentials');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/restaurant-admin"
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Restaurant Settings
                </h1>
                <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {adminData?.restaurantName} Configuration
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/restaurant-admin"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Settings Menu
              </h3>
              <nav className="space-y-2">
                <div 
                  onClick={() => setActiveTab('restaurant-info')}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    activeTab === 'restaurant-info' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className={`h-5 w-5 ${activeTab === 'restaurant-info' ? 'text-blue-600' : ''}`} />
                  <span className={`font-medium ${activeTab === 'restaurant-info' ? 'text-blue-700' : ''}`}>
                    Restaurant Info
                  </span>
                </div>
                <div 
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className={`h-5 w-5 ${activeTab === 'notifications' ? 'text-blue-600' : ''}`} />
                  <span className={`font-medium ${activeTab === 'notifications' ? 'text-blue-700' : ''}`}>
                    Notifications
                  </span>
                </div>
                <div 
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                    activeTab === 'security' 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Lock className={`h-5 w-5 ${activeTab === 'security' ? 'text-blue-600' : ''}`} />
                  <span className={`font-medium ${activeTab === 'security' ? 'text-blue-700' : ''}`}>
                    Security
                  </span>
                </div>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-8">
              
              {/* Restaurant Info Tab */}
              {activeTab === 'restaurant-info' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      Restaurant Information
                    </h2>
                    <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Manage your restaurant's basic information and preferences
                    </p>
                  </div>

              <div className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Restaurant Address
                  </label>
                  <textarea
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Enter complete restaurant address"
                  />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={settings.openingHours}
                    onChange={(e) => setSettings(prev => ({ ...prev, openingHours: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., 9:00 AM - 11:00 PM"
                  />
                </div>

                {/* Delivery Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Radius (km)
                    </label>
                    <input
                      type="number"
                      value={settings.deliveryRadius}
                      onChange={(e) => setSettings(prev => ({ ...prev, deliveryRadius: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      min="1"
                      max="20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={settings.minOrderAmount}
                      onChange={(e) => setSettings(prev => ({ ...prev, minOrderAmount: Number(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      min="0"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.newOrders}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, newOrders: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700">New order notifications</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.orderUpdates}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, orderUpdates: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700">Order status update notifications</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, emailNotifications: e.target.checked }
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-gray-700">Email notifications</span>
                    </label>
                  </div>
                </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSettings ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Settings</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                </>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      Security Settings
                    </h2>
                    <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Change your login credentials and manage account security
                    </p>
                  </div>

                  <form onSubmit={handleUpdateCredentials} className="space-y-6">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Lock className="inline h-4 w-4 mr-1" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={credentialsForm.currentPassword}
                        onChange={(e) => {
                          setCredentialsForm(prev => ({ ...prev, currentPassword: e.target.value }));
                          if (credentialsErrors.currentPassword) {
                            setCredentialsErrors(prev => ({ ...prev, currentPassword: '' }));
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          credentialsErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your current password"
                      />
                      {credentialsErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{credentialsErrors.currentPassword}</p>
                      )}
                    </div>

                    {/* New Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1" />
                        New Username
                      </label>
                      <input
                        type="text"
                        value={credentialsForm.newUsername}
                        onChange={(e) => {
                          setCredentialsForm(prev => ({ ...prev, newUsername: e.target.value }));
                          if (credentialsErrors.newUsername) {
                            setCredentialsErrors(prev => ({ ...prev, newUsername: '' }));
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                          credentialsErrors.newUsername ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new username"
                      />
                      {credentialsErrors.newUsername && (
                        <p className="mt-1 text-sm text-red-600">{credentialsErrors.newUsername}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">Current username: {adminData?.adminName}</p>
                    </div>

                    {/* New Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Lock className="inline h-4 w-4 mr-1" />
                          New Password
                        </label>
                        <input
                          type="password"
                          value={credentialsForm.newPassword}
                          onChange={(e) => {
                            setCredentialsForm(prev => ({ ...prev, newPassword: e.target.value }));
                            if (credentialsErrors.newPassword) {
                              setCredentialsErrors(prev => ({ ...prev, newPassword: '' }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            credentialsErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter new password"
                        />
                        {credentialsErrors.newPassword && (
                          <p className="mt-1 text-sm text-red-600">{credentialsErrors.newPassword}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Lock className="inline h-4 w-4 mr-1" />
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={credentialsForm.confirmPassword}
                          onChange={(e) => {
                            setCredentialsForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (credentialsErrors.confirmPassword) {
                              setCredentialsErrors(prev => ({ ...prev, confirmPassword: '' }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                            credentialsErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Confirm new password"
                        />
                        {credentialsErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">{credentialsErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Error */}
                    {credentialsErrors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{credentialsErrors.submit}</p>
                      </div>
                    )}

                    {/* Update Button */}
                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={isUpdatingCredentials}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingCredentials ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Update Credentials</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                      Notification Settings
                    </h2>
                    <p className="text-gray-600" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Manage your notification preferences
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                        Notification Preferences
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.newOrders}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, newOrders: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700">New order notifications</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.orderUpdates}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, orderUpdates: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700">Order status update notifications</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, emailNotifications: e.target.checked }
                            }))}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700">Email notifications</span>
                        </label>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-6">
                      <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingSettings ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            <span>Save Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
