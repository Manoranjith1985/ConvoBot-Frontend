// src/components/Header.jsx

import { useState, useEffect } from 'react';

export default function Header({ companyName = 'RiteTech AI', logoInitials = 'RT' }) {
  const [username, setUsername] = useState('User');  // Default fallback

  useEffect(() => {
    // Fetch username from localStorage (assuming it's set after login)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Company Name and Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {logoInitials}
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {companyName}
          </h1>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-4">
          <span className="text-gray-600 hidden sm:inline">Welcome, {username}</span>
          <button className="text-sm text-gray-600 hover:text-indigo-600">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}