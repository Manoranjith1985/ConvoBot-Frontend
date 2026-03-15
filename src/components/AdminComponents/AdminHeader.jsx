// src/components/AdminHeader.jsx
import React, { useEffect, useState } from 'react';
import { Bell, User, LogOut, Download, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({
  user = {
    name: 'Admin User',
    clinicName: 'Chennai Clinic',
    clinicLogoUrl: null,
  },
  primaryColor = '#7c3aed',
  onDownloadExcel,
  notificationCount = 0,
  currentRole,           // passed from parent / context
  onRoleChange           // callback to change role (temporary)
}) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole || 'Clinic Admin');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false);
      if (e.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
    // For testing: persist in localStorage
    localStorage.setItem('tempRole', newRole);
  };

  const handleLogout = () => {
    // TODO: real logout
    navigate('/select-role');
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');

  return (
    <>
      <header
        className="bg-white border-b h-16 px-6 md:px-8 flex items-center justify-between shadow-sm"
        style={{ borderColor: 'var(--primary-color)' }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          {user.clinicLogoUrl ? (
            <img src={user.clinicLogoUrl} alt="Clinic logo" className="h-9 w-auto object-contain" />
          ) : (
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {user.clinicName?.[0] || 'C'}
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
            Clinic Administration
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 md:gap-7">
          {/* Date */}
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <span>{formattedDate}</span>
          </div>

          {/* Temporary Role Selector – for testing only */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="bg-gray-100 border border-gray-300 text-gray-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="Clinic Admin">Clinic Admin</option>
              <option value="Group Admin">Group Admin</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={22} className="text-gray-600" />
            {notificationCount > 0 && (
              <span
                className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {/* Export */}
          <button
            onClick={() => onDownloadExcel?.()}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            disabled={!onDownloadExcel}
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">
                {selectedRole} • {user.clinicName}
              </p>
            </div>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-lg shadow-sm"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              {user.name?.[0] || 'A'}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">
              You are about to log out as <strong>{selectedRole}</strong>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminHeader;