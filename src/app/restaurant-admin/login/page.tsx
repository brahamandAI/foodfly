'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChefHat, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LoginCredentials {
  email: string;
  password: string;
}

// Restaurant admin authentication now handled via API

export default function RestaurantAdminLogin() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/restaurant-admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success && data.admin) {
        // Clear any existing customer session to avoid cross-login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('guest');

        // Store admin authentication data only
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('userType', 'restaurant_admin');
        localStorage.setItem('restaurantId', data.admin.restaurantId);
        localStorage.setItem('restaurantName', data.admin.restaurantName);
        localStorage.setItem('adminName', data.admin.adminName);
        
        // Store complete admin data for restaurant dashboard
        localStorage.setItem('restaurantAdminData', JSON.stringify({
          id: data.admin.id,
          restaurantId: data.admin.restaurantId,
          restaurantName: data.admin.restaurantName,
          adminName: data.admin.adminName,
          email: data.admin.email,
          username: data.admin.username,
          role: data.admin.role
        }));
        // Do NOT set generic customer 'user' for admin login

        toast.success(`Welcome back, ${data.admin.adminName}!`);
        router.push('/restaurant-admin');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Restaurant Admin</h2>
          <p className="mt-2 text-gray-600 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>Sign in to manage your restaurant</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <strong>Panache:</strong> marco@panache.com / admin123
              </div>
              <div>
                <strong>Cafe After Hours:</strong> sarah@cafeafterhours.com / admin123
              </div>
              <div>
                <strong>Symposium:</strong> andre@symposium.com / admin123
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/admin/login"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Super Admin Login
            </Link>
            <div className="text-sm text-gray-500">
              Need help? Contact support
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Restaurant Admin Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
              Manage incoming orders in real-time
            </li>
            <li className="flex items-center">
              <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
              Update order status (Accept/Reject/Preparing)
            </li>
            <li className="flex items-center">
              <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
              Manage menu items and pricing
            </li>
            <li className="flex items-center">
              <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
              View restaurant analytics and performance
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
