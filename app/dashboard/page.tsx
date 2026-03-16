'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, updateCurrentUser } from '@/lib/auth';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState<string>('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nationalIdDocument, setNationalIdDocument] = useState('');
  const [licenseDocument, setLicenseDocument] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const parsedUser = getCurrentUser();
    if (parsedUser) {
      queueMicrotask(() => {
        setUser(parsedUser);
        setPrice(parsedUser.price || 0);
        setFeatures(parsedUser.features?.join(', ') || '');
        setLocation(parsedUser.location || '');
        setContactNumber(parsedUser.contactNumber || '');
        setNationalIdDocument(parsedUser.nationalIdDocument || '');
        setLicenseDocument(parsedUser.licenseDocument || '');
        setLatitude(parsedUser.latitude);
        setLongitude(parsedUser.longitude);
      });
    } else {
      window.location.href = '/login';
    }
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedUser = updateCurrentUser({
      price,
      features: features.split(',').map(f => f.trim()),
      location,
      contactNumber,
      nationalIdDocument,
      licenseDocument,
      latitude,
      longitude,
      verified: true, // Mock verification logic
    });
    if (!updatedUser) return;
    setUser(updatedUser);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
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
    <div className="relative mx-auto max-w-3xl py-10">
      <div className="absolute -left-12 top-20 h-36 w-36 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="absolute -right-12 top-8 h-36 w-36 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="theme-card relative rounded-3xl p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <h1 className="text-3xl font-bold text-gradient">{user.role} Dashboard</h1>
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${user.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {user.verified ? '✓ Verified' : 'Pending Verification'}
          </span>
        </div>

        <p className="mb-8 rounded-2xl bg-white/70 px-4 py-3 text-slate-700">Welcome, {user.name}. Manage your business details below to attract more travelers.</p>

        <form onSubmit={handleUpdate} className="space-y-6">
          {user.role !== 'TOURIST' && (
            <div>
            <label className="mb-1 block text-sm font-semibold text-orange-900">
                {user.role === 'HOTEL' ? 'Price per Night (INR)' : user.role === 'GUIDE' ? 'Guide Fee per Day (INR)' : 'Average Price (INR)'}
              </label>
              <input 
                type="number" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Enter your price"
              />
            </div>
          )}

          {user.role !== 'TOURIST' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Contact Number</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Enter your contact number"
              />
            </div>
          )}

          {user.role !== 'TOURIST' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Business Location</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="City or lat,long"
                />
                <button type="button" onClick={detectLocation} className="theme-button-secondary rounded-xl px-3 py-2 text-sm font-semibold">
                  Use Location
                </button>
              </div>
            </div>
          )}

          {(user.role === 'HOTEL' || user.role === 'RESTAURANT') && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Features / Amenities (Comma separated)</label>
              <textarea 
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="min-h-[100px] w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="e.g. WiFi, Pool, Parking, Veg Only, AC"
              />
            </div>
          )}

          {user.role !== 'TOURIST' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">National ID Card</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNationalIdDocument(e.target.files?.[0]?.name || nationalIdDocument)}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {nationalIdDocument && <p className="mt-1 text-xs text-slate-500">Current: {nationalIdDocument}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">Authorized License</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setLicenseDocument(e.target.files?.[0]?.name || licenseDocument)}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
                {licenseDocument && <p className="mt-1 text-xs text-slate-500">Current: {licenseDocument}</p>}
              </div>
            </>
          )}

          {success && (
            <div className="animate-fadeIn rounded-xl bg-emerald-100 p-3 text-center text-emerald-700">
              Profile updated and verified successfully!
            </div>
          )}

          <button 
            type="submit" 
            className="theme-button w-full rounded-xl py-3 font-bold"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
