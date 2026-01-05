'use client';
import React, { useState, useEffect } from 'react';

export default function LocationDebugger() {
  const [status, setStatus] = useState<string>('Checking...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    checkLocationSupport();
  }, []);

  const checkLocationSupport = async () => {
    const info: any = {
      browserSupport: !!navigator.geolocation,
      isHttps: window.location.protocol === 'https:',
      isLocalhost: window.location.hostname === 'localhost',
      userAgent: navigator.userAgent
    };

    // Check permission
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        info.permission = result.state;
      } catch (e) {
        info.permission = 'unknown';
      }
    }

    setDetails(info);

    if (!info.browserSupport) {
      setStatus('❌ Browser does not support geolocation');
    } else if (info.permission === 'denied') {
      setStatus('❌ Location permission denied');
    } else if (info.permission === 'granted') {
      setStatus('✅ Location access granted');
    } else {
      setStatus('⚠️ Location permission not yet requested');
    }
  };

  const requestLocation = () => {
    setStatus('🔄 Requesting location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus('✅ Location obtained successfully!');
        setDetails({
          ...details,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: `${Math.round(position.coords.accuracy)}m`
        });
      },
      (error) => {
        const errors: any = {
          1: '❌ Permission denied - Allow location in browser settings',
          2: '❌ Position unavailable - Check GPS/WiFi',
          3: '⚠️ Timeout - GPS taking too long, using default location'
        };
        setStatus(errors[error.code] || '❌ Unknown error');
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 600000
      }
    );
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">🔍 Location Debug</h3>
      </div>
      
      <div className="text-xs space-y-1 mb-3">
        <p className="font-semibold">{status}</p>
        
        {details && (
          <div className="mt-2 space-y-1 text-gray-600">
            <p>Browser: {details.browserSupport ? '✅' : '❌'}</p>
            <p>HTTPS: {details.isHttps ? '✅' : '❌'} (Localhost: {details.isLocalhost ? '✅' : '❌'})</p>
            <p>Permission: {details.permission || 'unknown'}</p>
            {details.latitude && (
              <>
                <p>Lat: {details.latitude.toFixed(6)}</p>
                <p>Lng: {details.longitude.toFixed(6)}</p>
                <p>Accuracy: {details.accuracy}</p>
              </>
            )}
          </div>
        )}
      </div>

      <button
        onClick={requestLocation}
        className="w-full bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-600"
      >
        Test Location
      </button>
      
      <p className="text-xs text-gray-500 mt-2">
        💡 If failing: Allow location in browser settings
      </p>
    </div>
  );
}

