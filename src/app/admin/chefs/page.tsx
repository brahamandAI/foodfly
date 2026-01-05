'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, XCircle, Eye, FileText, Clock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Chef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  chefProfile: {
    specialization: string[];
    experience: number;
    rating: number;
    portfolio: {
      description: string;
      signature_dishes: string[];
    };
    verification: {
      isVerified: boolean;
      documents: {
        certifications: string[];
        experience_letters: string[];
        health_certificate?: string;
      };
    };
    location: {
      serviceAreas: string[];
    };
  };
  createdAt: string;
}

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [pendingChefs, setPendingChefs] = useState<Chef[]>([]);
  const [approvedChefs, setApprovedChefs] = useState<Chef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/chefs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const allChefs = data.chefs || [];
        setChefs(allChefs);
        
        const pending = allChefs.filter((c: Chef) => !c.chefProfile?.verification?.isVerified);
        const approved = allChefs.filter((c: Chef) => c.chefProfile?.verification?.isVerified);
        
        setPendingChefs(pending);
        setApprovedChefs(approved);
      } else {
        if (response.status === 401 || response.status === 403) {
          toast.error('Unauthorized. Please login again.');
          window.location.href = '/admin/login';
        }
      }
    } catch (error) {
      console.error('Error fetching chefs:', error);
      toast.error('Failed to load chefs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (chefId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/chefs/${chefId}/approve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success('Chef approved successfully');
        fetchChefs();
        setSelectedChef(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve chef');
      }
    } catch (error) {
      toast.error('Failed to approve chef');
    }
  };

  const handleReject = async (chefId: string, reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/chefs/${chefId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast.success('Chef rejected and deleted');
        fetchChefs();
        setSelectedChef(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to reject chef');
      }
    } catch (error) {
      toast.error('Failed to reject chef');
    }
  };

  const handleDeleteChef = async (chefId: string, chefName: string) => {
    if (!confirm(`Are you sure you want to permanently delete chef "${chefName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/chefs/${chefId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        toast.success('Chef deleted permanently');
        fetchChefs();
        if (selectedChef?._id === chefId) {
          setSelectedChef(null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete chef');
      }
    } catch (error) {
      toast.error('Failed to delete chef');
    }
  };

  const displayChefs = activeTab === 'pending' ? pendingChefs : approvedChefs;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#232323]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white">Loading chefs...</p>
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
              <h1 className="text-2xl font-black text-white">Chef Management</h1>
              <p className="text-gray-400 text-sm mt-1">Review and approve chef registrations</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors relative ${
              activeTab === 'pending'
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Pending Approval
            {pendingChefs.length > 0 && (
              <span className="ml-2 bg-yellow-400 text-[#232323] text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingChefs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'approved'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Approved ({approvedChefs.length})
          </button>
        </div>
      </div>

      {/* Chefs List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayChefs.map((chef) => (
            <div
              key={chef._id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setSelectedChef(chef)}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                  {chef.picture ? (
                    <Image
                      src={chef.picture}
                      alt={chef.name}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">
                      {chef.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1 truncate">
                    {chef.name}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{chef.email}</p>
                  {chef.phone && (
                    <p className="text-xs text-gray-500 mt-1">{chef.phone}</p>
                  )}
                </div>
                {activeTab === 'pending' && (
                  <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                )}
                {activeTab === 'approved' && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Specialization: </span>
                  <span className="text-white">
                    {chef.chefProfile?.specialization?.slice(0, 2).join(', ') || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Experience: </span>
                  <span className="text-white">{chef.chefProfile?.experience || 0} years</span>
                </div>
                <div>
                  <span className="text-gray-400">Service Areas: </span>
                  <span className="text-white">
                    {chef.chefProfile?.location?.serviceAreas?.slice(0, 2).join(', ') || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChef(chef);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChef(chef._id, chef.name);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  title="Delete permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {displayChefs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              {activeTab === 'pending' ? 'No pending chefs' : 'No approved chefs'}
            </p>
          </div>
        )}
      </div>

      {/* Chef Detail Modal */}
      {selectedChef && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Chef Profile</h2>
                <button
                  onClick={() => setSelectedChef(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Name: </span>
                    <span className="text-white font-semibold">{selectedChef.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email: </span>
                    <span className="text-white">{selectedChef.email}</span>
                  </div>
                  {selectedChef.phone && (
                    <div>
                      <span className="text-gray-400">Phone: </span>
                      <span className="text-white">{selectedChef.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Experience: </span>
                    <span className="text-white">{selectedChef.chefProfile?.experience || 0} years</span>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Specialization</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedChef.chefProfile?.specialization?.map((spec, idx) => (
                    <span key={idx} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Service Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedChef.chefProfile?.location?.serviceAreas?.map((area, idx) => (
                    <span key={idx} className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Certifications: </span>
                    <span className="text-white">
                      {selectedChef.chefProfile?.verification?.documents?.certifications?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Experience Letters: </span>
                    <span className="text-white">
                      {selectedChef.chefProfile?.verification?.documents?.experience_letters?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Health Certificate: </span>
                    <span className="text-white">
                      {selectedChef.chefProfile?.verification?.documents?.health_certificate ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {activeTab === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleApprove(selectedChef._id)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejection:');
                      if (reason) {
                        handleReject(selectedChef._id, reason);
                      }
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
