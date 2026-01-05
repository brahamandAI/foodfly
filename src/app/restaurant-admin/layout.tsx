'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RestaurantAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/restaurant-admin/login') {
      setIsLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('restaurantAdminToken');
      const restaurantAdmin = localStorage.getItem('restaurantAdmin');
      
      if (!token || !restaurantAdmin) {
        router.push('/restaurant-admin/login');
        return;
      }

      setIsLoading(false);
    }
  }, [router, pathname]);

  // Handle login page rendering
  if (pathname === '/restaurant-admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#232323] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="fixed inset-0 overflow-hidden">{children}</div>;
}

