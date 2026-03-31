// src/pages/OPDashboard/OPDashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Download, Filter, Edit2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './OPDashboard.css';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const OPDashboard = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({
    total_visits: 0,
    confirmed: 0,
    pending: 0,
    capacity: 0,
    avg_consult_time_min: '—',
  });

  const [statusFilter, setStatusFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for Edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEscapeKey(() => {
    if (showEditModal) {
      setShowEditModal(false);
      setEditingAppointment(null);
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedRes, metricsRes] = await Promise.all([
          apiClient.get(`/op/?date=${selectedDate}`),
          apiClient.get(`/op/metrics?date=${selectedDate}`),
        ]);

        setAppointments(Array.isArray(schedRes.data.data) ? schedRes.data.data : []);
        setMetrics(metricsRes.data.data || metrics);
      } catch (err) {
        setError('Failed to load schedule data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const uniqueDoctors = useMemo(() => [...new Set(appointments.map(a => a.provider))], [appointments]);
  const uniqueTypes = useMemo(() => [...new Set(appointments.map(a => a.type))], [appointments]);

  const filteredAppointments = useMemo(() => {
    let data = [...appointments].sort((a, b) =>
      (a.time || '00:00').localeCompare(b.time || '00:00')
    );

    if (statusFilter !== 'All') data = data.filter(a => a.status === statusFilter);
    if (doctorFilter !== 'All') data = data.filter(a => a.provider === doctorFilter);
    if (typeFilter !== 'All') data = data.filter(a => a.type === typeFilter);

    return data;
  }, [appointments, statusFilter, doctorFilter, typeFilter]);

  // Edit Appointment
  const handleEdit = (appt) => {
    const [sys, dia] = (appt.blood_pressure || '').split('/');
    setEditingAppointment({ 
      ...appt,
      bp_systolic: sys?.trim() || '',
      bp_diastolic: dia?.trim() || ''
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingAppointment) return;

    try {
      await apiClient.put(`/op/appointments/${editingAppointment.id || editingAppointment._id}`, editingAppointment);
      alert('Appointment updated successfully');
      setShowEditModal(false);
      setEditingAppointment(null);
      window.location.reload(); // Refresh to show updated data
    } catch (err) {
      alert('Failed to update appointment');
    }
  };

  // Delete Appointment
  const handleDelete = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return;

    try {
      await apiClient.delete(`/op/appointments/${appointmentId}`);
      alert('Appointment deleted successfully');
      window.location.reload();
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  const exportToExcel = () => {
    const exportData = filteredAppointments.map(appt => ({
      Date: formatDateDDMMYYYY(selectedDate),
      Time: appt.time || '—',
      Patient: appt.patient || '—',
      'Patient ID': appt.patient_id || '—',
      Doctor: appt.provider || '—',
      Type: appt.type || '—',
      Billing: appt.billing_type || '—',
      Insurance: appt.receiver || appt.insurance_provider || '—',
      Status: appt.status || '—',
      Concerns: appt.concerns || '—',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Schedule');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `Clinic_Schedule_${formatDateDDMMYYYY(selectedDate).replace(/\//g, '-')}.xlsx`);
  };

  if (loading) return <div className="page-container text-center py-20 text-xl">Loading schedule...</div>;
  if (error) return <div className="page-container text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="page-container">
      <header className="header-content">
        <div>
          <h1 style={{ color: '#0d9488', margin: 0 }}>Daily Clinic Schedule</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Managing patient flow • {formatDateDDMMYYYY(selectedDate)}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="primary-btn flex items-center gap-2" onClick={exportToExcel}>
            <Download size={18} /> Export
          </button>
          <button className="primary-btn" onClick={() => navigate('/new-appointment')}>
            + New Appointment
          </button>
        </div>
      </header>

      <div className="schedule-stats">
        <div className="stat-item border-teal">
          <span className="stat-label">Total Visits</span>
          <span className="stat-value">{metrics.total_visits}</span>
        </div>
        <div className="stat-item border-green">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{metrics.confirmed}</span>
        </div>
        <div className="stat-item border-yellow">
          <span className="stat-label">Pending</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>{metrics.pending}</span>
        </div>
        <div className="stat-item border-blue">
          <span className="stat-label">Avg Consult Time</span>
          <span className="stat-value" style={{ color: '#6366f1' }}>
            {metrics.avg_consult_time_min === '—' ? '—' : `${metrics.avg_consult_time_min} min`}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
        <div className="table-header-row flex justify-between items-center">
          <h3 style={{ margin: 0 }}>Appointments</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              Filters
            </div>
            <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)} className="filter-select">
              <option value="All">All Doctors</option>
              {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
              <option value="All">All Status</option>
              <option value="Booked">Booked</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
              <option value="All">All Types</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>File # / EID</th>
              <th>Doctor</th>
              <th>Type</th>
              <th>Billing</th>
              <th>Insurance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-12 text-gray-500 italic">
                  No appointments found for the selected date and filters
                </td>
              </tr>
            ) : (
              filteredAppointments.map(appt => (
                <tr key={appt.id} className="hover:bg-teal-50/30 transition-colors">
                  <td className="font-medium text-teal-700">{appt.time || '—'}</td>
                  <td>{appt.patient || '—'}</td>
                  <td className="font-mono text-sm text-gray-600">
                    {appt.file_number || appt.eid || '—'}
                  </td>
                  <td>{appt.provider || '—'}</td>
                  <td>{appt.type || '—'}</td>
                  <td>{appt.billing_type || '—'}</td>
                  <td>{appt.receiver || appt.insurance_provider || '—'}</td>
                  <td>
                    <span className={`status-badge ${appt.status?.toLowerCase()}`}>
                      {appt.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <button
                      onClick={() => handleEdit(appt)}
                      className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Edit Appointment"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Appointment"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== EDIT APPOINTMENT MODAL WITH VITALS ==================== */}
      {showEditModal && editingAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Appointment</h3>
              <button onClick={() => { setShowEditModal(false); setEditingAppointment(null); }}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={editingAppointment.time || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingAppointment.status || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                >
                  <option value="Booked">Booked</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label>Concerns / Chief Complaint</label>
                <input
                  type="text"
                  value={editingAppointment.concerns || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, concerns: e.target.value })}
                />
              </div>

              {/* ==================== VITALS SECTION ==================== */}
              <div className="form-group">
                <label className="block font-semibold text-gray-700 mb-3">Vitals</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Height (cm)</label>
                    <input
                      type="number"
                      value={editingAppointment.height || ''}
                      onChange={(e) => setEditingAppointment({ 
                        ...editingAppointment, 
                        height: e.target.value 
                      })}
                      placeholder="170"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Weight (kg)</label>
                    <input
                      type="number"
                      value={editingAppointment.weight || ''}
                      onChange={(e) => setEditingAppointment({ 
                        ...editingAppointment, 
                        weight: e.target.value 
                      })}
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Blood Pressure</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="120"
                        value={editingAppointment.bp_systolic || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingAppointment(prev => ({
                            ...prev,
                            bp_systolic: val,
                            blood_pressure: val && prev.bp_diastolic ? `${val}/${prev.bp_diastolic}` : val || ''
                          }));
                        }}
                        className="w-full"
                      />
                      <span className="text-xl text-gray-400 mx-1">/</span>
                      <input
                        type="number"
                        placeholder="80"
                        value={editingAppointment.bp_diastolic || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingAppointment(prev => ({
                            ...prev,
                            bp_diastolic: val,
                            blood_pressure: prev.bp_systolic && val ? `${prev.bp_systolic}/${val}` : val || ''
                          }));
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => { setShowEditModal(false); setEditingAppointment(null); }}
              >
                Cancel
              </button>
              <button className="primary-btn" onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDashboard;