'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import NotificationSystem from './NotificationSystem';
import { initializeTestData } from '@/lib/testData';
import { clearInvalidAuth, ensureAuthInCookies } from '@/lib/api';
import { getCustomerLoginPath } from '@/lib/utils/auth';

const PROTECTED_ROUTES = ['/cart', '/checkout', '/profile', '/orders', '/favorites', '/health'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Initialize test data for development/testing
    initializeTestData();

    // Ensure auth present in cookies for middleware
    ensureAuthInCookies();

    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        const auth = localStorage.getItem('isLoggedIn') === 'true';
        if (token && user && auth) {
          setIsAuthenticated(true);
        } else {
          clearInvalidAuth();
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Periodic auth re-check (every 30s)
    const authCheckInterval = setInterval(checkAuth, 30000);

    const handleAuthChange = (e: CustomEvent) => {
      const { isLoggedIn } = e.detail || {};
      setIsAuthenticated(!!isLoggedIn);
    };

    window.addEventListener('authStateChanged', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
      clearInterval(authCheckInterval);
    };
  }, []);

  /** Legacy hook: open full `/login` page (same UX as header “Sign in”). */
  const openCustomerLogin = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const auth = localStorage.getItem('isLoggedIn') === 'true';
      if (token && user && auth) return;
    } catch {
      /* ignore */
    }
    if (isAuthenticated) return;
    router.push(getCustomerLoginPath());
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showAuthPopup = openCustomerLogin;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).showAuthPopup;
      }
    };
  }, [openCustomerLogin]);

  // Exclude admin routes from showing Header/Footer
  const isAdminRoute = pathname?.startsWith('/restaurant-admin') || 
                       pathname?.startsWith('/admin') || 
                       pathname?.startsWith('/delivery') ||
                       pathname?.startsWith('/chef');

  // Show loading spinner for protected routes while checking auth
  if (isLoading && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // For admin routes, render without Header/Footer
  if (isAdminRoute) {
    return (
      <>
        {children}
        <NotificationSystem />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mobile-container">
      <Header />
      <main className="mobile-bottom-spacing">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <NotificationSystem />
    </div>
  );
}
