'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-hot-toast';
import { ensureAuthInCookies } from '@/lib/api';
import { refreshAuthState } from '@/lib/utils/auth';

interface GoogleLoginButtonProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
  text?: string;
  className?: string;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  text = 'Continue with Google',
  className = '',
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [originBlocked, setOriginBlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isConfigured = clientId && clientId.includes('googleusercontent.com');

  // Detect when Google Sign-In is blocked due to origin not being authorized
  useEffect(() => {
    if (!isConfigured) return;

    // Intercept console output to catch [GSI_LOGGER] "origin is not allowed" messages
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);
    const origLog = console.log.bind(console);

    const detectOriginBlock = (...args: any[]) => {
      const msg = args.map(a => (typeof a === 'string' ? a : '')).join(' ');
      if (msg.includes('origin is not allowed') || msg.includes('GSI_LOGGER')) {
        setOriginBlocked(true);
        onError?.('Google Sign-In is not authorized for this domain. Please use email login.');
      }
    };

    console.error = (...args) => { detectOriginBlock(...args); origError(...args); };
    console.warn  = (...args) => { detectOriginBlock(...args); origWarn(...args); };
    console.log   = (...args) => { detectOriginBlock(...args); origLog(...args); };

    // Also check if the Google button failed to render its iframe after 4 seconds
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const iframe = containerRef.current.querySelector('iframe');
        const gsiDiv = containerRef.current.querySelector('[data-client_id]');
        const hasRendered = iframe || gsiDiv;
        // If the inner div rendered but no iframe loaded, likely origin blocked
        if (!hasRendered) {
          // Button may still be loading – don't flag yet
        }
      }
    }, 4000);

    return () => {
      console.error = origError;
      console.warn  = origWarn;
      console.log   = origLog;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      const errorMessage = 'No credential received from Google';
      toast.error(errorMessage);
      onError?.(errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google authentication failed');
      }

      const data = await response.json();

      localStorage.removeItem('guest');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      sessionStorage.setItem('isLoggedIn', 'true');

      document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      const userJson = encodeURIComponent(JSON.stringify(data.user));
      document.cookie = `user=${userJson}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      ensureAuthInCookies();

      window.dispatchEvent(
        new CustomEvent('authStateChanged', {
          detail: { isLoggedIn: true, user: data.user, source: 'google' },
        })
      );

      try {
        const { unifiedCartService } = await import('@/lib/api');
        await unifiedCartService.migrateGuestCartOnLogin();
        await unifiedCartService.loadUserCartFromDatabase();
      } catch (e) {
        console.error('Error migrating guest cart:', e);
      }

      try {
        const { addressService } = await import('@/lib/addressService');
        await addressService.migrateGuestAddresses();
      } catch (e) {
        console.error('Error migrating guest addresses:', e);
      }

      refreshAuthState();

      toast.success(data.message || 'Successfully signed in with Google!');
      onSuccess();
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.message || 'Google authentication failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    const errorMessage = 'Google authentication failed. Please try again.';
    toast.error(errorMessage);
    onError?.(errorMessage);
  };

  if (!isConfigured || isDisabled || originBlocked) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-500 py-3 rounded-xl border-2 border-gray-200 cursor-not-allowed select-none">
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#9ca3af" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#9ca3af" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#9ca3af" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#9ca3af" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-semibold">Google Sign-In unavailable</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          {originBlocked ? 'Domain not authorized — use email login below' : 'Use email & password login instead'}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <div className="relative">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          auto_select={false}
          text="continue_with"
          shape="rectangular"
          theme="outline"
          size="large"
          logo_alignment="left"
          type="standard"
          context="signin"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              <span className="text-sm text-gray-700 font-medium">Signing in...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
