// src/pages/OPDashboard/OPDoctors.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, ChevronRight, AlertTriangle, X } from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const OPDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState(null);

  useEscapeKey(() => setSelectedDoctor(null));

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/op/doctors');
        setDoctors(res.data?.data || []);
      } catch (err) {
        console.error('Doctors fetch error:', err);
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchTodaySchedule(selectedDoctor._id);
    }
  }, [selectedDoctor]);

  const fetchTodaySchedule = async (doctorId) => {
    try {
      setScheduleLoading(true);
      const res = await apiClient.get(`/op/doctors/${doctorId}/today-schedule`);
      setTodaySchedule(res.data.data || []);
    } catch (err) {
      console.error('Today schedule error:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600 animate-pulse">Loading doctors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">OP Doctors</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-teal-300"
            onClick={() => setSelectedDoctor(doc)}
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={doc.avatar || 'https://via.placeholder.com/80'}
                alt={doc.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{doc.name}</h2>
                <p className="text-teal-600 font-medium">{doc.specialty || 'General Physician'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className={doc.today_shift.includes('Not') ? 'text-amber-600' : 'text-green-700'}>
                  {doc.today_shift}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span>Experience: {doc.experience || 'N/A'}</span>
              </p>
            </div>

            <div className="mt-5 flex justify-end">
              <ChevronRight size={20} className="text-teal-600" />
            </div>
          </div>
        ))}

        {doctors.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-12 text-lg">
            No doctors available today
          </p>
        )}
      </div>

      {/* Doctor Detail Popup */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="
              bg-white rounded-3xl max-w-3xl w-full 
              max-h-[90vh] overflow-y-auto shadow-2xl
              scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
            "
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                <p className="text-xl text-teal-600 mt-1">{selectedDoctor.specialty || 'General Physician'}</p>
              </div>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Quick Info */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <img
                  src={selectedDoctor.avatar || 'https://via.placeholder.com/160'}
                  alt={selectedDoctor.name}
                  className="w-40 h-40 rounded-2xl object-cover border-4 border-gray-100"
                />
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Experience</div>
                      <div className="font-medium">{selectedDoctor.experience || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Today's Shift</div>
                      <div className={`font-medium ${selectedDoctor.today_shift.includes('Not') ? 'text-amber-600' : 'text-green-700'}`}>
                        {selectedDoctor.today_shift}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedDoctor.phone || 'No phone listed'}</p>
                </div>
              </div>

              {/* Today's Appointments */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Today's Appointments
                </h3>
                {scheduleLoading ? (
                  <p className="text-center text-gray-500 py-6 animate-pulse">Loading...</p>
                ) : todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.map((appt, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-200"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{appt.time}</div>
                          <div className="text-sm text-gray-600">{appt.patient_name}</div>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                          {appt.visit_type || 'Consultation'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 italic">
                    No appointments scheduled for today
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 rounded-b-3xl">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDoctors;