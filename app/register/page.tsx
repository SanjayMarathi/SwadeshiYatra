'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types';
import { register } from '@/lib/auth';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [contactNumber, setContactNumber] = useState('');
  const [nationalIdDocument, setNationalIdDocument] = useState('');
  const [licenseDocument, setLicenseDocument] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [features, setFeatures] = useState('');
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = register({
      name,
      email,
      password,
      role,
      location: location || undefined,
      latitude,
      longitude,
      contactNumber: contactNumber || undefined,
      nationalIdDocument: nationalIdDocument || undefined,
      licenseDocument: licenseDocument || undefined,
      price: role !== 'TOURIST' ? price : undefined,
      features: role === 'HOTEL' || role === 'RESTAURANT' ? features.split(',').map((item) => item.trim()).filter(Boolean) : undefined,
    });

    if (result.error) {
      setError(result.error);
      return;
    }

    window.location.href = role === 'TOURIST' ? '/planner' : '/dashboard';
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Location access is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      },
      () => setError('Unable to fetch current location. Please allow location permission.')
    );
  };

  return (
    <div className="relative mx-auto mt-16 max-w-xl">
      <div className="absolute -left-10 -top-8 h-28 w-28 rounded-full bg-orange-300/35 blur-2xl" />
      <div className="absolute -bottom-8 -right-10 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl" />
      <div className="theme-card relative rounded-3xl p-8 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-gradient">Create your account</h1>
        <p className="mb-6 text-center text-sm text-slate-600">Register as a tourist or service provider in one step.</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-900">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-900">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-orange-900">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-orange-200 bg-white p-3 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              <option className="text-orange-900" value="TOURIST">Tourist</option>
              <option className="text-orange-900" value="GUIDE">Guide</option>
              <option className="text-orange-900" value="HOTEL">Hotel</option>
              <option className="text-orange-900" value="RESTAURANT">Restaurant</option>
            </select>
          </div>

          {role !== 'TOURIST' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="City or lat,long"
                    required
                  />
                  <button type="button" onClick={detectLocation} className="theme-button-secondary rounded-xl px-3 py-2 text-sm font-semibold">
                    Use Location
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">National ID Card</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setNationalIdDocument(e.target.files?.[0]?.name || '')}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-orange-900">Authorized License</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setLicenseDocument(e.target.files?.[0]?.name || '')}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
            </>
          )}

          {role !== 'TOURIST' && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">
                {role === 'HOTEL' ? 'Price per Night (INR)' : role === 'GUIDE' ? 'Guide Fee per Day (INR)' : 'Average Price (INR)'}
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
            </div>
          )}

          {(role === 'HOTEL' || role === 'RESTAURANT') && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Features (comma separated)</label>
              <input
                type="text"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="WiFi, AC, Veg"
                required
              />
            </div>
          )}

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" className="theme-button w-full rounded-xl py-3 font-bold">
            Register
          </button>

          <p className="text-center text-sm text-slate-600">
            Already have an account? <Link href="/login" className="font-semibold text-orange-700 hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
