'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { UserPlus, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCustomerLoginPath } from '@/lib/utils/auth';

const SignupPopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const isGuest = localStorage.getItem('guest') === 'true';
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      const authenticated = !!((token && userData) || (isGuest && userData && isLoggedIn));

      if (authenticated) {
        onClose();
      }
    }
  }, [isOpen, onClose]);

  const go = (path: string) => {
    onClose();
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div className="relative bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-md flex flex-col items-center animate-fade-in backdrop-blur-2xl">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none transition-colors duration-200"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="mb-4">
          <Image src="/images/logo.png" alt="FoodFly Logo" width={60} height={60} className="rounded-full shadow-md border-2 border-yellow-400 bg-white" />
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-gray-900 dark:text-white drop-shadow">Welcome to FoodFly!</h2>
        <p className="text-gray-700 dark:text-gray-200 text-center mb-6">
          Use the same page for sign in, sign up (phone + email code), Google, forgot password, and continue as guest.
        </p>
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            type="button"
            onClick={() => go(getCustomerLoginPath({ signup: true, returnTo: '/' }))}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2.5 rounded-lg font-semibold text-lg shadow hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200"
          >
            <UserPlus className="w-5 h-5" /> Create account
          </button>
          <button
            type="button"
            onClick={() => go(getCustomerLoginPath({ returnTo: '/' }))}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-lg shadow transition-all duration-200"
          >
            <LogIn className="w-5 h-5" /> Sign in, Google, or guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup;
