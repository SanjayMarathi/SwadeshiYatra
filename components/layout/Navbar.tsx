'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';
import { getCurrentUser, logout } from '@/lib/auth';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const parsedUser = getCurrentUser();
    if (parsedUser) {
      queueMicrotask(() => setUser(parsedUser));
    }
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-orange-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold text-gradient">SwadeshiYatra</Link>
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-orange-900 hover:bg-orange-100">Home</Link>
          <Link href="/planner" className="rounded-full px-4 py-2 text-sm font-semibold text-orange-900 hover:bg-orange-100">Trip Planner</Link>
          {user ? (
            <>
              {user.role !== 'TOURIST' && (
                <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-orange-900 hover:bg-orange-100">Dashboard</Link>
              )}
              <span className="hidden rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-900 md:block">Hello, {user.name} ({user.role})</span>
              <button 
                onClick={handleLogout} 
                className="rounded-full bg-orange-500 px-4 py-2 text-white transition hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="theme-button-secondary rounded-full px-4 py-2 text-sm font-semibold">Login</Link>
              <Link href="/register" className="theme-button rounded-full px-5 py-2 font-semibold">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
