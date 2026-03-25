'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '@/lib/api';
import GoogleLoginButton from './GoogleLoginButton';
import PhoneVerification from './PhoneVerification';

interface AuthPopupProps {
  onClose: () => void;
  onSuccess: () => void;
}

// 'login' | 'register' | 'forgot' | 'verify-otp' | 'reset'
type AuthView = 'login' | 'register' | 'forgot' | 'verify-otp' | 'reset';

export default function AuthPopup({ onClose, onSuccess }: AuthPopupProps) {
  const [view, setView] = useState<AuthView>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Check if user is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const isGuest = localStorage.getItem('guest') === 'true';
    const isLoggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    
    const authenticated = !!((token && userData) || (isGuest && userData && isLoggedInStatus));
    
    if (authenticated) {
      // User is already authenticated, close the popup and call success
      onSuccess();
      onClose();
      return;
    }
  }, [onClose, onSuccess]);

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

    // Additional validations for registration
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { isLogin, formData });
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        console.log('Attempting login...');
        await authApi.login(formData.email, formData.password);
        console.log('Login successful');
        toast.success('Welcome back! Successfully logged in.');
        
        // Trigger storage event to update header state
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'isLoggedIn',
          newValue: 'true'
        }));
        
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { isLoggedIn: true }
        }));
        
      } else {
        console.log('Attempting registration...');
        const userData = {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: verifiedPhone || undefined
        };
        console.log('Registration data:', userData);
        await authApi.register(userData);
        console.log('Registration successful');
        toast.success('Account created successfully! Welcome to FoodFly!');
        
        // Trigger storage event to update header state
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'isLoggedIn',
          newValue: 'true'
        }));
        
        // Trigger custom event for immediate UI update
        window.dispatchEvent(new CustomEvent('authStateChanged', {
          detail: { isLoggedIn: true }
        }));
      }
      
      // Call success callback and close popup
      onSuccess();
      onClose();
      
    } catch (error: any) {
      console.error('Auth error:', error);
      const errorMessage = error.message || 'Authentication failed';
      console.error('Error message:', errorMessage);
      toast.error(errorMessage);
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
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
  };

  const handleGoogleLoginSuccess = () => {
    onSuccess();
    onClose();
  };

  // --- Forgot password handlers ---
  const handleSendOtp = async () => {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors({ forgotEmail: 'Please enter a valid email address' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      toast.success('OTP sent! Check your email inbox.');
      setView('verify-otp');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setErrors({ otp: 'Enter the 6-digit OTP from your email' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpInput, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      toast.success('Password reset successfully! Please log in.');
      setView('login');
      setIsLogin(true);
      setOtpInput('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      // Test the health endpoint
      const healthResponse = await fetch('/api/test');
      const healthData = await healthResponse.json();
      console.log('Health Check Response:', healthData);
      
      // Test a simple registration to see the exact error
      const testRegResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      if (!testRegResponse.ok) {
        const errorText = await testRegResponse.text();
        console.log('Registration Test Error:', {
          status: testRegResponse.status,
          statusText: testRegResponse.statusText,
          body: errorText
        });
      } else {
        const regData = await testRegResponse.json();
        console.log('Registration Test Success:', regData);
      }
      
    } catch (error) {
      console.error('Backend Test Error:', error);
    }
  };

  const inputClasses = `w-full px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 bg-white border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`;
  const errorInputClasses = `w-full px-4 py-3 pl-10 text-gray-900 placeholder-gray-500 bg-white border border-red-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200`;

  const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="modal-content-light rounded-2xl w-full max-w-md relative transform transition-all shadow-2xl mx-2 sm:mx-0 max-h-[95vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="p-8">

          {/* ───────── LOGIN / REGISTER ───────── */}
          {(view === 'login' || view === 'register') && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">{view === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
                <p className="mt-2 text-gray-600">{view === 'login' ? 'Sign in to access your account' : 'Join us and start ordering delicious food'}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {view === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon className="h-5 w-5 text-gray-400" /></div>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? errorInputClasses : inputClasses} placeholder="John Doe" disabled={isLoading} />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? errorInputClasses : inputClasses} placeholder="you@example.com" disabled={isLoading} />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    {view === 'login' && (
                      <button type="button" onClick={() => { setView('forgot'); setErrors({}); }} className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={errors.password ? errorInputClasses : inputClasses} placeholder="••••••••" disabled={isLoading} />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>

                {view === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={errors.confirmPassword ? errorInputClasses : inputClasses} placeholder="••••••••" disabled={isLoading} />
                      </div>
                      {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* Phone Verification */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Verify Mobile Number
                        {verifiedPhone && <span className="ml-2 text-green-600 font-semibold">✓ {verifiedPhone}</span>}
                      </p>
                      {!verifiedPhone ? (
                        <PhoneVerification
                          onVerified={(ph) => { setVerifiedPhone(ph); toast.success('Phone verified!'); }}
                          onSkip={() => setVerifiedPhone('')}
                        />
                      ) : (
                        <p className="text-sm text-green-600">Mobile number verified successfully.</p>
                      )}
                    </div>
                  </>
                )}

                {errors.submit && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 text-center">{errors.submit}</p>
                  </div>
                )}

                <button type="submit" disabled={isLoading} className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  {isLoading ? <><Spinner />{view === 'login' ? 'Signing in...' : 'Creating account...'}</> : (view === 'login' ? 'Sign In' : 'Create Account')}
                </button>

                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div></div>

                <GoogleLoginButton onSuccess={handleGoogleLoginSuccess} text={view === 'login' ? 'Sign in with Google' : 'Sign up with Google'} />

                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{view === 'login' ? "Don't have an account?" : 'Already have an account?'}</span></div></div>

                <button type="button" onClick={() => { setView(view === 'login' ? 'register' : 'login'); setIsLogin(view !== 'login'); setErrors({}); }} className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  {view === 'login' ? 'Create an Account' : 'Sign In Instead'}
                </button>
              </form>
            </>
          )}

          {/* ───────── FORGOT PASSWORD — enter email ───────── */}
          {view === 'forgot' && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-7 w-7 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="mt-2 text-gray-600">Enter your email and we'll send you a 6-digit OTP</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                    <input type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setErrors({}); }} className={errors.forgotEmail ? errorInputClasses : inputClasses} placeholder="you@example.com" disabled={isLoading} />
                  </div>
                  {errors.forgotEmail && <p className="mt-1 text-sm text-red-500">{errors.forgotEmail}</p>}
                </div>
                <button onClick={handleSendOtp} disabled={isLoading} className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  {isLoading ? <><Spinner />Sending OTP...</> : 'Send OTP'}
                </button>
                <button type="button" onClick={() => { setView('login'); setErrors({}); }} className="w-full py-2 text-sm text-gray-600 hover:text-gray-800">
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

          {/* ───────── VERIFY OTP & RESET PASSWORD ───────── */}
          {(view === 'verify-otp' || view === 'reset') && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                <p className="mt-2 text-gray-600">Enter the OTP sent to <strong>{forgotEmail}</strong> and your new password</p>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={e => { setOtpInput(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                    className={`w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.otp ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="000000"
                    disabled={isLoading}
                  />
                  {errors.otp && <p className="mt-1 text-sm text-red-500">{errors.otp}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setErrors({}); }} className={errors.newPassword ? errorInputClasses : inputClasses} placeholder="At least 6 characters" disabled={isLoading} />
                  </div>
                  {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input type="password" value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setErrors({}); }} className={errors.confirmNewPassword ? errorInputClasses : inputClasses} placeholder="••••••••" disabled={isLoading} />
                  </div>
                  {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword}</p>}
                </div>
                <button onClick={handleResetPassword} disabled={isLoading} className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}>
                  {isLoading ? <><Spinner />Resetting...</> : 'Reset Password'}
                </button>
                <button type="button" onClick={() => { setView('forgot'); setErrors({}); }} className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1">
                  ← Resend OTP
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
} 