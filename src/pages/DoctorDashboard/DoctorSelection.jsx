// src/pages/DoctorSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../../context/DoctorContext';
import axios from 'axios';
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorSelection = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { setSelectedDoctor } = useDoctor();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await apiClient.get('/doctor/available');
        setDoctors(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Failed to load doctors:', err);
        setError('Failed to load available doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSelectDoctor = (doctor) => {
    const doctorObj = {
      id: doctor._id || doctor.id,
      name: doctor.name || doctor.provider || 'Unknown Doctor',
      speciality: doctor.specialty || doctor.speciality || 'General Physician',
      clinicName: doctor.clinic_name || doctor.clinic || 'Current Clinic'
    };

    setSelectedDoctor(doctorObj);
    navigate(`/doctor-dashboard`);   // Correct dynamic route
  };

  const handleBack = () => {
    navigate('/select-role');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Role Selection
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-teal-800 mb-3">Select Doctor</h1>
          <p className="text-gray-600 text-lg">Choose a doctor to access their dashboard, patients, schedule, and Convo Bot</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No doctors available. Please contact administrator.
            </div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor._id || doctor.id}
                onClick={() => handleSelectDoctor(doctor)}
                className="bg-white rounded-2xl shadow hover:shadow-xl p-8 border border-gray-100 hover:border-teal-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center text-5xl text-teal-700 font-bold flex-shrink-0">
                    {(doctor.name || doctor.provider || '?').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-teal-700 truncate">
                      {doctor.name || doctor.provider}
                    </h3>
                    <p className="text-teal-600 font-medium mt-1">{doctor.specialty || doctor.speciality}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                  <Building2 size={18} />
                  <span>{doctor.clinic_name || doctor.clinic || 'Clinic'}</span>
                </div>

                <button className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                  Open Dashboard
                  <ArrowRight size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-10 text-sm text-gray-500">
          Use <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">ESC</span> to close modals • 
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">Backspace</span> to go back
        </div>
      </div>
    </div>
  );
};

export default DoctorSelection;