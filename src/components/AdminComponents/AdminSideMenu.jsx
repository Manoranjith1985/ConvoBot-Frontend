// src/components/AdminSideMenu.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, DollarSign, FileText, Settings,
  ChevronDown, Stethoscope, UserCog, Bed, TrendingUp, FileBarChart,
  HardDrive, Database, Activity, ShieldCheck
} from 'lucide-react';

const AdminSideMenu = ({
  role = 'Clinic Admin',           // 'Super Admin' | 'Group Admin' | 'Clinic Admin'
  primaryColor = '#7c3aed',        // clinic theme color
  clinicName = 'Chennai Clinic',
  location = 'Chennai'
}) => {
  const navigate = useNavigate();
  const [staffOpen, setStaffOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(false);

  // Apply dynamic theme color
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  // Keyboard shortcuts: 1–9 for top-level menu items
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
  const formattedDate = today.toLocaleDateString('en-GB'); // DD/MM/YYYY

  const isSuperAdmin = role === 'Super Admin';

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-2xl border-r flex flex-col z-50 overflow-y-auto">
      {/* Logo & Brand */}
      <div className="p-6 border-b flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          C
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ConvoBot Clinic</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {/* Dashboard */}
        <Link
          to="/clinic-admin"
          data-menu-index="1"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium hover:bg-[var(--primary-color)]/5 transition-colors"
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
              <Link
                to="/admin-doctors"
                className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700"
              >
                <Stethoscope size={18} /> Doctors
              </Link>
              <Link
                to="/support-staff"
                className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700"
              >
                Support Staff
              </Link>
              <Link
                to="/nurses"
                className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700"
              >
                Nurses
              </Link>
              <Link
                to="/lab-technicians"
                className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700"
              >
                Lab Technicians
              </Link>
            </div>
          )}
        </div>

        {/* Schedules */}
        <Link
          to="/admin-schedules"
          data-menu-index="3"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
        >
          <Calendar size={20} /> Schedules
        </Link>

        {/* Patients Dashboard */}
        <Link
          to="/admin-patients"
          data-menu-index="4"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
        >
          <Users size={20} /> Patients
        </Link>

        {/* Reports Dropdown */}
        <div>
          <button
            onClick={() => setReportsOpen(!reportsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 font-medium"
            data-menu-index="5"
          >
            <div className="flex items-center gap-3">
              <FileBarChart size={20} /> Reports
            </div>
            <ChevronDown className={`transition-transform ${reportsOpen ? 'rotate-180' : ''}`} size={20} />
          </button>

          {reportsOpen && (
            <div className="ml-9 mt-1 space-y-1 border-l border-gray-100 pl-6">
              <Link to="admin-reports" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                Reports
              </Link>
              <Link to="admin-trails" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                Audit Trails
              </Link>
              <Link to="admin-masters" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
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
              data-menu-index="6"
            >
              <div className="flex items-center gap-3">
                <Database size={20} /> Masters
              </div>
              <ChevronDown className={`transition-transform ${mastersOpen ? 'rotate-180' : ''}`} size={20} />
            </button>

            {/* {mastersOpen && (
              <div className="ml-9 mt-1 space-y-1 border-l border-gray-100 pl-6">
                <Link to="/masters/providers" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Providers
                </Link>
                <Link to="/masters/clinicians" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Clinicians
                </Link>
                <Link to="/masters/cpt" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  CPT Services
                </Link>
                <Link to="/masters/icd" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  ICD
                </Link>
                <Link to="/masters/pricelists" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Pricelists
                </Link>
                <Link to="/masters/receivers" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Receivers
                </Link>
                <Link to="/masters/payers" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Payers
                </Link>
                <Link to="/masters/networks" className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl hover:bg-gray-50 text-gray-700">
                  Networks
                </Link>
              </div>
            )} */}
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