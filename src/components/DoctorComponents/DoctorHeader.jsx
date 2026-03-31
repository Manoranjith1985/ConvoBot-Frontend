// src/components/DoctorHeader.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Settings, User, LogOut, ChevronDown, Home } from 'lucide-react';
import { useDoctor } from '../../context/DoctorContext';

const DoctorHeader = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedDoctor } = useDoctor();

  // Fallback if no doctor selected (should rarely happen)
  const providerName = selectedDoctor?.name || 'Dr. Test OP Doctor';
  const doctorId = selectedDoctor?.id;

  const doctor = {
    name: selectedDoctor?.name || providerName,
    avatar: selectedDoctor?.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    role: "Outpatient Doctor"
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor');
    localStorage.removeItem('token');
    localStorage.removeItem('selectedDoctor');   // Clear selected doctor on logout
    navigate('/doctor-select');
  };

  // Navigate to current doctor's dashboard
  const goToDashboard = () => {
    if (doctorId) {
      navigate(`/doctor-dashboard`);
    } else {
      // Fallback: go to selection page if no doctor selected
      navigate('/doctor-select');
    }
  };

  return (
    <header className="bg-white shadow-sm px-6 md:px-8 py-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={goToDashboard}
          className="flex items-center gap-2 text-teal-700 hover:text-teal-800 transition-colors font-semibold"
        >
          <Home className="w-5 h-5" />
          <span>Doctor Dashboard</span>
        </button>
      </div>

      <div className="flex items-center gap-5 md:gap-7">
        <button className="relative p-1.5 hover:bg-teal-50 rounded-full transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        <button className="p-1.5 hover:bg-teal-50 rounded-full transition-colors">
          <HelpCircle className="w-6 h-6 text-gray-600" />
        </button>

        <button className="p-1.5 hover:bg-teal-50 rounded-full transition-colors">
          <Settings className="w-6 h-6 text-gray-600" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors"
          >
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-teal-100"
            />
            <div className="text-left hidden sm:block">
              <p className="font-semibold text-gray-800 text-sm">{doctor.name}</p>
              <p className="text-xs text-gray-500">{doctor.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (doctorId) {
                    navigate(`/doctor/${doctorId}/profile`);
                  } else {
                    navigate('/doctor-select');
                  }
                }}
                className="w-full px-5 py-3.5 text-left hover:bg-teal-50 flex items-center gap-3 text-gray-800 transition-colors"
              >
                <User className="w-5 h-5 text-teal-600" />
                View Profile
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full px-5 py-3.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;