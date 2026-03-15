// src/components/OPSideMenu.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Stethoscope, Calendar, Clock, 
  FileText, Settings, ChevronRight, Activity 
} from 'lucide-react';

const OPSideMenu = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/op-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/op-patients', label: 'Patients', icon: Users },
    { path: '/op-doctors', label: 'Doctors', icon: Stethoscope },
    { path: '/op-schedule', label: 'Doctor Schedules', icon: Calendar },
    { path: '/op-today-queue', label: "Today's Queue", icon: Clock },
    { path: '/op-reports', label: 'Reports', icon: FileText },
    { path: '/op-vitals', label: 'Vitals Entry', icon: Activity, comingSoon: true },
    { path: '/op-settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col z-40 border-r border-gray-100">
      {/* Logo / Clinic Header */}
      <div className="p-5 border-b flex items-center gap-3 bg-teal-50/40">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
          OP
        </div>
        <div>
          <h1 className="text-xl font-bold text-teal-800">OP Reception</h1>
          <p className="text-xs text-teal-700/80">Vijayawada Clinic</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
              isActive(item.path)
                ? 'bg-teal-50 text-teal-800 shadow-sm border border-teal-100'
                : 'text-gray-700 hover:bg-gray-50 hover:text-teal-700'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-teal-600' : 'text-gray-500 group-hover:text-teal-600'} />
            <span>{item.label}</span>
            {item.comingSoon && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                soon
              </span>
            )}
            {isActive(item.path) && <ChevronRight size={16} className="ml-auto text-teal-600" />}
          </Link>
        ))}
      </nav>

      {/* Footer / Version info */}
      <div className="p-5 border-t text-xs text-gray-500 bg-gray-50">
        <div>Clinic Management System</div>
        <div className="mt-1">Version 0.9.2 • March 2026</div>
        <div className="mt-2 text-teal-700/80">Support: support@clinicapp.in</div>
      </div>
    </div>
  );
};

export default OPSideMenu;