'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';

const LoginPage = () => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [expertise, setExpertise] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const endpoint = mode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          location,
          country,
          price: role === 'GUIDE' ? price : undefined,
          expertise: role === 'GUIDE' ? expertise : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Authentication failed');
      } else {
        setSuccess(mode === 'LOGIN' ? 'Login successful' : 'Registration successful');
        window.location.href = role === 'GUIDE' ? '/dashboard' : '/planner';
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-blue-100 text-blue-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">SwadeshiYatra Access</h1>
      <div className="grid grid-cols-2 gap-2 mb-6">
        <button onClick={() => setMode('LOGIN')} className={`py-2 rounded-lg font-semibold ${mode === 'LOGIN' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Login</button>
        <button onClick={() => setMode('REGISTER')} className={`py-2 rounded-lg font-semibold ${mode === 'REGISTER' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>Register</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'REGISTER' && (
          <div>
            <label className="block text-sm font-medium text-blue-800 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-800 mb-1">Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="TOURIST">Tourist</option>
            <option value="GUIDE">Guide</option>
          </select>
        </div>
        {mode === 'REGISTER' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">City in India</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            {role === 'GUIDE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Price per day (INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-1">Expertise</label>
                  <input
                    type="text"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    className="w-full p-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}
          </>
        )}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Please wait...' : mode === 'LOGIN' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
