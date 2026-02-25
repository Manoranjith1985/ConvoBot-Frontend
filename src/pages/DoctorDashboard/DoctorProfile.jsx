// src/pages/DoctorProfile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, Award } from 'lucide-react';

const DoctorProfile = () => {
  const navigate = useNavigate();

  const doctor = {
    name: "Dr. Test OP Doctor",
    specialty: "General Physician",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
    experience: "12 Years",
    totalPatients: "1247",
    email: "dr.testop@clinic.com",
    phone: "+91 98765 43210",
    bio: "Experienced physician with over 12 years in general medicine. Passionate about patient care and preventive medicine.",
    qualifications: ["MBBS - AIIMS Delhi", "MD Internal Medicine - PGIMER Chandigarh"],
  };

  const handleLogout = () => {
    // Add your logout logic here (clear token, etc.)
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-28 h-28 rounded-full border-4 border-white object-cover"
              />
              <div>
                <h2 className="text-4xl font-bold">{doctor.name}</h2>
                <p className="text-xl opacity-90">{doctor.specialty}</p>
                <p className="mt-1 text-sm opacity-75">Experience: {doctor.experience}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <Users className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                <p className="text-3xl font-bold text-gray-800">{doctor.totalPatients}</p>
                <p className="text-sm text-gray-600">Patients Treated</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <Award className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                <p className="text-3xl font-bold text-gray-800">{doctor.experience}</p>
                <p className="text-sm text-gray-600">Experience</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <Calendar className="w-10 h-10 mx-auto text-blue-600 mb-3" />
                <p className="text-3xl font-bold text-gray-800">98%</p>
                <p className="text-sm text-gray-600">Patient Satisfaction</p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About Me</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.bio}</p>
            </div>

            {/* Contact Info */}
            <div className="mb-10">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">✉️</div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{doctor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">📞</div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{doctor.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Qualifications */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Qualifications</h3>
              <ul className="space-y-3">
                {doctor.qualifications.map((q, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700">{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;