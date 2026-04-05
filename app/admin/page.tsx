'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types';
import { getCurrentUser, getAllUsers, setUserVerified, setUserRejected, deleteUser } from '@/lib/auth';

type Tab = 'overview' | 'users' | 'verification';

const ROLE_COLORS: Record<UserRole, string> = {
  TOURIST: 'bg-blue-100 text-blue-700 border-blue-200',
  GUIDE: 'bg-purple-100 text-purple-700 border-purple-200',
  HOTEL: 'bg-teal-100 text-teal-700 border-teal-200',
  RESTAURANT: 'bg-pink-100 text-pink-700 border-pink-200',
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
};

const ROLE_ICONS: Record<UserRole, string> = {
  TOURIST: '🧳',
  GUIDE: '🗺️',
  HOTEL: '🏨',
  RESTAURANT: '🍽️',
  ADMIN: '🛡️',
};

const AdminPage = () => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');

  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  const refreshUsers = useCallback(() => {
    setUsers(getAllUsers());
  }, []);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'ADMIN') {
      window.location.href = '/login';
      return;
    }
    setAdmin(currentUser);
    refreshUsers();
  }, [refreshUsers]);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleVerify = (userId: string, verified: boolean) => {
    setUserVerified(userId, verified);
    refreshUsers();
    showFeedback(verified ? '✅ User verified successfully!' : '❌ Verification revoked.');
  };

  const handleReject = (userId: string) => {
    const reason = rejectionReasons[userId] || 'Information provided is insufficient or invalid.';
    setUserRejected(userId, reason);
    setRejectionReasons(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
    refreshUsers();
    showFeedback('🚫 User application rejected with feedback.');
  };

  const handleDelete = (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete "${userName}"? This cannot be undone.`)) return;
    deleteUser(userId);
    refreshUsers();
    showFeedback(`🗑️ "${userName}" has been removed.`);
  };

  const viewDocument = (fileName: string) => {
    alert(`[MOCK VIEW] Opening document: ${fileName}\n\nIn a real production environment, this would open a PDF viewer or download the file from secure storage.`);
  };

  // Stats
  const totalUsers = users.filter((u) => u.role !== 'ADMIN').length;
  const tourists = users.filter((u) => u.role === 'TOURIST');
  const guides = users.filter((u) => u.role === 'GUIDE');
  const hotels = users.filter((u) => u.role === 'HOTEL');
  const restaurants = users.filter((u) => u.role === 'RESTAURANT');
  const pendingVerification = users.filter((u) => u.role !== 'TOURIST' && u.role !== 'ADMIN' && !u.verified);
  const verifiedProviders = users.filter((u) => u.role !== 'TOURIST' && u.role !== 'ADMIN' && u.verified);

  // Filtered users for the table
  const filteredUsers = users
    .filter((u) => u.role !== 'ADMIN')
    .filter((u) => roleFilter === 'ALL' || u.role === roleFilter)
    .filter((u) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.location || '').toLowerCase().includes(q);
    });

  if (!admin) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users', label: 'All Users', icon: '👥' },
    { key: 'verification', label: 'Verification', icon: '✅' },
  ];

  return (
    <div className="relative mx-auto mt-6 max-w-6xl px-4 pb-10">
      {/* Background flares */}
      <div className="absolute -left-20 -top-10 h-56 w-56 rounded-full bg-orange-300/20 blur-3xl -z-10" />
      <div className="absolute bottom-20 -right-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl -z-10" />

      {/* Header */}
      <div className="theme-card rounded-3xl p-6 shadow-xl border border-orange-100 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">🛡️ Admin Panel</h1>
            <p className="text-slate-600 mt-1">Manage users, verify service providers, and monitor the platform.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
              Signed in as {admin.name}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback toast */}
      {actionFeedback && (
        <div className="fixed top-24 right-6 z-50 bg-white border border-orange-200 shadow-2xl rounded-2xl px-6 py-3 text-sm font-semibold text-orange-900 animate-slide-in">
          {actionFeedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow-md'
                : 'bg-white text-orange-800 border-orange-200 hover:bg-orange-50'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
            {tab.key === 'verification' && pendingVerification.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingVerification.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: totalUsers, color: 'from-orange-400 to-red-500', icon: '👥' },
              { label: 'Tourists', value: tourists.length, color: 'from-blue-400 to-blue-600', icon: '🧳' },
              { label: 'Service Providers', value: guides.length + hotels.length + restaurants.length, color: 'from-purple-400 to-purple-600', icon: '⚡' },
              { label: 'Pending Verification', value: pendingVerification.length, color: 'from-yellow-400 to-orange-500', icon: '⏳' },
            ].map((stat) => (
              <div key={stat.label} className="theme-card rounded-2xl p-5 border border-orange-100 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Role breakdown */}
          <div className="theme-card rounded-2xl p-6 border border-orange-100 shadow-md">
            <h2 className="text-xl font-bold text-orange-900 mb-4">Role Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { role: 'TOURIST' as UserRole, count: tourists.length },
                { role: 'GUIDE' as UserRole, count: guides.length },
                { role: 'HOTEL' as UserRole, count: hotels.length },
                { role: 'RESTAURANT' as UserRole, count: restaurants.length },
              ].map((item) => (
                <div key={item.role} className="flex items-center gap-3 bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                  <span className="text-2xl">{ROLE_ICONS[item.role]}</span>
                  <div>
                    <p className="text-lg font-bold text-orange-900">{item.count}</p>
                    <p className="text-xs text-slate-500 font-semibold">{item.role}S</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="theme-card rounded-2xl p-6 border border-green-100 shadow-md">
              <h3 className="text-lg font-bold text-green-800 mb-2">✅ Verified Providers</h3>
              <p className="text-4xl font-black text-green-600">{verifiedProviders.length}</p>
              <p className="text-sm text-slate-500 mt-1">Approved and active on the platform</p>
            </div>
            <div className="theme-card rounded-2xl p-6 border border-yellow-100 shadow-md">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">⏳ Pending Approval</h3>
              <p className="text-4xl font-black text-yellow-600">{pendingVerification.length}</p>
              <p className="text-sm text-slate-500 mt-1">Awaiting admin review</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── ALL USERS ────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="theme-card rounded-2xl p-4 border border-orange-100 shadow-md flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or location..."
              className="flex-1 rounded-xl border border-orange-200 bg-white/90 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="rounded-xl border border-orange-200 bg-white p-3 text-sm text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option value="ALL">All Roles</option>
              <option value="TOURIST">Tourist</option>
              <option value="GUIDE">Guide</option>
              <option value="HOTEL">Hotel</option>
              <option value="RESTAURANT">Restaurant</option>
            </select>
          </div>

          {/* Users table */}
          <div className="theme-card rounded-2xl border border-orange-100 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50 border-b border-orange-100">
                    <th className="text-left p-4 font-bold text-orange-900">User</th>
                    <th className="text-left p-4 font-bold text-orange-900">Role</th>
                    <th className="text-left p-4 font-bold text-orange-900 hidden md:table-cell">Location</th>
                    <th className="text-center p-4 font-bold text-orange-900">Status</th>
                    <th className="text-center p-4 font-bold text-orange-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-slate-400 font-medium">No users found matching your filters.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-orange-50 hover:bg-orange-50/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold text-orange-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[u.role]}`}>
                            {ROLE_ICONS[u.role]} {u.role}
                          </span>
                        </td>
                        <td className="p-4 hidden md:table-cell text-slate-600">
                          {u.location || '—'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${u.verified ? 'bg-green-100 text-green-700' : u.rejectionReason ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {u.verified ? '✓ Verified' : u.rejectionReason ? '🚫 Rejected' : '⏳ Pending'}
                            </span>
                            {u.rejectionReason && <p className="text-[10px] text-red-500 mt-1 max-w-[120px] truncate" title={u.rejectionReason}>Reason: {u.rejectionReason}</p>}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {u.role !== 'TOURIST' && (
                              <button
                                onClick={() => handleVerify(u.id, !u.verified)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                  u.verified
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {u.verified ? 'Revoke' : 'Verify'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-orange-50/50 px-4 py-3 border-t border-orange-100 text-xs text-slate-500 font-medium">
              Showing {filteredUsers.length} of {totalUsers} users
            </div>
          </div>
        </div>
      )}

      {/* ─── VERIFICATION ─────────────────────────────────────────── */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          {pendingVerification.length === 0 ? (
            <div className="theme-card rounded-2xl p-10 border border-green-100 shadow-md text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <h2 className="text-xl font-bold text-green-700 mb-2">All Clear!</h2>
              <p className="text-slate-500">No pending verifications. All service providers are verified.</p>
            </div>
          ) : (
            <>
              <div className="theme-card rounded-2xl p-4 border border-orange-100 shadow-md">
                <p className="text-sm font-semibold text-orange-900">
                  <span className="text-lg mr-1">⏳</span>
                  {pendingVerification.length} service provider{pendingVerification.length > 1 ? 's' : ''} awaiting your verification.
                </p>
              </div>

              {pendingVerification.map((u) => (
                <div key={u.id} className="theme-card rounded-2xl p-6 border border-yellow-100 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{ROLE_ICONS[u.role]}</span>
                        <div>
                          <h3 className="text-lg font-bold text-orange-900">{u.name}</h3>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                          <span className="font-bold text-orange-800 block text-xs mb-1">📍 Location</span>
                          <span className="text-slate-700">{u.location || 'Not specified'}</span>
                        </div>
                        <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                          <span className="font-bold text-orange-800 block text-xs mb-1">📞 Contact</span>
                          <span className="text-slate-700">{u.contactNumber || 'Not specified'}</span>
                        </div>
                        
                        {u.nationalIdDocument && (
                          <button 
                            onClick={() => viewDocument(u.nationalIdDocument!)}
                            className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-200 hover:border-orange-400 transition-colors group"
                          >
                            <div>
                              <span className="font-bold text-orange-800 block text-xs mb-0.5 text-left">🪪 National ID</span>
                              <span className="text-slate-600 text-xs truncate max-w-[120px]">{u.nationalIdDocument}</span>
                            </div>
                            <span className="text-orange-400 group-hover:text-orange-600">👁️</span>
                          </button>
                        )}
                        
                        {u.licenseDocument && (
                          <button 
                            onClick={() => viewDocument(u.licenseDocument!)}
                            className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-200 hover:border-orange-400 transition-colors group"
                          >
                            <div>
                              <span className="font-bold text-orange-800 block text-xs mb-0.5 text-left">📄 Authorized License</span>
                              <span className="text-slate-600 text-xs truncate max-w-[120px]">{u.licenseDocument}</span>
                            </div>
                            <span className="text-orange-400 group-hover:text-orange-600">👁️</span>
                          </button>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Rejection Feedback (Optional)</label>
                        <textarea
                          placeholder="Explain why the application is being rejected..."
                          value={rejectionReasons[u.id] || ''}
                          onChange={(e) => setRejectionReasons({ ...rejectionReasons, [u.id]: e.target.value })}
                          className="w-full rounded-xl border border-orange-100 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 min-h-[80px]"
                        />
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 w-full lg:w-48">
                      <button
                        onClick={() => handleVerify(u.id, true)}
                        className="flex-1 lg:w-full px-5 py-3 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        className="flex-1 lg:w-full px-5 py-3 rounded-xl font-bold text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
