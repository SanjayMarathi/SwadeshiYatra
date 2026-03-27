'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types';
import { login, getAdminCredentials } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = login(email, password, role);

      if (!user) {
        setError('Invalid email, password, or role.');
        setLoading(false);
        return;
      }

      window.location.href = role === 'TOURIST' ? '/planner' : '/dashboard';
    }, 500);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');

    setTimeout(() => {
      const adminCreds = getAdminCredentials();
      const user = login(adminCreds.email, adminPassword, adminCreds.role);

      if (!user) {
        setAdminError('Incorrect admin password.');
        setAdminLoading(false);
        return;
      }

      window.location.href = '/admin';
    }, 500);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">

      {/* Full-page travel mural background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/travel-mural-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,247,237,0.75) 0%, rgba(255,237,213,0.65) 40%, rgba(254,243,199,0.70) 100%)' }} />

      {/* Animated gradient accents */}
      <div className="absolute top-0 left-0 w-[50vw] h-[50vh] rounded-full opacity-20 animate-pulse" style={{ background: 'radial-gradient(circle at 30% 30%, #F97316, transparent 70%)', animationDuration: '5s' }} />
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vh] rounded-full opacity-15 animate-pulse" style={{ background: 'radial-gradient(circle at 70% 70%, #DC2626, transparent 70%)', animationDuration: '6s' }} />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div
          className="bg-white/85 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-orange-200/40"
          style={{ boxShadow: '0 30px 80px rgba(249,115,22,0.18), 0 8px 30px rgba(0,0,0,0.1)' }}
        >
          {/* Logo & heading */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🇮🇳</div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              SwadeshiYatra
            </h1>
            <p className="mt-1 text-sm text-slate-500">Login to explore the beauty of India</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
                required
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-orange-200 bg-white/90 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-orange-900">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-orange-200 bg-white p-3 text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-shadow"
              >
                <option value="TOURIST">🧳 Tourist</option>
                <option value="GUIDE">🗺️ Guide</option>
                <option value="HOTEL">🏨 Hotel</option>
                <option value="RESTAURANT">🍽️ Restaurant</option>
              </select>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #EA580C, #DC2626)' }}
            >
              {loading ? 'Logging in...' : 'Login →'}
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-orange-200/60" />
              <span className="text-xs text-slate-400 font-medium">or</span>
              <div className="flex-1 h-px bg-orange-200/60" />
            </div>

            <button
              type="button"
              onClick={() => {
                const user = login('tourist@example.com', 'tourist123', 'TOURIST');
                if (user) window.location.href = '/planner';
              }}
              className="w-full rounded-xl py-3 font-bold text-orange-700 bg-orange-50 border border-orange-200 shadow-sm transition-all duration-300 hover:bg-orange-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue as Guest 🧳
            </button>

            <p className="mt-4 text-center text-sm text-slate-600">
              Don&apos;t have an account? <Link href="/register" className="font-semibold text-orange-700 hover:underline">Create one</Link>
            </p>
          </form>
        </div>
      </div>

      {/* Small admin icon — bottom right corner */}
      <button
        type="button"
        onClick={() => { setShowAdminModal(true); setAdminPassword(''); setAdminError(''); }}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-white/50 hover:bg-white/80 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all duration-200 shadow-sm hover:shadow-md z-40 backdrop-blur-sm border border-slate-200/50"
        title="Admin Access"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Admin password modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-lg">🛡️</div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Admin Access</h2>
                <p className="text-xs text-slate-500">Enter admin password to continue</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300"
                  placeholder="Enter admin password"
                  required
                  minLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showAdminPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {adminError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{adminError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-md"
                >
                  {adminLoading ? 'Verifying...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
