'use client';
import React from 'react';
import { formatDistance, MAX_DELIVERY_RADIUS_KM } from '@/lib/distanceService';

interface DeliveryRadiusBadgeProps {
  distance: number;
  canDeliver: boolean;
  className?: string;
}

export default function DeliveryRadiusBadge({ distance, canDeliver, className = '' }: DeliveryRadiusBadgeProps) {
  if (canDeliver) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>{formatDistance(distance)} away</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium ${className}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>Beyond {MAX_DELIVERY_RADIUS_KM}km ({formatDistance(distance)})</span>
    </div>
  );
}

export function DeliveryRadiusInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-blue-900 font-semibold mb-1">Fresh Food Guarantee 🍽️</h4>
          <p className="text-blue-800 text-sm">
            We deliver within <strong>{MAX_DELIVERY_RADIUS_KM}km</strong> to ensure your food arrives fresh and hot. 
            If your location is outside this range, try selecting a closer address or explore other restaurants nearby!
          </p>
        </div>
      </div>
    </div>
  );
}

