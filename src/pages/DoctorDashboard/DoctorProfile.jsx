// src/pages/DoctorProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Award, Mail, Phone, LogOut } from 'lucide-react';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});


const DoctorProfile = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use real provider name from auth/context later – hardcoded for now
  const provider = 'Dr. Test OP Doctor';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get(`/doctor/profile?provider=${encodeURIComponent(provider)}`);
        if (res.data.status === 'success') {
          setDoctor(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    // Add real logout logic (clear token, redirect, etc.)
    localStorage.removeItem('token'); // example
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-teal-700 tracking-tight">My Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-teal-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          {/* Profile Banner */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-xl"
              />
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold">{doctor.name}</h2>
                <p className="text-xl mt-2 opacity-90">{doctor.specialty}</p>
                <div className="mt-4 flex flex-wrap gap-6 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>{doctor.totalPatients} Patients</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 lg:p-12 space-y-12">
            {/* Bio */}
            <div>
              <h3 className="text-2xl font-semibold text-teal-700 mb-4">About Me</h3>
              <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                <h4 className="text-lg font-semibold text-teal-700 mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{doctor.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                <h4 className="text-lg font-semibold text-teal-700 mb-4">Qualifications</h4>
                <ul className="space-y-3">
                  {doctor.qualifications.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-teal-600 mt-1">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;