// src/pages/OPDashboard/OPDashboard.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OPDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({ baseURL: API_BASE_URL });

const OPDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [metrics, setMetrics] = useState({ total_visits: 0, confirmed: 0, pending: 0, capacity: 0 });
  const [statusFilter, setStatusFilter] = useState('All');
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [schedRes, metricsRes] = await Promise.all([
          apiClient.get(`/appointments/?date=${selectedDate}`),
          apiClient.get(`/appointments/metrics?date=${selectedDate}`)
        ]);

        const appts = Array.isArray(schedRes.data.data) ? schedRes.data.data : [];
        setAppointments(appts);
        setMetrics(metricsRes.data.data || { total_visits: 0, confirmed: 0, pending: 0, capacity: 0 });
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const uniqueDoctors = useMemo(() => [...new Set(appointments.map(a => a.provider))], [appointments]);
  const uniqueTypes   = useMemo(() => [...new Set(appointments.map(a => a.type))],     [appointments]);

  const filteredAppointments = useMemo(() => {
    let data = [...appointments].sort((a,b) =>
      (a.time || a.appointment_time || '00:00').localeCompare(b.time || b.appointment_time || '00:00')
    );

    if (statusFilter !== 'All') data = data.filter(a => a.status === statusFilter);
    if (doctorFilter !== 'All') data = data.filter(a => a.provider === doctorFilter);
    if (typeFilter   !== 'All') data = data.filter(a => a.type     === typeFilter);

    return data;
  }, [appointments, statusFilter, doctorFilter, typeFilter]);

  if (loading) return <div className="page-container">Loading...</div>;
  if (error)   return <div className="page-container">{error}</div>;

  return (
    <div className="page-container">
      <header className="header-content">
        <div>
          <h1 style={{ color: '#0d9488', margin: 0 }}>Daily Clinic Schedule</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>Managing patient flow and doctor availability</p>
        </div>
        <button className="primary-btn" onClick={() => navigate('/new-appointment')}>
          + New Appointment
        </button>
      </header>

      <div className="schedule-stats">
        <div className="stat-item border-teal">
          <span className="stat-label">Total Visits</span>
          <span className="stat-value">{metrics.total_visits}</span>
        </div>
        <div className="stat-item border-green">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value" style={{color:'#10b981'}}>{metrics.confirmed}</span>
        </div>
        <div className="stat-item border-yellow">
          <span className="stat-label">Pending</span>
          <span className="stat-value" style={{color:'#f59e0b'}}>{metrics.pending}</span>
        </div>
        <div className="stat-item border-blue">
          <span className="stat-label">Capacity</span>
          <span className="stat-value" style={{color:'#6366f1'}}>{metrics.capacity}%</span>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div className="table-header-row">
          <h3 style={{ margin: 0 }}>Patient Appointments</h3>
        </div>

        <div className="filters">
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select value={doctorFilter} onChange={e => setDoctorFilter(e.target.value)}>
              <option value="All">All Doctors</option>
              {uniqueDoctors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="form-group">
            <label>Visit Type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
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
              <th>Doctor</th>
              <th>Type</th>
              <th>Billing</th>
              <th>Insurance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appt => (
              <tr key={appt.id}>
                <td style={{ fontWeight: 'bold', color: '#0d9488' }}>
                  {appt.time || '-'}
                </td>
                <td>{appt.patient || '-'}</td>
                <td>{appt.provider || '-'}</td>
                <td>{appt.type || '-'}</td>
                <td>{appt.billing_type || '-'}</td>
                <td>{appt.insurance_provider || '-'}</td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: appt.status === 'Booked' ? '#d1fae5' : '#fef3c7',
                    color: appt.status === 'Booked' ? '#065f46' : '#92400e'
                  }}>
                    {appt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OPDashboard;