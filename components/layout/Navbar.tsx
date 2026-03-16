'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme-mode') === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const loadUser = async () => {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user as User);
    };
    loadUser();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-mode', theme);
  }, [theme]);

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      window.location.href = '/login';
    });
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <nav className="bg-white/95 text-red-900 shadow-md border-b border-orange-100 p-4 flex justify-between items-center fixed w-full top-0 z-50">
      <Link href="/" className="text-2xl font-black tracking-tight text-red-700">SwadeshiYatra</Link>
      <div className="flex gap-6 items-center">
        <Link href="/" className="hover:text-red-600">Home</Link>
        <Link href="/planner" className="hover:text-red-600">Trip Planner</Link>
        <button onClick={toggleTheme} className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 hover:bg-yellow-100 transition">
          {theme === 'dark' ? 'White Mode' : 'Black Mode'}
        </button>
        {user ? (
          <>
            {user.role !== 'TOURIST' && (
              <Link href="/dashboard" className="hover:text-red-600">Dashboard</Link>
            )}
            <span className="text-red-700">Hello, {user.name} ({user.role})</span>
            <button 
              onClick={logout} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700">Login / Register</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
