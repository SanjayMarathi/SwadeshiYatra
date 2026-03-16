'use client';

import React, { useState } from 'react';
import { UserRole } from '@/types';
import { login } from '@/lib/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, role);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } else {
      setError('Invalid email or role. Try tourist@example.com / TOURIST');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Login to SwadeshiYatra</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            required
            placeholder="tourist@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Login Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="TOURIST">Tourist</option>
            <option value="HOTEL">Hotel</option>
            <option value="RESTAURANT">Restaurant</option>
            <option value="GUIDE">Guide</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
      <div className="mt-6 border-t pt-4">
        <h2 className="text-sm font-semibold mb-2 text-gray-600">Mock Accounts:</h2>
        <ul className="text-xs text-gray-500">
          <li>tourist@example.com (TOURIST)</li>
          <li>hotel@example.com (HOTEL)</li>
          <li>restaurant@example.com (RESTAURANT)</li>
          <li>guide@example.com (GUIDE)</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;
