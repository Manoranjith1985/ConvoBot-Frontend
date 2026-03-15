// src/pages/DoctorProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Award, Mail, Phone, LogOut, AlertCircle, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: replace with real auth
  const currentDoctor = 'Dr. Test OP Doctor';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get(`/doctor/profile?provider=${encodeURIComponent(currentDoctor)}`);
        const profileData = res.data?.data || res.data || null;
        if (profileData) {
          setDoctor({
            ...profileData,
            qualifications: profileData.qualifications || [
              "MBBS - Gandhi Medical College, Hyderabad",
              "MD General Medicine - Osmania Medical College",
              "Fellowship in Diabetology"
            ],
            bio: profileData.bio || "Experienced outpatient physician with 12+ years in general medicine and chronic disease management. Special interest in diabetes, hypertension, and preventive care."
          });
        } else {
          setError('Profile data not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    // TODO: real logout (clear token, redirect)
    localStorage.removeItem('token');
    window.location.href = '/select-role';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold mb-4">Unable to load profile</h2>
          <p className="text-gray-600 mb-6">{error || 'Profile information not available'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700"
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-800">My Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          {/* Header / Cover */}
          <div className="h-48 bg-gradient-to-r from-teal-600 to-teal-800 relative">
            <div className="absolute -bottom-16 left-8">
              <img
                src={doctor.avatar || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"}
                alt={doctor.name}
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="pt-20 px-8 pb-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">{doctor.name}</h2>
              <p className="text-xl text-teal-700 font-medium mt-1">{doctor.specialty || 'General Physician'}</p>
              <div className="flex flex-wrap gap-6 mt-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Award size={18} />
                  <span>{doctor.experience || '12 Years Experience'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  <span>{doctor.totalPatients || '1,247'} Patients Treated</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* About */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-teal-600" />
                  About Me
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {doctor.bio}
                </p>
              </div>

              {/* Contact & Stats */}
              <div className="space-y-6">
                <div className="bg-teal-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-4 text-teal-800">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{doctor.email || 'doctor@example.com'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-teal-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{doctor.phone || '+91 98765 43210'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-4 text-gray-800">Qualifications</h4>
                  <ul className="space-y-2">
                    {doctor.qualifications.map((q, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
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
    </div>
  );
};

export default DoctorProfile;