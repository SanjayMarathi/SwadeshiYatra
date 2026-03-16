'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      queueMicrotask(() => {
        setUser(parsedUser);
        setPrice(parsedUser.price || 0);
        setFeatures(parsedUser.features?.join(', ') || '');
      });
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser: User = {
      ...user,
      price,
      features: features.split(',').map(f => f.trim()),
      verified: true, // Mock verification logic
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{user.role} Dashboard</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {user.verified ? '✓ Verified' : 'Pending Verification'}
          </span>
        </div>

        <p className="text-gray-600 mb-8">Welcome, {user.name}. Manage your business details below to attract more travelers.</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          {(user.role === 'HOTEL' || user.role === 'GUIDE') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {user.role === 'HOTEL' ? 'Price per Night (INR)' : 'Price per Day (INR)'}
              </label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your price"
              />
            </div>
          )}

          {(user.role === 'HOTEL' || user.role === 'RESTAURANT') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Features / Amenities (Comma separated)</label>
              <textarea 
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="e.g. WiFi, Pool, Parking, Veg Only, AC"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification Documents</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 hover:border-blue-400 transition cursor-pointer">
              Click to upload ID proof / Business License
            </div>
          </div>

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center animate-bounce">
              Profile updated and verified successfully!
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
