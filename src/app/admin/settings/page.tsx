'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SystemSettings {
  deliveryRadius: number;
  commissionPercentage: number;
  paymentMethods: {
    cod: boolean;
    online: boolean;
    upi: boolean;
  };
  featureToggles: {
    deliveryTracking: boolean;
    ratings: boolean;
    promotions: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    deliveryRadius: 2,
    commissionPercentage: 10,
    paymentMethods: {
      cod: true,
      online: true,
      upi: true,
    },
    featureToggles: {
      deliveryTracking: true,
      ratings: true,
      promotions: true,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#232323] overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b-2 border-yellow-400 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-yellow-400">System Settings</h1>
              <p className="text-gray-400 text-sm mt-1">Configure platform-wide settings</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-yellow-400 text-[#232323] px-6 py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* Delivery Radius */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-xl p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">Delivery Radius</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Maximum Delivery Distance (km)
                </label>
                <input
                  type="number"
                  value={settings.deliveryRadius}
                  onChange={(e) => setSettings({ ...settings, deliveryRadius: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#232323] border-2 border-yellow-400 text-white px-4 py-3 rounded-lg focus:outline-none"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-xl p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">Commission Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">
                  Platform Commission Percentage (%)
                </label>
                <input
                  type="number"
                  value={settings.commissionPercentage}
                  onChange={(e) => setSettings({ ...settings, commissionPercentage: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#232323] border-2 border-yellow-400 text-white px-4 py-3 rounded-lg focus:outline-none"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-xl p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">Payment Methods</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.cod}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, cod: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.online}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, online: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">Online Payment</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.paymentMethods.upi}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, upi: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">UPI</span>
              </label>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-xl p-6">
            <h2 className="text-xl font-black text-yellow-400 mb-4">Feature Toggles</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.featureToggles.deliveryTracking}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, deliveryTracking: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">Delivery Tracking</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.featureToggles.ratings}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, ratings: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">Ratings & Reviews</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.featureToggles.promotions}
                  onChange={(e) => setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, promotions: e.target.checked }
                  })}
                  className="w-5 h-5 text-yellow-400 border-yellow-400 rounded focus:ring-yellow-400"
                />
                <span className="text-gray-300 font-semibold">Promotions & Discounts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
