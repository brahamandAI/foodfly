'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      const admin = localStorage.getItem('adminUser');
      
      if (!token || !admin) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(false);
    }
  }, [router, pathname]);

  // Handle login page rendering
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#232323] flex items-center justify-center" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return <div className="fixed inset-0 overflow-hidden bg-[#232323]" style={{ fontFamily: "'Satoshi', sans-serif" }}>{children}</div>;
}
