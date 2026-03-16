// src/pages/AdminSchedulesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, Users, Plus, X, Edit, Save 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminSchedulesPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentDay, setCurrentDay] = useState(null);
  const [formSlot, setFormSlot] = useState({
    day: 'Monday',
    start: '09:00',
    end: '17:00',
    active: true
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchDoctorsAndSchedules();
  }, []);

  const fetchDoctorsAndSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/admin/schedules/doctors');
      const docList = res.data.data || [];
      setDoctors(docList);

      if (docList.length === 0) {
        setError('No doctors found');
        return;
      }

      const schedulePromises = docList.map(async (doc) => {
        try {
          const schedRes = await apiClient.get(`/admin/schedules/doctor/${doc._id}`);
          return { doctorId: doc._id, schedule: schedRes.data.schedule || {} };
        } catch (err) {
          console.error(`Failed to fetch schedule for ${doc.name}:`, err);
          return { doctorId: doc._id, schedule: {} };
        }
      });

      const results = await Promise.all(schedulePromises);
      const scheduleMap = {};
      results.forEach(r => {
        scheduleMap[r.doctorId] = r.schedule;
      });
      setSchedules(scheduleMap);

    } catch (err) {
      console.error('Schedules load error:', err);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openSlotModal = (day) => {
    const existing = schedules[selectedDoctor._id]?.[day];
    setCurrentDay(day);
    setModalMode(existing?.active ? 'edit' : 'add');
    setFormSlot({
      day,
      start: existing?.start || '09:00',
      end: existing?.end || '17:00',
      active: existing?.active ?? false
    });
    setShowSlotModal(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedDoctor) return;

    try {
      await apiClient.post(
        `/admin/schedules/doctor/${selectedDoctor._id}`,
        formSlot,
        { headers: { 'Content-Type': 'application/json' } }
      );
      alert(modalMode === 'edit' ? 'Slot updated successfully' : 'Slot added successfully');
      setShowSlotModal(false);
      fetchDoctorsAndSchedules();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save slot');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600 animate-pulse flex items-center gap-3">
          <Clock size={24} className="animate-spin" /> Loading clinic schedules...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Schedules</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchDoctorsAndSchedules}
          className="mt-6 px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Clinic Schedules</h1>
          <p className="text-gray-500 mt-1">Manage doctor availability • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Doctor Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users size={20} /> Doctors
            </h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {doctors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No doctors found</p>
              ) : (
                doctors.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                      selectedDoctor?._id === doc._id
                        ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-600 mt-0.5">{doc.specialty || 'General'}</div>
                    <div className="text-xs text-gray-500 mt-1.5">
                      {doc.shift_start || '??:??'} – {doc.shift_end || '??:??'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-3">
          {selectedDoctor ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedDoctor.name}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedDoctor.specialty || 'General Physician'}</p>
                </div>
                <button
                  onClick={() => {
                    setModalMode('add');
                    setFormSlot({ day: 'Monday', start: '09:00', end: '17:00', active: true });
                    setShowSlotModal(true);
                  }}
                  className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-5 py-2.5 rounded-lg hover:opacity-90 font-medium whitespace-nowrap"
                >
                  <Plus size={18} /> Add Slot
                </button>
              </div>

              {/* Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                {DAYS.map(day => {
                  const slot = schedules[selectedDoctor._id]?.[day] || { active: false, start: '', end: '' };
                  return (
                    <div
                      key={day}
                      className={`p-5 rounded-xl border transition-all duration-200 shadow-sm ${
                        slot.active
                          ? 'border-green-300 bg-green-50 hover:bg-green-100'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 opacity-80'
                      }`}
                    >
                      <div className="font-semibold text-base mb-3 text-center">
                        {day.slice(0, 3)}
                      </div>

                      <div className="text-center mb-4">
                        {slot.active ? (
                          <div className="text-lg font-medium text-green-700">
                            {slot.start || '--:--'} – {slot.end || '--:--'}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            Not available
                          </div>
                        )}
                      </div>

                      {/* Edit button – only visible when active */}
                      {slot.active && (
                        <div className="text-center">
                          <button
                            onClick={() => openSlotModal(day)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1.5 mx-auto transition-colors"
                          >
                            <Edit size={16} /> Edit
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
              <Calendar size={64} className="mx-auto mb-6 opacity-40" />
              <h3 className="text-xl font-semibold mb-2">No Doctor Selected</h3>
              <p className="text-gray-600">
                Choose a doctor from the list on the left to view and manage their weekly schedule.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Slot Modal */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === 'edit' ? 'Edit Slot' : 'Add Slot'} for {formSlot.day}
              </h3>
              <button onClick={() => setShowSlotModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Day – editable only in add mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Day</label>
                {modalMode === 'add' ? (
                  <select
                    value={formSlot.day}
                    onChange={e => setFormSlot({ ...formSlot, day: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formSlot.day}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={formSlot.start}
                    onChange={e => setFormSlot({ ...formSlot, start: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={formSlot.end}
                    onChange={e => setFormSlot({ ...formSlot, end: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formSlot.active}
                  onChange={e => setFormSlot({ ...formSlot, active: e.target.checked })}
                  className="h-5 w-5 text-[var(--primary-color)] rounded border-gray-300 focus:ring-[var(--primary-color)]"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active / Available on this day
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSlot}
                  className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
                >
                  <Save size={18} /> {modalMode === 'edit' ? 'Update Slot' : 'Add Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedulesPage;