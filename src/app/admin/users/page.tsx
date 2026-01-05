'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Ban, CheckCircle, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  isBlocked?: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Unauthorized. Please login again.');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'}`);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success('User deleted permanently');
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-white">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#232323] overflow-hidden" style={{ fontFamily: "'Satoshi', sans-serif" }}>
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-white">User Management</h1>
              <p className="text-gray-400 text-sm mt-1">Manage platform users and handle abuse cases</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      {user.name}
                    </h3>
                    {user.isBlocked && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                        BLOCKED
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Email: <span className="text-white">{user.email}</span></p>
                    {user.phone && (
                      <p>Phone: <span className="text-white">{user.phone}</span></p>
                    )}
                    <p>Joined: <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span></p>
                    {user.lastLogin && (
                      <p>Last Login: <span className="text-white">{new Date(user.lastLogin).toLocaleString()}</span></p>
                    )}
                    <p>Verified: <span className={user.isEmailVerified ? 'text-green-400' : 'text-red-400'}>
                      {user.isEmailVerified ? 'Yes' : 'No'}
                    </span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBlockToggle(user._id, user.isBlocked || false)}
                    className={`p-3 rounded-lg transition-colors ${
                      user.isBlocked
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                    title={user.isBlocked ? 'Unblock user' : 'Block user'}
                  >
                    {user.isBlocked ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Ban className="w-5 h-5" />
                    )}
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
