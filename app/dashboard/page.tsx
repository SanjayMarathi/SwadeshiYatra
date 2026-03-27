'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { getCurrentUser, updateCurrentUser, logout } from '@/lib/auth';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [expertise, setExpertise] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);
    setPrice(currentUser.price || 0);
    setLocation(currentUser.location || '');
    // Wait, country doesn't exist on User type in lib/auth.ts (or we didn't see it), let's keep it if we had it but location is there.
    setCountry(''); 
    setExpertise('');
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const updatedUser = updateCurrentUser({
        price: user.role !== 'TOURIST' ? price : undefined,
        location,
      });

      if (!updatedUser) {
        setError('Failed to update profile.');
        setLoading(false);
        return;
      }

      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      setLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (!user) return null;

  return (
    <div className="relative mx-auto mt-10 max-w-4xl px-4">
      <div className="absolute -left-10 -top-8 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl -z-10" />
      <div className="absolute bottom-10 -right-10 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl -z-10" />
      
      <div className="theme-card relative rounded-3xl p-8 shadow-xl border border-orange-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-orange-100 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">{user.role} Dashboard</h1>
            <p className="text-slate-600">Welcome back, <span className="font-semibold text-orange-900">{user.name}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${user.verified ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
              {user.verified ? '✓ Verified Partner' : '⏳ Pending Verification'}
            </span>
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 rounded-full text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 mb-8">
          <h2 className="text-lg font-bold text-orange-900 mb-2">Profile Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-700">
            <div><span className="font-semibold block text-orange-800">Email</span> {user.email}</div>
            <div><span className="font-semibold block text-orange-800">Role</span> {user.role}</div>
            {user.contactNumber && <div><span className="font-semibold block text-orange-800">Contact</span> {user.contactNumber}</div>}
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <h2 className="text-xl font-bold text-orange-900 mb-4">Edit Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-orange-900">City / Location</label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="e.g. Delhi, India"
                required
              />
            </div>

            {user.role !== 'TOURIST' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-orange-900">
                  {user.role === 'HOTEL' ? 'Price per Night (INR)' : user.role === 'GUIDE' ? 'Daily Guide Fee (INR)' : 'Average Meal Cost (INR)'}
                </label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Enter your price"
                  required
                />
              </div>
            )}
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}

          {success && (
            <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700 text-center font-medium">
              Profile updated successfully! ✨
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              className="theme-button w-full sm:w-auto px-8 py-3 rounded-xl font-bold disabled:opacity-50 shadow-md"
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
