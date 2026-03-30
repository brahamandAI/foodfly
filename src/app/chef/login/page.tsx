'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ChefLoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/chef-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chef && data.chef.role === 'chef' && data.userType === 'chef') {
          localStorage.setItem('chef-token', data.token);
          localStorage.setItem('chef-user', JSON.stringify(data.chef));
          localStorage.setItem('chef-isLoggedIn', 'true');
          localStorage.setItem('chef-userType', 'chef');
          localStorage.setItem('chef-sessionId', data.sessionId);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userType');
          window.dispatchEvent(new StorageEvent('storage', { key: 'chef-isLoggedIn', newValue: 'true', oldValue: null }));
          toast.success('Chef login successful!');
          window.location.href = data.redirectTo || '/chef/dashboard';
        } else {
          throw new Error('Invalid chef authentication data');
        }
      } else {
        const error = await response.json();
        if (error.userRole && error.redirectTo) {
          const shouldRedirect = window.confirm(`${error.error} Go to ${error.userRole} login instead?`);
          if (shouldRedirect) { window.location.href = error.redirectTo; return; }
        }
        toast.error(error.error || 'Chef login failed');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Back link */}
        <div className="mb-6">
          <Link href="/chef-services" className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Chef Services
          </Link>
        </div>

        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-16 h-16 mx-auto">
                <Image src="/images/logo.png" alt="FoodFly" fill className="object-contain" priority />
              </div>
            </Link>
            <div className="w-14 h-14 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-yellow-400/30">
              <ChefHat className="h-7 w-7 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Chef Login</h1>
            <p className="text-gray-400 text-sm">FoodFly Chef Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                placeholder="chef@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-[#232323] font-bold py-3 rounded-lg hover:bg-yellow-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              <ChefHat className="h-5 w-5" />
              {loading ? 'Signing In...' : 'Sign In as Chef'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have a chef account?{' '}
              <Link href="/chef/register" className="text-yellow-400 hover:text-yellow-300 font-semibold">
                Register here
              </Link>
            </p>
            <Link href="/login" className="block text-xs text-gray-500 hover:text-gray-400 transition-colors">
              Looking for customer login?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
