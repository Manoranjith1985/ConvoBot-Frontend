// src/pages/DoctorSchedule.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, User, Phone, Mail, ChevronRight, X } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorSchedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [loading, setLoading] = useState(true);

  const provider = 'Dr. Test OP Doctor'; // ← replace with real auth later

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await apiClient.get(
          `/doctor/appointments/history?provider=${encodeURIComponent(provider)}`
        );
        const appts = res.data?.data || res.data || [];

        // ── Custom sort: latest first ───────────────────────────────
        // 1. Future appointments (earliest first)
        // 2. Today
        // 3. Past appointments (most recent first)
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const future = [];
        const today = [];
        const past = [];

        appts.forEach(appt => {
          const apptDateTime = new Date(`${appt.date}T${appt.time || '00:00'}`);
          if (apptDateTime > now) {
            future.push(appt);
          } else if (appt.date === todayStr) {
            today.push(appt);
          } else {
            past.push(appt);
          }
        });

        // Sort future ascending (earliest first)
        future.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        // Sort past descending (most recent first)
        past.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        // Combine: future → today → past (latest past on top within section)
        const sorted = [...future, ...today, ...past];

        setAppointments(sorted);
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isFuture = (dateStr, timeStr = '00:00') => {
    const apptDateTime = new Date(`${dateStr}T${timeStr}`);
    return apptDateTime > new Date();
  };

  const getStatusBadge = (appt) => {
    const status = (appt.status || 'Booked').toLowerCase();
    if (status === 'cancelled') {
      return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' };
    }
    if (isFuture(appt.date, appt.time)) {
      return { bg: '#dbeafe', text: '#1e40af', label: 'Upcoming' };
    }
    if (isToday(appt.date)) {
      return { bg: '#d1fae5', text: '#065f46', label: 'Today' };
    }
    return { bg: '#f3f4f6', text: '#374151', label: 'Past' };
  };

  const openAppointmentDetail = (appt) => setSelectedAppt(appt);
  const closeModal = () => setSelectedAppt(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - matching OPDashboard style */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-700 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-600" />
            Doctor's Appointment Schedule
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage all your past, today’s, and upcoming appointments
          </p>
        </div>

        {/* Appointment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No appointments found
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appt) => {
                const badge = getStatusBadge(appt);
                return (
                  <div
                    key={appt.id || appt._id}
                    onClick={() => openAppointmentDetail(appt)}
                    className="p-5 flex items-center gap-5 cursor-pointer hover:bg-teal-50/30 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center w-16">
                      <div className="text-2xl font-bold text-teal-700">
                        {new Date(appt.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-medium">
                        {new Date(appt.date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-lg">
                        {appt.patient_name}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-teal-600" /> {appt.time || '—'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{appt.visit_type || 'Consultation'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.text,
                        }}
                      >
                        {badge.label}
                      </span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedAppt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-teal-700 flex items-center gap-3">
                  <User className="text-teal-600" />
                  {selectedAppt.patient_name}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-8">
                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium text-teal-700">{selectedAppt.time || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(selectedAppt.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="font-medium">{selectedAppt.visit_type || 'Consultation'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium mt-1"
                      style={{
                        backgroundColor: getStatusBadge(selectedAppt).bg,
                        color: getStatusBadge(selectedAppt).text,
                      }}
                    >
                      {selectedAppt.status || 'Booked'}
                    </span>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-teal-700 mb-4 flex items-center gap-2">
                    <User size={18} /> Patient Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-teal-600" />
                      <div>
                        <p className="text-gray-500 text-xs">Phone</p>
                        <p className="font-medium">{selectedAppt.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-teal-600" />
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="font-medium">{selectedAppt.email || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Date of Birth</p>
                      <p className="font-medium">{selectedAppt.dob || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                {isFuture(selectedAppt.date, selectedAppt.time) && (
                  <button
                    onClick={() => {
                      const width = 1200;
                      const height = 900;
                      const left = window.screen.width / 2 - width / 2;
                      const top = window.screen.height / 2 - height / 2;

                      window.open(
                        `/encounter-documentation?apptId=${selectedAppt.id || selectedAppt._id}&patient=${encodeURIComponent(selectedAppt.patient_name)}&date=${selectedAppt.date}&time=${selectedAppt.time}&type=${encodeURIComponent(selectedAppt.visit_type || 'Consultation')}`,
                        'EncounterDoc',
                        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
                      );
                    }}
                    className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 transition-colors min-w-[160px]"
                  >
                    Start Appointment
                  </button>
                )}

                  <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-lg font-medium hover:bg-teal-50 transition-colors min-w-[160px]">
                    Patient History
                  </button>

                  {isFuture(selectedAppt.date, selectedAppt.time) ? (
                    <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-lg font-medium hover:bg-teal-50 transition-colors min-w-[160px]">
                      Reschedule
                    </button>
                  ) : (
                    <button className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 py-3 px-6 rounded-lg font-medium hover:bg-orange-100 transition-colors min-w-[160px]">
                      Recall Patient
                    </button>
                  )}

                  <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-lg font-medium hover:bg-teal-50 transition-colors min-w-[160px]">
                    Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;