'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';
import Link from 'next/link';
import { login } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password, role);
    if (user) {
      window.location.href = '/';
    } else {
      setError('Invalid credentials. Check email, password, and role.');
    }
  };

  return (
    <div className="relative mx-auto mt-16 max-w-lg">
      <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-orange-300/35 blur-2xl" />
      <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-amber-300/35 blur-2xl" />
      <div className="theme-card relative rounded-3xl p-8 shadow-xl">
      <h1 className="mb-2 text-center text-3xl font-bold text-gradient">Login to SwadeshiYatra</h1>
      <p className="mb-6 text-center text-sm text-slate-600">Use your account to continue planning or managing services.</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-orange-900">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300"
            required
            placeholder="tourist@example.com"
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
            placeholder="Enter password"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-orange-900">Login Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-xl border border-orange-200 bg-white p-3 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option className="text-orange-900" value="TOURIST">Tourist</option>
            <option className="text-orange-900" value="HOTEL">Hotel</option>
            <option className="text-orange-900" value="RESTAURANT">Restaurant</option>
            <option className="text-orange-900" value="GUIDE">Guide</option>
          </select>
        </div>
        {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}
        <button 
          type="submit" 
          className="theme-button w-full rounded-xl py-3 font-bold"
        >
          Login
        </button>
        <p className="pt-1 text-center text-sm text-slate-600">
          New user? <Link href="/register" className="font-semibold text-orange-700 hover:underline">Create an account</Link>
        </p>
      </form>
      </div>
    </div>
  );
};

export default LoginPage;
