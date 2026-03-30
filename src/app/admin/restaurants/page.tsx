'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, XCircle, UserPlus, X, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Restaurant {
  _id: string;
  name: string;
  email: string;
  phone: string;
  cuisine: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isActive: boolean;
  owner?: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  deliveryFee: number;
  minimumOrder?: number;
  preparationTime: number;
}

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  cuisine: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  ownerEmail: '',
  deliveryFee: '40',
  minimumOrder: '100',
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchRestaurants(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(restaurants); return; }
    const q = search.toLowerCase();
    setFiltered(restaurants.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.address?.city?.toLowerCase().includes(q)
    ));
  }, [search, restaurants]);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/restaurants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      } else if (res.status === 401 || res.status === 403) {
        toast.error('Unauthorized. Please login again.');
        window.location.href = '/admin/login';
      }
    } catch {
      toast.error('Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (restaurantId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        toast.success(`Restaurant ${!currentStatus ? 'enabled' : 'disabled'}`);
        fetchRestaurants();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update');
      }
    } catch { toast.error('Failed to update restaurant'); }
  };

  const handleDeleteRestaurant = async (restaurantId: string, restaurantName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${restaurantName}"? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Restaurant deleted');
        fetchRestaurants();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete');
      }
    } catch { toast.error('Failed to delete restaurant'); }
  };

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          cuisine: form.cuisine.split(',').map(c => c.trim()).filter(Boolean),
          address: { street: form.street, city: form.city, state: form.state, zipCode: form.zipCode },
          ownerEmail: form.ownerEmail || undefined,
          deliveryFee: parseFloat(form.deliveryFee) || 40,
          minimumOrder: parseFloat(form.minimumOrder) || 100,
        }),
      });
      if (res.ok) {
        toast.success('Restaurant created successfully!');
        setShowAddModal(false);
        setForm(emptyForm);
        fetchRestaurants();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create restaurant');
      }
    } catch { toast.error('Failed to create restaurant'); }
    finally { setSaving(false); }
  };

  const openEditModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditForm({
      name: restaurant.name || '',
      email: restaurant.email || '',
      phone: restaurant.phone || '',
      cuisine: (restaurant.cuisine || []).join(', '),
      street: restaurant.address?.street || '',
      city: restaurant.address?.city || '',
      state: restaurant.address?.state || '',
      zipCode: restaurant.address?.zipCode || '',
      ownerEmail: restaurant.owner?.email || '',
      deliveryFee: String(restaurant.deliveryFee || 40),
      minimumOrder: String(restaurant.minimumOrder || 100),
    });
  };

  const handleEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/restaurants/${selectedRestaurant._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          cuisine: editForm.cuisine.split(',').map(c => c.trim()).filter(Boolean),
          address: { street: editForm.street, city: editForm.city, state: editForm.state, zipCode: editForm.zipCode },
          deliveryFee: parseFloat(editForm.deliveryFee) || 40,
          minimumOrder: parseFloat(editForm.minimumOrder) || 100,
        }),
      });
      if (res.ok) {
        toast.success('Restaurant updated!');
        setSelectedRestaurant(null);
        fetchRestaurants();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update restaurant');
      }
    } catch { toast.error('Failed to update restaurant'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400';
  const labelCls = 'block text-xs font-semibold text-gray-400 mb-1';

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#232323] overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">Restaurant Management</h1>
              <p className="text-gray-400 text-sm mt-1">{restaurants.length} restaurants on the platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRestaurants}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-yellow-400"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setShowAddModal(true); setForm(emptyForm); }}
              className="bg-yellow-400 text-[#232323] px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Restaurant</span>
            </button>
          </div>
        </div>
        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search restaurants by name, email, city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((restaurant) => (
            <div key={restaurant._id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{restaurant.name}</h3>
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>{restaurant.address?.street}</p>
                    <p>{restaurant.address?.city}, {restaurant.address?.state}</p>
                    <p className="text-yellow-400 font-medium">
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(restaurant._id, restaurant.isActive)}
                  className={`p-2 rounded-lg transition-colors ${restaurant.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                  title={restaurant.isActive ? 'Click to disable' : 'Click to enable'}
                >
                  {restaurant.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-1.5 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white text-xs">{restaurant.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{restaurant.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Fee:</span>
                  <span className="text-yellow-400 font-semibold">₹{restaurant.deliveryFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Min. Order:</span>
                  <span className="text-white">₹{restaurant.minimumOrder || 0}</span>
                </div>
                {restaurant.owner && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner:</span>
                    <span className="text-white font-medium">{restaurant.owner.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${restaurant.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {restaurant.isActive ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEditModal(restaurant)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                {!restaurant.owner && (
                  <button
                    onClick={() => {
                      openEditModal(restaurant);
                    }}
                    className="flex-1 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    title="Assign an admin email in edit"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Assign</span>
                  </button>
                )}
                <button
                  onClick={() => handleDeleteRestaurant(restaurant._id, restaurant.name)}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
                  title="Delete permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">{search ? 'No restaurants match your search' : 'No restaurants found'}</p>
            {!search && (
              <button
                onClick={() => { setShowAddModal(true); setForm(emptyForm); }}
                className="mt-4 bg-yellow-400 text-[#232323] px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
              >
                Add First Restaurant
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-black text-white">Add New Restaurant</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRestaurant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Restaurant Name *</label>
                  <input required className={inputCls} placeholder="e.g. The Grand Kitchen" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input required type="email" className={inputCls} placeholder="restaurant@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input required className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Cuisine Types * (comma-separated)</label>
                  <input required className={inputCls} placeholder="Indian, Chinese, Continental" value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Street Address *</label>
                <input required className={inputCls} placeholder="123 Main Street, Sector 12" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>City *</label>
                  <input required className={inputCls} placeholder="New Delhi" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>State *</label>
                  <input required className={inputCls} placeholder="Delhi" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>PIN Code *</label>
                  <input required className={inputCls} placeholder="110078" value={form.zipCode} onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Delivery Fee (₹) *</label>
                  <input required type="number" min="0" className={inputCls} placeholder="40" value={form.deliveryFee} onChange={e => setForm(f => ({ ...f, deliveryFee: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Minimum Order (₹) *</label>
                  <input required type="number" min="0" className={inputCls} placeholder="100" value={form.minimumOrder} onChange={e => setForm(f => ({ ...f, minimumOrder: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Admin Email (optional — assign an existing restaurantAdmin user)</label>
                <input type="email" className={inputCls} placeholder="admin@restaurant.com (leave blank if not yet assigned)" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 font-semibold hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-[#232323] rounded-lg font-bold hover:bg-yellow-300 transition-colors disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Restaurant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Restaurant Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-black text-white">Edit: {selectedRestaurant.name}</h2>
              <button onClick={() => setSelectedRestaurant(null)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditRestaurant} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Restaurant Name *</label>
                  <input required className={inputCls} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input required type="email" className={inputCls} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Phone Number *</label>
                  <input required className={inputCls} value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Cuisine Types (comma-separated)</label>
                  <input className={inputCls} value={editForm.cuisine} onChange={e => setEditForm(f => ({ ...f, cuisine: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Street Address</label>
                <input className={inputCls} value={editForm.street} onChange={e => setEditForm(f => ({ ...f, street: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input className={inputCls} value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>PIN Code</label>
                  <input className={inputCls} value={editForm.zipCode} onChange={e => setEditForm(f => ({ ...f, zipCode: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Delivery Fee (₹)</label>
                  <input type="number" min="0" className={inputCls} value={editForm.deliveryFee} onChange={e => setEditForm(f => ({ ...f, deliveryFee: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Minimum Order (₹)</label>
                  <input type="number" min="0" className={inputCls} value={editForm.minimumOrder} onChange={e => setEditForm(f => ({ ...f, minimumOrder: e.target.value }))} />
                </div>
              </div>

              {!selectedRestaurant.owner && (
                <div>
                  <label className={labelCls}>Assign Admin Email (restaurantAdmin role required)</label>
                  <input type="email" className={inputCls} placeholder="admin@restaurant.com" value={editForm.ownerEmail} onChange={e => setEditForm(f => ({ ...f, ownerEmail: e.target.value }))} />
                  <p className="text-xs text-gray-500 mt-1">Note: Admin assignment requires a separate API call. Contact dev to implement owner linking.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedRestaurant(null)} className="flex-1 py-3 border border-gray-700 rounded-lg text-gray-300 font-semibold hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-3 bg-yellow-400 text-[#232323] rounded-lg font-bold hover:bg-yellow-300 transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
