'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Utensils } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token');
    const isGuest = localStorage.getItem('guest') === 'true';
    setIsLoggedIn(!!(token || isGuest));

    // Load cart count
    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const loadCartCount = async () => {
    try {
      const { unifiedCartService } = await import('@/lib/api');
      const count = await unifiedCartService.getCartCount();
      setCartCount(count || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartCount(0);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      show: true,
    },
    {
      href: '/menu',
      icon: Utensils,
      label: 'Menu',
      show: true,
    },
    {
      href: '/search',
      icon: Search,
      label: 'Search',
      show: true,
    },
    {
      href: '/cart',
      icon: ShoppingCart,
      label: 'Cart',
      badge: cartCount,
      show: true,
    },
    {
      href: isLoggedIn ? '/profile' : '/login',
      icon: User,
      label: isLoggedIn ? 'Profile' : 'Login',
      show: true,
    },
  ];

  return (
    <nav className="mobile-bottom-nav md:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {navItems.map((item) => {
          if (!item.show) return null;
          
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? 'active' : ''} no-tap-highlight relative`}
            >
              <div className="relative">
                <Icon className="mobile-nav-icon" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

