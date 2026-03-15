// src/components/OPHeader.jsx
import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OPHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: real logout logic (clear token, redirect to login)
    if (window.confirm("Are you sure you want to log out?")) {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white h-16 px-6 md:px-8 flex items-center justify-between border-b border-gray-200 shadow-sm">
      {/* Left side - Title & optional back button */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            OP
          </div>
          <h2 className="text-xl font-semibold text-teal-800">Outpatient Reception</h2>
        </div>
      </div>

      {/* Right side - Notifications, User, Logout */}
      <div className="flex items-center gap-5 md:gap-7">
        {/* Notifications */}
        <button 
          className="relative p-2 hover:bg-teal-50 rounded-full transition-colors"
          onClick={() => navigate('/notifications')} // or open dropdown later
          title="Notifications"
        >
          <Bell size={22} className="text-teal-700" />
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
            3
          </span>
        </button>

        {/* User info */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium text-gray-900">Reception Desk</p>
            <p className="text-xs text-gray-500">Front Office • Vijayawada Clinic</p>
          </div>
          <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-semibold border-2 border-teal-200">
            RD
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="hidden md:inline font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default OPHeader;