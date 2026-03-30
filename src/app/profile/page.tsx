'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Star,
  CheckCircle,
  XCircle,
  Loader,
  ChefHat,
  Eye,
  EyeOff,
  MessageCircle,
  Lock,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import { checkAuthState, redirectToLogin } from '@/lib/utils/auth';

interface ChefBooking {
  _id: string;
  status: string;
  bookingDetails: {
    eventType: string;
    eventDate: string;
    eventTime: string;
    duration: number;
    guestCount: number;
    cuisine: string[];
    specialRequests?: string;
  };
  chef?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
  } | null;
  pricing: {
    totalAmount: number;
    currency: string;
  };
  timeline: {
    bookedAt: string;
    respondedAt?: string;
  };
  location?: {
    address: string;
    city: string;
    state: string;
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  joinedAt?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [chefBookings, setChefBookings] = useState<ChefBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadChefBookings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const authState = checkAuthState();
      
      if (!authState.isAuthenticated) {
        console.log('Profile: No authentication found', authState);
        toast.error('Please login to view your profile');
        redirectToLogin();
        return;
      }

      if (authState.user) {
        const profileData: UserProfile = {
          name: authState.user.name,
          email: authState.user.email,
          phone: authState.user.phone,
          joinedAt: authState.user.joinedAt || (authState.user as any)?.createdAt,
          createdAt: (authState.user as any)?.createdAt,
        };
        setUser(profileData);
      }

      const token = authState.token;
      if (token) {
        const res = await fetch('/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          if (u) {
            const merged: UserProfile = {
              name: u.name,
              email: u.email,
              phone: u.phone,
              joinedAt: u.joinedAt || u.createdAt,
              createdAt: u.createdAt,
            };
            setUser(merged);
            try {
              const prev = authState.user ? { ...authState.user } : {};
              const stored = {
                ...prev,
                ...u,
                id: u.id ?? prev.id ?? (prev as any)._id,
                _id: u.id ?? (prev as any)._id,
              };
              const serial = JSON.stringify(stored);
              if (localStorage.getItem('user')) localStorage.setItem('user', serial);
              if (sessionStorage.getItem('user')) sessionStorage.setItem('user', serial);
            } catch {
              /* ignore storage errors */
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadChefBookings = async () => {
    try {
      setBookingsLoading(true);
      const authState = checkAuthState();
      
      if (!authState.isAuthenticated) {
        console.log('Profile: No authentication found for bookings', authState);
        return;
      }

      const response = await fetch('/api/chef-services/bookings', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChefBookings(data.bookings || []);
      } else {
        console.error('Failed to load chef bookings');
        setChefBookings([]);
      }
    } catch (error) {
      console.error('Error loading chef bookings:', error);
      setChefBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.current === pwForm.newPw) {
      toast.error('New password must be different from current password');
      return;
    }

    try {
      setPwLoading(true);
      const authState = checkAuthState();
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully! 🔐');
        setPwForm({ current: '', newPw: '', confirm: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <Star className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#232323]">
        {/* Header */}
        <div className="bg-[#232323] shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <div className="bg-gray-800 rounded-full p-3 mr-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  My Profile
                </h1>
                <p className="text-gray-300 text-sm mt-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Manage your account and bookings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Info Card */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-[#232323]" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  {user?.name || 'User'}
                </h2>
                <p className="text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  {user?.email}
                </p>
                <p className="text-gray-300 mt-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  <span className="text-gray-500 text-sm">Mobile </span>
                  {user?.phone || 'Not added yet'}
                </p>
                <p className="text-sm text-gray-400 mt-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                  Member since {user?.joinedAt || user?.createdAt ? new Date((user?.joinedAt || user?.createdAt) as string).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="border-b border-gray-700">
              <nav className="flex space-x-8 px-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'bookings'
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                >
                  <div className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5" />
                    <span>Chef Bookings ({chefBookings.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                    activeTab === 'security'
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  style={{ fontFamily: "'Satoshi', sans-serif" }}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Security - Change Password */}
              {activeTab === 'security' && (
                <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-yellow-400/10 rounded-full flex items-center justify-center">
                      <Lock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Change Password
                      </h3>
                      <p className="text-sm text-gray-400" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Keep your account secure by using a strong, unique password.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={pwForm.current}
                          onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12"
                          placeholder="Enter your current password"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={pwForm.newPw}
                          onChange={(e) => setPwForm(f => ({ ...f, newPw: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12"
                          placeholder="At least 8 characters"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {/* Password strength indicator */}
                      {pwForm.newPw.length > 0 && (
                        <div className="mt-2">
                          <div className="flex gap-1 mb-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                pwForm.newPw.length >= i * 3
                                  ? i <= 1 ? 'bg-red-500' : i === 2 ? 'bg-yellow-500' : i === 3 ? 'bg-blue-500' : 'bg-green-500'
                                  : 'bg-gray-600'
                              }`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400">
                            {pwForm.newPw.length < 4 ? 'Too short' : pwForm.newPw.length < 7 ? 'Weak' : pwForm.newPw.length < 10 ? 'Fair' : pwForm.newPw.length < 13 ? 'Strong' : 'Very strong'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-1.5" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={pwForm.confirm}
                          onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent pr-12 ${
                            pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-red-500' : 'border-gray-600'
                          }`}
                          placeholder="Re-enter new password"
                          style={{ fontFamily: "'Satoshi', sans-serif" }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                        <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                      )}
                      {pwForm.confirm && pwForm.newPw === pwForm.confirm && pwForm.confirm.length > 0 && (
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                    </div>

                    <button
                      onClick={changePassword}
                      disabled={pwLoading || !pwForm.current || !pwForm.newPw || !pwForm.confirm || pwForm.newPw !== pwForm.confirm}
                      className="w-full mt-2 bg-yellow-400 text-[#232323] py-3 px-6 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Satoshi', sans-serif" }}
                    >
                      {pwLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Changing Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <p className="text-xs text-gray-400 font-semibold mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>Password tips:</p>
                    <ul className="text-xs text-gray-400 space-y-1" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      <li>• Use at least 8 characters</li>
                      <li>• Mix uppercase, lowercase, numbers and symbols</li>
                      <li>• Avoid using personal information</li>
                      <li>• Don't reuse passwords from other sites</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                      Your Chef Booking Requests
                    </h3>
                    <button
                      onClick={() => window.location.href = '/chef-services'}
                      className="bg-yellow-400 text-[#232323] px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-lg"
                      style={{ fontFamily: "'Satoshi', sans-serif" }}
                    >
                      Book Another Chef
                    </button>
                  </div>

                  {bookingsLoading ? (
                    <div className="text-center py-12">
                      <Loader className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-300">Loading your bookings...</p>
                    </div>
                  ) : chefBookings.length > 0 ? (
                    <div className="space-y-5">
                      {chefBookings.map((booking) => (
                        <div key={booking._id} className="bg-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                                    booking.status === 'confirmed' ? 'bg-green-500 text-white' :
                                    booking.status === 'completed' ? 'bg-blue-500 text-white' :
                                    booking.status === 'cancelled' ? 'bg-red-500 text-white' :
                                    'bg-yellow-400 text-[#232323]'
                                  }`}>
                                    {getStatusIcon(booking.status)}
                                    <span className="ml-2 capitalize">{booking.status}</span>
                                  </span>
                                  <span className="text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    Booked on {new Date(booking.timeline.bookedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xl font-bold text-white mb-3 capitalize" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    {booking.bookingDetails.eventType.replace('_', ' ')} Event
                                  </h4>
                                  <div className="space-y-2 text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-4 w-4 text-yellow-400" />
                                      <span>{new Date(booking.bookingDetails.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-4 w-4 text-yellow-400" />
                                      <span>{booking.bookingDetails.eventTime} • {booking.bookingDetails.duration} hours</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-yellow-400" />
                                      <span>{booking.bookingDetails.guestCount} guests</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <ChefHat className="h-4 w-4 text-yellow-400" />
                                      <span>{booking.bookingDetails.cuisine.join(', ')}</span>
                                    </div>
                                    {booking.location && (
                                      <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-yellow-400" />
                                        <span>{booking.location.city}, {booking.location.state}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-semibold text-white mb-3" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    Chef Details
                                  </h5>
                                  {booking.chef ? (
                                    <div className="space-y-2 text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                      <div className="flex items-center space-x-2">
                                        <ChefHat className="h-4 w-4 text-yellow-400" />
                                        <span className="font-medium">{booking.chef.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Star className="h-4 w-4 text-yellow-400" />
                                        <span>{(booking.chef.rating ?? 5).toFixed?.(1) || Number(booking.chef.rating ?? 5).toFixed(1)} rating</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-yellow-400 font-bold text-lg">₹</span>
                                        <span className="font-bold text-lg text-yellow-400">
                                          {booking.pricing.totalAmount.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2 text-sm text-gray-300" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                      <p className="font-medium">Awaiting chef acceptance</p>
                                      <p>Your request is visible to available chefs. The first to accept will be assigned.</p>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-yellow-400 font-bold">₹</span>
                                        <span className="font-bold text-yellow-400">Estimated total: ₹{booking.pricing.totalAmount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Status Messages */}
                              <div className="mt-4 p-4 rounded-lg bg-gray-800">
                                {booking.status === 'pending' && (
                                  <p className="text-sm text-yellow-400 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    ⏳ Waiting for chef confirmation. You'll be notified once a chef accepts your request.
                                  </p>
                                )}
                                {booking.status === 'confirmed' && (
                                  <p className="text-sm text-green-400 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    ✅ Your booking is confirmed! The chef will contact you closer to the event date with final details.
                                    {booking.timeline.respondedAt && (
                                      <span className="block text-xs text-gray-400 mt-1">
                                        Confirmed on {new Date(booking.timeline.respondedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </p>
                                )}
                                {booking.status === 'cancelled' && (
                                  <p className="text-sm text-red-400 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    ❌ This booking has been cancelled.
                                    {booking.timeline.respondedAt && (
                                      <span className="block text-xs text-gray-400 mt-1">
                                        Cancelled on {new Date(booking.timeline.respondedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                  </p>
                                )}
                                {booking.status === 'completed' && (
                                  <p className="text-sm text-green-400 font-medium" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                                    🎉 Event completed! We hope you had a wonderful experience.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ChefHat className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        No Chef Bookings Yet
                      </h3>
                      <p className="text-gray-300 mb-6 max-w-md mx-auto" style={{ fontFamily: "'Satoshi', sans-serif" }}>
                        You haven't made any chef booking requests yet. Start by browsing our amazing chefs and book your first culinary experience!
                      </p>
                      <button
                        onClick={() => window.location.href = '/chef-services'}
                        className="bg-yellow-400 text-[#232323] px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        style={{ fontFamily: "'Satoshi', sans-serif" }}
                      >
                        Browse Chefs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}