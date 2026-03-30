'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Lock, Eye, EyeOff } from 'lucide-react';
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

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const changePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { toast.error('Please fill in all fields'); return; }
    if (pwForm.newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.current === pwForm.newPw) { toast.error('New password must be different'); return; }
    setPwLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw })
      });
      const data = await res.json();
      if (res.ok) { toast.success('Password changed successfully!'); setPwForm({ current: '', newPw: '', confirm: '' }); }
      else { toast.error(data.error || 'Failed to change password'); }
    } catch { toast.error('Failed to change password'); }
    finally { setPwLoading(false); }
  };

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
          {/* Change Password */}
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-yellow-400" />
              <div>
                <h2 className="text-xl font-black text-yellow-400">Change Password</h2>
                <p className="text-gray-400 text-sm">Update your super admin account password</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md">
              {[
                { label: 'Current Password', key: 'current', show: showPwCurrent, toggle: () => setShowPwCurrent(v => !v) },
                { label: 'New Password', key: 'newPw', show: showPwNew, toggle: () => setShowPwNew(v => !v) },
                { label: 'Confirm New Password', key: 'confirm', show: showPwConfirm, toggle: () => setShowPwConfirm(v => !v) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label className="block text-gray-300 font-semibold mb-2">{label}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={pwForm[key as keyof typeof pwForm]}
                      onChange={(e) => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                      className={`w-full bg-[#232323] border-2 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:border-yellow-400 ${
                        key === 'confirm' && pwForm.confirm && pwForm.newPw !== pwForm.confirm ? 'border-red-500' : 'border-gray-700'
                      }`}
                      placeholder={label}
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors" tabIndex={-1}>
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {key === 'confirm' && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>
              ))}

              <button
                onClick={changePassword}
                disabled={pwLoading || !pwForm.current || !pwForm.newPw || !pwForm.confirm || pwForm.newPw !== pwForm.confirm}
                className="w-full mt-2 bg-yellow-400 text-[#232323] py-3 px-6 rounded-lg font-bold hover:bg-yellow-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {pwLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
