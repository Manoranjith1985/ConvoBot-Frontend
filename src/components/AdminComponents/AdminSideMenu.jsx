// src/components/AdminSideMenu.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, FileText,
  ChevronDown, Stethoscope, FileBarChart, Database
} from 'lucide-react';

const AdminSideMenu = ({
  role = 'Clinic Admin',
  clinicName = 'Chennai Clinic',
  location = 'Chennai'
}) => {
  const locationHook = useLocation();

  const [staffOpen, setStaffOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);

  // Consistent Teal Theme
  const primaryColor ="#0d9488";

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        e.preventDefault();
        const menuItems = document.querySelectorAll('[data-menu-index]');
        const target = menuItems[num - 1];
        if (target) target.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');
  const isSuperAdmin = role === 'Super Admin';

  const isActive = (path) => {
    if (path === '/clinic-admin') {
      return locationHook.pathname === '/clinic-admin' || locationHook.pathname === '/';
    }
    return locationHook.pathname.startsWith(path);
  };

  const activeClass = `text-white bg-[var(--primary-color)]`;
  const inactiveClass = `text-gray-700 hover:bg-gray-50`;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-2xl border-r flex flex-col z-50 overflow-y-auto">

      {/* Logo & Brand */}
      <div className="p-6 border-b flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: primaryColor }}
        >
          C
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ConvoBot Clinic</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">

        {/* Dashboard */}
        {/* Dashboard - Updated with your requested colors */}
        <Link
          to="/clinic-admin"
          data-menu-index="1"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${
            isActive('/clinic-admin')
              ? 'bg-[#0d9488] text-white'           // Active = bg-teal-800 (#115e59)
              : inactiveClass  // Hover  = bg-teal-600 (#0d9488)
          }`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </Link>

        {/* Staff Dropdown */}
        <div>
          <button
            onClick={() => setStaffOpen(!staffOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
            data-menu-index="2"
          >
            <div className="flex items-center gap-3">
              <Users size={20} /> Staff
            </div>
            <ChevronDown className={`transition-transform ${staffOpen ? 'rotate-180' : ''}`} size={20} />
          </button>

          {staffOpen && (
            <div className="ml-9 mt-1 space-y-1 border-l border-gray-100 pl-6">
              <Link to="/admin-doctors" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/admin-doctors') ? activeClass : inactiveClass}`}>
                <Stethoscope size={18} /> Doctors
              </Link>
              <Link to="/support-staff" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/support-staff') ? activeClass : inactiveClass}`}>
                Support Staff
              </Link>
              <Link to="/nurses" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/nurses') ? activeClass : inactiveClass}`}>
                Nurses
              </Link>
              <Link to="/lab-technicians" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/lab-technicians') ? activeClass : inactiveClass}`}>
                Lab Technicians
              </Link>
            </div>
          )}
        </div>

        {/* Schedules */}
        <Link to="/admin-schedules" data-menu-index="3" className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${isActive('/admin-schedules') ? activeClass : inactiveClass}`}>
          <Calendar size={20} /> Schedules
        </Link>

        {/* Patients */}
        <Link to="/admin-patients" data-menu-index="4" className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${isActive('/admin-patients') ? activeClass : inactiveClass}`}>
          <Users size={20} /> Patients
        </Link>

        {/* Clinic Documents */}
        <Link to="/admin-documents" data-menu-index="5" className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-colors ${isActive('/admin-documents') ? activeClass : inactiveClass}`}>
          <FileText size={20} /> Clinic Documents
        </Link>

        {/* Reports Dropdown */}
        <div>
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
            data-menu-index="6"
          >
            <div className="flex items-center gap-3">
              <FileBarChart size={20} /> Reports
            </div>
            <ChevronDown className={`transition-transform ${reportsOpen ? 'rotate-180' : ''}`} size={20} />
          </button>

          {reportsOpen && (
            <div className="ml-9 mt-1 space-y-1 border-l border-gray-100 pl-6">
              <Link to="/admin-reports" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/admin-reports') ? activeClass : inactiveClass}`}>
                Reports
              </Link>
              <Link to="/admin-trails" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/admin-trails') ? activeClass : inactiveClass}`}>
                Audit Trails
              </Link>
              <Link to="/admin-masters" className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl transition-colors ${isActive('/admin-masters') ? activeClass : inactiveClass}`}>
                Master Lists
              </Link>
            </div>
          )}
        </div>

        {/* Masters – Super Admin only */}
        {isSuperAdmin && (
          <div>
            <button
              onClick={() => setMastersOpen(!mastersOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
              data-menu-index="7"
            >
              <div className="flex items-center gap-3">
                <Database size={20} /> Masters
              </div>
              <ChevronDown className={`transition-transform ${mastersOpen ? 'rotate-180' : ''}`} size={20} />
            </button>
          </div>
        )}

      </nav>

      {/* Footer */}
      <div className="p-6 border-t text-xs text-gray-500 mt-auto">
        {location} • {formattedDate}
      </div>
    </div>
  );
};

export default AdminSideMenu;