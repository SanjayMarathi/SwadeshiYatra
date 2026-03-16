'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';

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
    const load = async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        window.location.href = '/login';
        return;
      }
      const data = await res.json();
      const currentUser = data.user as User;
      setUser(currentUser);
      setPrice(currentUser.price || 0);
      setLocation(currentUser.location || '');
      setCountry(currentUser.country || '');
      setExpertise(currentUser.expertise || '');
    };
    load();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: user.role === 'GUIDE' ? price : undefined,
        location,
        country,
        expertise: user.role === 'GUIDE' ? expertise : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || 'Failed to update profile.');
      setLoading(false);
      return;
    }
    setUser(data.user);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
    setLoading(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-blue-100 text-blue-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">{user.role} Dashboard</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {user.verified ? '✓ Verified' : 'Pending Verification'}
          </span>
        </div>

        <p className="text-blue-800/80 mb-8">Welcome, {user.name}. Update your city, country and guide details for better matching in planner.</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">City in India</label>
              <input 
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Delhi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Country</label>
              <input 
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. India"
                required
              />
            </div>
          </div>

          {user.role === 'GUIDE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Price per Day (INR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your guide price"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Expertise</label>
                <input 
                  type="text" 
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Heritage tours, food trails, etc."
                  required
                />
              </div>
            </div>
          )}

          {error && <div className="text-red-600 text-sm">{error}</div>}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center">
              Profile updated successfully.
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
