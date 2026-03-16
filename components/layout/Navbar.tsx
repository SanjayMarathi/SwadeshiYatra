'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/types';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      queueMicrotask(() => setUser(parsedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center fixed w-full top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-blue-600">SwadeshiYatra</Link>
      <div className="flex gap-6 items-center">
        <Link href="/" className="hover:text-blue-500">Home</Link>
        <Link href="/planner" className="hover:text-blue-500">Trip Planner</Link>
        {user ? (
          <>
            {user.role !== 'TOURIST' && (
              <Link href="/dashboard" className="hover:text-blue-500">Dashboard</Link>
            )}
            <span className="text-gray-600">Hello, {user.name} ({user.role})</span>
            <button 
              onClick={logout} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
