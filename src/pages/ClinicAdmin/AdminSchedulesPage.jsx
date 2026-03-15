// src/pages/AdminSchedulesPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, Clock, Users, Plus, X, Edit, Save, AlertTriangle 
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminSchedules = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState({}); // doctorId → { day: { start, end, active } }
  const [loading, setLoading] = useState(true);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
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
      const res = await apiClient.get('/admin/schedules/doctors');
      setDoctors(res.data.data || []);
  
      const schedulePromises = res.data.data.map(async (doc) => {
        try {
          const schedRes = await apiClient.get(`/admin/schedules/doctor/${doc._id}`);
          return { doctorId: doc._id, schedule: schedRes.data.schedule || {} };
        } catch (err) {
          console.error(`Failed to fetch schedule for ${doc.name}:`, err.response?.data || err);
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
      console.error('Schedules fetch error:', err.response?.data || err);
      alert('Failed to load schedules. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDoctor) return;
  
    try {
      await apiClient.post(
        `/admin/schedules/doctor/${selectedDoctor._id}`,
        newSlot,                          // ← plain object
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      alert('Slot added/updated');
      setShowAddSlotModal(false);
      fetchDoctorsAndSchedules();
    } catch (err) {
      console.error('POST error:', err.response?.data || err);
      alert(err.response?.data?.message || 'Failed to save slot');
    }
  };

  const toggleDayActive = async (doctorId, day) => {
    const current = schedules[doctorId]?.[day] || { active: false, start: '09:00', end: '17:00' };
    const updated = { ...current, active: !current.active };
  
    try {
      await apiClient.post(
        `/admin/schedules/doctor/${doctorId}`,
        {
          day,
          start: updated.start,
          end: updated.end,
          active: updated.active
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      fetchDoctorsAndSchedules();
    } catch (err) {
      console.error(err);
    }
  };;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Clinic Schedules</h1>
          <p className="text-gray-500 mt-1">Manage doctor availability • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      {/* Doctor List + Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Doctor Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users size={20} /> Doctors
            </h2>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {doctors.map(doc => (
                <button
                  key={doc._id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedDoctor?._id === doc._id
                      ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-sm text-gray-600">{doc.specialty || 'General'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {doc.shift_start || '??'} – {doc.shift_end || '??'}
                  </div>
                </button>
              ))}
              {doctors.length === 0 && (
                <p className="text-center text-gray-500 py-8">No doctors found</p>
              )}
            </div>
          </div>
        </div>

        {/* Right - Selected Doctor Schedule */}
        <div className="lg:col-span-2">
          {selectedDoctor ? (
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedDoctor.name} - Schedule
                </h2>
                <button
                  onClick={() => setShowAddSlotModal(true)}
                  className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-5 py-2.5 rounded-lg hover:opacity-90"
                >
                  <Plus size={18} /> Add Slot
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {DAYS.map(day => {
                  const slot = schedules[selectedDoctor._id]?.[day] || { active: false, start: '', end: '' };
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-lg border ${
                        slot.active
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="font-semibold mb-2 flex justify-between items-center">
                        <span>{day}</span>
                        <button
                          onClick={() => toggleDayActive(selectedDoctor._id, day)}
                          className={`text-xs px-2 py-1 rounded ${
                            slot.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {slot.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                      {slot.active ? (
                        <div className="text-sm">
                          {slot.start || '??:??'} – {slot.end || '??:??'}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">Not available</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select a doctor to view and manage their schedule</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Slot Modal */}
      {showAddSlotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Add / Update Slot</h3>
              <button onClick={() => setShowAddSlotModal(false)}>
                <X size={24} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select
                  value={newSlot.day}
                  onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={e => setNewSlot({ ...newSlot, start: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={e => setNewSlot({ ...newSlot, end: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSlot.active}
                  onChange={e => setNewSlot({ ...newSlot, active: e.target.checked })}
                  className="h-4 w-4 text-[var(--primary-color)]"
                />
                <label className="text-sm font-medium">Active / Available</label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-5 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSlot}
                  className="px-5 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  <Save size={18} /> Save Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;