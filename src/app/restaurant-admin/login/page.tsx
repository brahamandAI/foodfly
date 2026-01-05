'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RestaurantAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<any[]>([]);

  useEffect(() => {
    // Load credentials (always try, API will handle dev check)
    fetch('/api/restaurant-admin/credentials')
      .then(res => res.json())
      .then(data => {
        if (data.credentials) {
          setCredentials(data.credentials);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/restaurant-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store authentication data
      localStorage.setItem('restaurantAdminToken', data.token);
      localStorage.setItem('restaurantAdmin', JSON.stringify(data.restaurantAdmin));
      localStorage.setItem('restaurant', JSON.stringify(data.restaurant));

      toast.success('Login successful!');
      router.push('/restaurant-admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#232323] flex items-center justify-center p-4" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <div className="relative w-20 h-20 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="FoodFly"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">FoodFly</h1>
            <p className="text-gray-400 text-sm">Restaurant Admin Portal</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="admin@restaurant.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 text-[#232323] font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-4">
              Contact support if you need access
            </p>
            
            {/* Show credentials if available */}
            {credentials.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center justify-center space-x-1 mx-auto"
                >
                  <Info className="h-3 w-3" />
                  <span>{showCredentials ? 'Hide' : 'Show'} Test Credentials</span>
                </button>
                
                {showCredentials && (
                  <div className="mt-4 bg-gray-800 rounded-lg p-4 border border-gray-700 text-left">
                    <p className="text-xs font-bold text-yellow-400 mb-3">Test Credentials:</p>
                    <div className="space-y-3">
                      {credentials.map((cred, idx) => (
                        <div key={idx} className="text-xs text-gray-300 space-y-1">
                          <p className="font-semibold text-white">{cred.restaurant}</p>
                          <p>Email: <span className="text-yellow-400">{cred.email}</span></p>
                          <p>Password: <span className="text-yellow-400">{cred.password}</span></p>
                          {idx < credentials.length - 1 && <div className="border-t border-gray-700 mt-2 pt-2"></div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

