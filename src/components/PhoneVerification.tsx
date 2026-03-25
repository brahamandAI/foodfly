'use client';

import { useState, useEffect, useRef } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Phone, CheckCircle } from 'lucide-react';

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  onSkip?: () => void;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function PhoneVerification({ onVerified, onSkip }: PhoneVerificationProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'done'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup recaptcha on unmount
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      });
    }
    return window.recaptchaVerifier;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) return '+' + digits;
    if (digits.length === 10) return '+91' + digits;
    return '+' + digits;
  };

  const handleSendOtp = async () => {
    setError('');
    const phoneRegex = /^[6-9]\d{9}$/;
    const digits = phone.replace(/\D/g, '').replace(/^91/, '');

    if (!phoneRegex.test(digits)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const verifier = setupRecaptcha();
      const formattedPhone = formatPhone(digits);
      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('Firebase phone auth error:', err);
      if (err.code === 'auth/invalid-app-credential' || err.code === 'auth/app-not-authorized') {
        setError('Firebase not configured. Please add Firebase credentials to .env.local');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to send OTP. Please try again.');
      }
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = undefined as any;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your number');
      return;
    }
    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      return;
    }
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      const digits = phone.replace(/\D/g, '').replace(/^91/, '');
      setStep('done');
      onVerified('+91' + digits);
    } catch (err: any) {
      setError(err.code === 'auth/invalid-verification-code' ? 'Invalid OTP. Please try again.' : 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-green-700 font-semibold text-lg">Phone Verified!</p>
        <p className="text-gray-500 text-sm">Your mobile number has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div id="recaptcha-container" ref={recaptchaContainerRef} />

      {step === 'phone' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 rounded-l-xl text-sm">
                <Phone className="h-4 w-4 mr-1" /> +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                placeholder="9876543210"
                disabled={isLoading}
              />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <button
            onClick={handleSendOtp}
            disabled={isLoading || phone.length < 10}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {onSkip && (
            <button type="button" onClick={onSkip} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
              Skip for now
            </button>
          )}
        </>
      )}

      {step === 'otp' && (
        <>
          <p className="text-sm text-gray-600">OTP sent to <strong>+91{phone}</strong></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="000000"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading || otp.length < 6}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button type="button" onClick={() => { setStep('phone'); setOtp(''); setError(''); }} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
            ← Change number
          </button>
        </>
      )}
    </div>
  );
}
