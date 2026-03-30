'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, UserIcon, X, User, ArrowLeft, KeyRound, Phone, Eye, EyeOff } from 'lucide-react';
import { isValidIndianMobile } from '@/lib/phone';
import { toast } from 'react-hot-toast';
import { authApi, enhancedCartService, ensureAuthInCookies } from '@/lib/api';
import Image from 'next/image';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { backupAuthentication, restoreAuthentication } from '@/lib/api';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const mode = searchParams.get('mode'); // Check for signup mode
  const role = searchParams.get('role'); // Check for delivery role
  
  const [isLogin, setIsLogin] = useState(mode !== 'signup'); // Default to signup if mode=signup
  const [isLoading, setIsLoading] = useState(false);
  const [showFallbackLogin, setShowFallbackLogin] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [authStep, setAuthStep] = useState<'main' | 'forgot' | 'reset'>('main');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPasswordReset, setNewPasswordReset] = useState('');
  const [confirmNewPasswordReset, setConfirmNewPasswordReset] = useState('');
  const [signupEmailOtp, setSignupEmailOtp] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [showResetConfirmPwd, setShowResetConfirmPwd] = useState(false);

  useEffect(() => {
    setIsLogin(mode !== 'signup');
  }, [mode]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validation
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (role !== 'delivery') {
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Mobile number is required';
        } else if (!isValidIndianMobile(formData.phone)) {
          newErrors.phone = 'Enter a valid 10-digit Indian mobile (e.g. 9876543210)';
        }
        if (!signupOtpSent) {
          newErrors.signupOtp = 'Send a verification code to your email first';
        } else if (!signupEmailOtp || signupEmailOtp.length !== 6) {
          newErrors.signupOtp = 'Enter the 6-digit code from your email';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendSignupOtp = async () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Enter a valid email first' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send code');
      setSignupOtpSent(true);
      setSignupEmailOtp('');
      toast.success('Verification code sent! Check your email.');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSendOtp = async () => {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error('Enter a valid email');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      toast.success(data.message || 'If an account exists, we sent a code.');
      setAuthStep('reset');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetSubmit = async () => {
    if (resetOtp.length !== 6 || newPasswordReset.length < 6 || newPasswordReset !== confirmNewPasswordReset) {
      toast.error('Enter a valid 6-digit OTP and matching passwords (min 6 characters)');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          otp: resetOtp,
          newPassword: newPasswordReset,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      toast.success(data.message || 'Password updated. Sign in with your new password.');
      setAuthStep('main');
      setIsLogin(true);
      setForgotEmail('');
      setResetOtp('');
      setNewPasswordReset('');
      setConfirmNewPasswordReset('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // Don't clear cart data - instead migrate it to user-specific storage after login
        
        // Login
        const response = await authApi.login(formData.email, formData.password);
        
        if (response.token && response.user) {
          // Clear any existing guest state first
          localStorage.removeItem('guest');
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Trigger storage event for real-time updates
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'isLoggedIn',
            newValue: 'true',
            oldValue: null
          }));

          // Trigger custom auth state change event
          window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: true, user: response.user }
          }));

          toast.success('Successfully logged in!');
          
          // Load user-specific data and migrate any existing data
          try {
            const { userStorage } = await import('@/lib/api');
            userStorage.loadUserData(response.user.id || response.user._id);
          } catch (error) {
            console.error('Error loading user data:', error);
          }
          
                     // Migrate guest cart and load user cart from database
           const { unifiedCartService } = await import('@/lib/api');
           await unifiedCartService.migrateGuestCartOnLogin();
           await unifiedCartService.loadUserCartFromDatabase();
           
           // Migrate guest addresses to database
           const { addressService } = await import('@/lib/addressService');
           await addressService.migrateGuestAddresses();

          ensureAuthInCookies();
          
          // Redirect to the intended page or delivery dashboard for delivery users
          const finalRedirect = role === 'delivery' && redirectUrl === '/' ? '/delivery' : decodeURIComponent(redirectUrl);
          router.push(finalRedirect);
        }
      } else if (role === 'delivery') {
        toast.error('Please complete delivery partner registration on the dedicated form.');
        router.push('/register-delivery');
        setIsLoading(false);
        return;
      } else {
        // Register (customer — email OTP required)
        const response = await authApi.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.trim(),
          password: formData.password,
          emailOtp: signupEmailOtp.trim(),
        });

        if (response.token && response.user) {
          // Clear any existing guest state first
          localStorage.removeItem('guest');
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Trigger storage event for real-time updates
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'isLoggedIn',
            newValue: 'true',
            oldValue: null
          }));

          // Trigger custom auth state change event
          window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { isLoggedIn: true, user: response.user }
          }));

                     // Load user-specific data and migrate any existing data
           try {
             const { userStorage } = await import('@/lib/api');
             userStorage.loadUserData(response.user.id || response.user._id);
           } catch (error) {
             console.error('Error loading user data:', error);
           }

           // Migrate guest addresses to database
           const { addressService } = await import('@/lib/addressService');
           await addressService.migrateGuestAddresses();

           toast.success('Account created successfully!');

          ensureAuthInCookies();
          
          // Redirect to the intended page or delivery dashboard for delivery users
          const finalRedirect = role === 'delivery' && redirectUrl === '/' ? '/delivery' : decodeURIComponent(redirectUrl);
          router.push(finalRedirect);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Extract error message - handle different error formats
      let errorMessage = 'Authentication failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Make error messages more user-friendly
      if (errorMessage.toLowerCase().includes('invalid email') || 
          errorMessage.toLowerCase().includes('invalid password') ||
          errorMessage.toLowerCase().includes('email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      }
      
      setErrors({ submit: errorMessage });
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#dc2626',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user starts typing in any field
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  const handleGuestLogin = () => {
    // Create a guest user object
    const guestUser = {
      id: 'guest_' + Date.now(),
      name: 'Guest User',
      email: 'guest@foodfly.com',
      isGuest: true
    };

    // Set guest session in localStorage
    localStorage.setItem('guest', 'true');
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('isLoggedIn', 'true');

    // Trigger auth state change event
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { isLoggedIn: true, user: guestUser }
    }));

    // Show success message
    toast.success('Welcome! You are now logged in as a guest.');

    ensureAuthInCookies();

    // Redirect to intended page or home
    router.push(decodeURIComponent(redirectUrl));
  };

  const handleGoogleAuthComplete = () => {
    ensureAuthInCookies();
    const dest = redirectUrl ? decodeURIComponent(redirectUrl) : '/';
    router.replace(dest);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (document.referrer && document.referrer.includes(window.location.origin) && !document.referrer.includes('/login')) {
        router.back();
      } else {
        router.push('/');
      }
    }, 280);
  };

  const handleGoogleError = (error: string) => {
    setGoogleError(error);
    // Only show toast for non-origin errors (origin-blocked is shown inline by GoogleLoginButton)
    if (!error.includes('origin is not allowed') && !error.includes('not authorized for this domain')) {
      toast.error('Google sign-in is currently unavailable. Please use email login instead.');
    }
    setShowFallbackLogin(false); // GoogleLoginButton handles its own fallback UI
  };

  const inputClasses = `w-full py-3 pr-4 pl-12 text-white placeholder-gray-400 bg-gray-800/70 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-gray-800 transition-all duration-200 shadow-sm hover:border-gray-500`;
  const errorInputClasses = `w-full py-3 pr-4 pl-12 text-white placeholder-gray-400 bg-red-900/30 border-2 border-red-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-gray-800 transition-all duration-200 shadow-sm`;
  const inputPlainClasses = `w-full py-3 px-4 text-white placeholder-gray-400 bg-gray-800/70 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-gray-800 transition-all duration-200 shadow-sm hover:border-gray-500`;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        transition: 'opacity 280ms ease, transform 280ms ease',
        opacity: isClosing ? 0 : 1,
        transform: isClosing ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      {/* Background Images */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Thali Image */}
        <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[120%]">
          <Image
            src="/images/hero-vegthali.jpg"
            alt="Veg Thali"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
        {/* Burger Image */}
        <div className="absolute -top-[10%] right-[0%] w-[60%] h-[120%]">
          <Image
            src="/images/hero-burger.jpg"
            alt="Burger"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
        {/* Blur Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          style={{
            transition: 'background-color 280ms ease',
            backgroundColor: isClosing ? 'rgba(0,0,0,0)' : undefined,
          }}
        />
      </div>

      {/* Auth Container */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl border border-gray-700/50 p-8 flex flex-col items-center backdrop-blur-xl bg-gray-900/90"
        style={{
          transition: 'opacity 280ms ease, transform 280ms ease',
          opacity: isClosing ? 0 : 1,
          transform: isClosing ? 'translateY(12px) scale(0.96)' : 'translateY(0) scale(1)',
        }}
      >
        {/* Close/Back button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 p-2 bg-gray-800 hover:bg-red-900 rounded-full transition-colors duration-200 shadow-md z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-gray-300 hover:text-red-400" />
        </button>

        <div className="w-full">
          {/* Logo */}
          <div className="mb-4 flex justify-center">
            <Image src="/images/logo.png" alt="FoodFly Logo" width={60} height={60} className="rounded-full shadow-md border-2 border-yellow-400 bg-white" />
          </div>

          {authStep === 'forgot' && role !== 'delivery' && (
            <div className="space-y-6 mb-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-7 w-7 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Forgot password</h2>
                <p className="text-gray-400 text-sm mt-2">We’ll email you a code to reset your password.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className={inputPlainClasses}
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleForgotSendOtp}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Sending…' : 'Send reset code'}
              </button>
              <button type="button" onClick={() => setAuthStep('main')} className="w-full text-gray-400 text-sm hover:text-white">
                ← Back to sign in
              </button>
            </div>
          )}

          {authStep === 'reset' && role !== 'delivery' && (
            <div className="space-y-6 mb-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Set new password</h2>
                <p className="text-gray-400 text-sm mt-2">Code sent to {forgotEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">6-digit code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                  className={`${inputPlainClasses} text-center text-2xl tracking-widest`}
                  placeholder="000000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">New password</label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    value={newPasswordReset}
                    onChange={(e) => setNewPasswordReset(e.target.value)}
                    className={inputPlainClasses}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPwd(v => !v)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showResetPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-1">Confirm password</label>
                <div className="relative">
                  <input
                    type={showResetConfirmPwd ? 'text' : 'password'}
                    value={confirmNewPasswordReset}
                    onChange={(e) => setConfirmNewPasswordReset(e.target.value)}
                    className={inputPlainClasses}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPwd(v => !v)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showResetConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePasswordResetSubmit}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving…' : 'Update password'}
              </button>
              <button type="button" onClick={() => setAuthStep('forgot')} className="w-full text-gray-400 text-sm hover:text-white">
                ← Resend code
              </button>
            </div>
          )}

          {/* Header */}
          {authStep === 'main' && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">
              {role === 'delivery' 
                ? (isLogin ? 'Delivery Partner Sign In' : 'Join Delivery Team')
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </h2>
            <p className="mt-2 text-gray-300 font-medium">
              {role === 'delivery' 
                ? (isLogin ? 'Sign in to your delivery partner account' : 'Register as a delivery partner')
                : (isLogin 
                  ? 'Sign in to access your account' 
                  : 'Join us and start ordering delicious food')
              }
            </p>
          </div>
          )}

          {/* Form */}
          {authStep === 'main' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-bold text-white mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                    <UserIcon className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? errorInputClasses : inputClasses}
                    placeholder="John Doe"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <div className="mt-2 bg-red-900/30 border border-red-500 rounded-lg p-2">
                    <p className="text-sm text-red-400 font-semibold">{errors.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="relative">
              <label className="block text-sm font-bold text-white mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? errorInputClasses : inputClasses}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <div className="mt-2 bg-red-900/30 border border-red-500 rounded-lg p-2">
                  <p className="text-sm text-red-400 font-semibold">{errors.email}</p>
                </div>
              )}
            </div>

            {!isLogin && role !== 'delivery' && (
              <div className="relative">
                <label className="block text-sm font-bold text-white mb-1">
                  Mobile number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                    <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? errorInputClasses : inputClasses}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <div className="mt-2 bg-red-900/30 border border-red-500 rounded-lg p-2">
                    <p className="text-sm text-red-400 font-semibold">{errors.phone}</p>
                  </div>
                )}
              </div>
            )}

            {/* Password field */}
            <div className="relative">
              <label className="block text-sm font-bold text-white mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400 shrink-0" />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? errorInputClasses : inputClasses}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-2 bg-red-900/30 border border-red-500 rounded-lg p-2">
                  <p className="text-sm text-red-400 font-semibold">{errors.password}</p>
                </div>
              )}
              {isLogin && role !== 'delivery' && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthStep('forgot')}
                    className="text-sm text-red-400 hover:text-red-300 font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Confirm Password field (for registration) */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-bold text-white mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={errors.confirmPassword ? errorInputClasses : inputClasses}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(v => !v)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-yellow-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 bg-red-900/30 border border-red-500 rounded-lg p-2">
                    <p className="text-sm text-red-400 font-semibold">{errors.confirmPassword}</p>
                  </div>
                )}
              </div>
            )}

            {!isLogin && role !== 'delivery' && (
              <div className="rounded-xl border border-gray-600 bg-gray-800/50 p-4 space-y-3">
                <p className="text-sm font-bold text-white">Verify your email</p>
                <button
                  type="button"
                  onClick={handleSendSignupOtp}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400/10 disabled:opacity-50"
                >
                  {signupOtpSent ? 'Resend verification code' : 'Send verification code to email'}
                </button>
                {signupOtpSent && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">6-digit code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={signupEmailOtp}
                      onChange={(e) => {
                        setSignupEmailOtp(e.target.value.replace(/\D/g, ''));
                        if (errors.signupOtp) setErrors((prev) => ({ ...prev, signupOtp: '' }));
                      }}
                      className={`${errors.signupOtp ? errorInputClasses : inputClasses} text-center text-xl tracking-widest`}
                      placeholder="000000"
                    />
                    {errors.signupOtp && (
                      <p className="text-sm text-red-400 mt-1">{errors.signupOtp}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Error Display */}
            {errors.submit && (
              <div className="bg-red-900/70 border-2 border-red-500 rounded-xl p-4 mb-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-200 font-semibold text-sm flex-1">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-yellow-400 hover:bg-yellow-300 text-[#232323]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {/* Only show social login options for normal users (not delivery) */}
            {role !== 'delivery' && (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-gray-300 font-semibold bg-gray-900/90 rounded-full">Or continue with</span>
                  </div>
                </div>

                {/* Social Login Buttons */}
                <div className="space-y-4">
                  {/* Google Login Button - Enhanced visibility */}
                  <div className="bg-white rounded-xl p-1 shadow-lg">
                    <GoogleLoginButton
                      onSuccess={handleGoogleAuthComplete}
                      onError={handleGoogleError}
                      text="Continue with Google"
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 font-bold shadow-lg rounded-xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200"
                    />
                  </div>
                  
                  {/* Fallback login option when Google fails */}
                  {showFallbackLogin && (
                    <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
                      <p className="text-sm text-yellow-300 mb-2">
                        {googleError?.includes('403') || googleError?.includes('origin is not allowed') 
                          ? 'Google OAuth is not properly configured. Please use email login above.'
                          : 'Google sign-in is temporarily unavailable. Please use email login above.'
                        }
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowFallbackLogin(false)}
                          className="text-xs text-yellow-400 underline"
                        >
                          Try Google again
                        </button>
                        {(googleError?.includes('403') || googleError?.includes('origin is not allowed')) && (
                          <button
                            onClick={() => {
                              window.open('https://console.cloud.google.com/apis/credentials', '_blank');
                              toast.success('Opening Google Cloud Console. Add localhost:3003 to authorized origins.');
                            }}
                            className="text-xs text-blue-400 underline"
                          >
                            Fix Configuration
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest Login Button */}
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white py-3 rounded-xl font-bold shadow-xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-600"
                  >
                    <User className="h-5 w-5" />
                    Continue as Guest
                  </button>
                </div>
              </>
            )}
          </form>
          )}

          {/* Toggle between login and register */}
          {authStep === 'main' && (
          <div className="mt-6 text-center">
            {role === 'delivery' ? (
              <div className="space-y-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-gray-300 hover:text-white font-bold transition-colors duration-200 block underline decoration-2 underline-offset-4"
                >
                  {isLogin ? "Don't have a delivery account? Register" : 'Already have a delivery account? Sign in'}
                </button>
                {!isLogin && (
                  <button
                    onClick={() => router.push('/register-delivery')}
                    className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200 text-sm underline"
                  >
                    Go to full delivery registration →
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setSignupOtpSent(false);
                  setSignupEmailOtp('');
                  setFormData((prev) => ({ ...prev, phone: '' }));
                  setErrors({});
                }}
                className="text-gray-300 hover:text-white font-bold transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
} 