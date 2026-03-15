// src/components/DoctorSideMenu.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users, Clock } from 'lucide-react';

const DoctorSideMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simulate auth – in real app use context
  const doctor = JSON.parse(localStorage.getItem('doctor') || JSON.stringify({
    name: "Dr. Test OP Doctor",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
  }));

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-teal-700 text-white flex flex-col h-screen shadow-lg fixed top-0 left-0">
      <div className="p-6 border-b border-teal-600">
        <div className="flex items-center space-x-4">
          <img
            src={doctor.avatar}
            alt={doctor.name}
            className="w-14 h-14 rounded-full object-cover border-3 border-white/30 shadow-sm"
          />
          <div>
            <h2 className="font-semibold text-lg">{doctor.name}</h2>
            <p className="text-teal-200 text-sm mt-0.5">Outpatient</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div
          onClick={() => navigate('/doctor-dashboard')}
          className={`flex items-center px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive('/doctor-dashboard') ? 'bg-teal-800 shadow-md' : 'hover:bg-teal-600'
          }`}
        >
          <Calendar className="w-5 h-5 mr-4" />
          Dashboard
        </div>

        <div
          onClick={() => navigate('/doctor-schedule')}
          className={`flex items-center px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive('/doctor-schedule') ? 'bg-teal-800 shadow-md' : 'hover:bg-teal-600'
          }`}
        >
          <Clock className="w-5 h-5 mr-4" />
          My Schedule
        </div>

        <div
          onClick={() => navigate('/doctor-patients')}
          className={`flex items-center px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive('/doctor-patients') ? 'bg-teal-800 shadow-md' : 'hover:bg-teal-600'
          }`}
        >
          <Users className="w-5 h-5 mr-4" />
          My Patients
        </div>
      </nav>

      <div className="p-4 border-t border-teal-600 text-center text-teal-200 text-xs">
        © 2026 Clinic Management System
      </div>
    </aside>
  );
};

export default DoctorSideMenu;