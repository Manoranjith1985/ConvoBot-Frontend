// src/pages/OPDashboard/OPDoctors.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, UserPlus, ChevronRight } from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

const OPDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEscapeKey(() => setSelectedDoctor(null));

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/op/doctors');
        setDoctors(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load doctors');
        // fallback data
        setDoctors([
          {
            id: "D001",
            name: "Dr. Rajesh Kumar",
            specialty: "General Physician",
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150",
            shift: "09:00 – 17:00",
            status: "Available",
            phone: "+91 98765 43210",
            experience: "12 years",
            today_patients: 18,
            max_patients: 25,
            todaySchedule: []
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "Available") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "Busy")     return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading doctors on duty...</div>;
  if (error)   return <div className="text-center py-20 text-red-600 font-medium">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-teal-700">Doctors on Duty</h1>
          <p className="text-gray-600 mt-1">Current availability & schedule overview</p>
        </div>
        <button className="primary-btn flex items-center gap-2">
          <UserPlus size={18} /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border border-gray-100 hover:border-teal-200 group"
          >
            <div className="flex items-start gap-4">
              <img
                src={doc.avatar}
                alt={doc.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-gray-900 group-hover:text-teal-700 transition-colors">
                  {doc.name}
                </h3>
                <p className="text-teal-600 font-medium">{doc.specialty}</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock size={15} />
                  <span>{doc.shift}</span>
                </div>
              </div>
              <div className={`px-3.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(doc.status)}`}>
                {doc.status}
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Today's patients</p>
                <p className="font-semibold text-gray-900">
                  {doc.today_patients || 0} / {doc.max_patients || '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Experience</p>
                <p className="font-semibold text-gray-900">{doc.experience || '—'}</p>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
              View Schedule <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center gap-4 bg-gray-50">
              <img
                src={selectedDoctor.avatar}
                alt=""
                className="w-16 h-16 rounded-xl object-cover border-2 border-teal-100"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                <p className="text-teal-600 font-medium">{selectedDoctor.specialty}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-teal-50 p-4 rounded-xl">
                  <p className="text-sm text-teal-700 font-medium">Shift</p>
                  <p className="text-lg font-semibold">{selectedDoctor.shift}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-sm text-emerald-700 font-medium">Status</p>
                  <p className="text-lg font-semibold">{selectedDoctor.status}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <p className="text-sm text-amber-700 font-medium">Today</p>
                  <p className="text-lg font-semibold">
                    {selectedDoctor.today_patients || 0} / {selectedDoctor.max_patients || '—'}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-700 font-medium">Avg Time</p>
                  <p className="text-lg font-semibold">— min</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calendar size={18} /> Today's Schedule
                </h3>
                <div className="bg-gray-50 rounded-xl p-5 text-center text-gray-500 italic">
                  No appointments scheduled yet (real schedule integration pending)
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDoctor(null)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors">
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDoctors;