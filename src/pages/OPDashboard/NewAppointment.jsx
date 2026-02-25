// src/pages/OPDashboard/NewAppointment.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OPDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const NewAppointment = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patient: '',
    phone: '',
    email: '',
    dob: '',
    time: '09:00',
    provider: '',
    type: 'Consultation',
    status: 'Booked',
    billing_type: 'Cash',
    insurance_provider: '',
    concerns: '',           // New
    height: '',             // New
    weight: '',             // New
    blood_pressure: '',     // New
    allergies: '',          // New
    chronic_conditions: ''  // New
  });

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current && !searchInputRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value.trim();
    setSearch(q);
    setForm(prev => ({ ...prev, patient: q }));

    if (q.length < 3) {
      setResults([]);
      return;
    }

    try {
      const res = await apiClient.get(`/appointments/patient_search?query=${encodeURIComponent(q)}`);
      setResults(res.data.data || []);
    } catch (err) {
      console.error('Patient search error:', err);
      setResults([]);
    }
  };

  const selectPatient = (p) => {
    setForm({
      ...form,
      patient: p.patient_name || p.name || '',
      phone: p.phone || '',
      email: p.email || '',
      dob: p.dob || '',
      billing_type: p.billing_type || 'Cash',
      insurance_provider: p.insurance_provider || ''
    });
    setResults([]);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setForm({
      patient: '',
      phone: '',
      email: '',
      dob: '',
      time: '09:00',
      provider: '',
      type: 'Consultation',
      status: 'Booked',
      billing_type: 'Cash',
      insurance_provider: '',
      concerns: '',
      height: '',
      weight: '',
      blood_pressure: '',
      allergies: '',
      chronic_conditions: ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/appointments/', form);
      alert('Appointment created successfully');
      setShowModal(false);
      navigate('/op-dashboard');
    } catch (err) {
      alert('Failed to create appointment: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header className="header-content">
        <div>
          <h1 style={{ color: '#0d9488', margin: 0 }}>New Appointment</h1>
          <p style={{ color: '#64748b', marginTop: '4px' }}>
            Search existing patient or add new
          </p>
        </div>
        <button className="primary-btn" onClick={handleAddNew}>
          + Add New Patient
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          position: 'relative',
          marginBottom: '40px'
        }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Search Registered Patient
            </label>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Type patient name (min 3 characters)"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                outline: 'none'
              }}
            />

            {results.length > 0 && (
              <ul
                ref={dropdownRef}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '340px',
                  overflowY: 'auto',
                  background: 'white',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  marginTop: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 9999,
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}
              >
                {results.map((p, index) => (
                  <li
                    key={index}
                    onClick={() => selectPatient(p)}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      borderBottom: index < results.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <strong>{p.patient_name || p.name || 'Unknown'}</strong>
                    {p.phone && ` • ${p.phone}`}
                    {p.dob && ` • ${p.dob}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODAL ==================== */}
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflow: 'hidden' }}>
      <div className="modal-header">
        <h2 style={{ margin: 0 }}>New Appointment</h2>
      </div>

      <div
        className="modal-body"
        style={{
          maxHeight: '70vh',
          overflowY: 'auto',
          padding: '24px',
          paddingBottom: '100px' // extra breathing room at bottom
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient Name *</label>
            <input name="patient" required value={form.patient} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="patient@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Visit Type *</label>
            <select name="type" value={form.type} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px' }}>
              <option value="Consultation">Consultation</option>
              <option value="Inpatient">Inpatient</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Time *</label>
              <input type="time" name="time" required value={form.time} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="Booked">Booked</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Doctor / Provider *</label>
            <input name="provider" required value={form.provider} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Patient's Concerns / Chief Complaint</label>
            <textarea
              name="concerns"
              value={form.concerns}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the main reason for visit..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label>Physical Attributes</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px' }}>Height (cm)</label>
                <input type="text" name="height" value={form.height} onChange={handleChange} placeholder="170" />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>Weight (kg)</label>
                <input type="text" name="weight" value={form.weight} onChange={handleChange} placeholder="65" />
              </div>
              <div>
                <label style={{ fontSize: '12px' }}>Blood Pressure</label>
                <input type="text" name="blood_pressure" value={form.blood_pressure} onChange={handleChange} placeholder="120/80" />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Health Status</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px' }}>Allergies</label>
                <textarea name="allergies" value={form.allergies} onChange={handleChange} rows="2" placeholder="Penicillin, Dust, etc." />
              </div>
              <div>
                <label style={{ fontSize: '13px' }}>Chronic Conditions</label>
                <textarea name="chronic_conditions" value={form.chronic_conditions} onChange={handleChange} rows="2" placeholder="Diabetes, Hypertension, etc." />
              </div>
            </div>
          </div>

          <fieldset className="form-group" style={{ marginTop: '20px' }}>
            <legend>Billing</legend>
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                <input
                  type="radio"
                  name="billing_type"
                  value="Cash"
                  checked={form.billing_type === 'Cash'}
                  onChange={handleChange}
                />
                Cash
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                <input
                  type="radio"
                  name="billing_type"
                  value="Insurance"
                  checked={form.billing_type === 'Insurance'}
                  onChange={handleChange}
                />
                Insurance
              </label>
            </div>
          </fieldset>

          {form.billing_type === 'Insurance' && (
            <div className="form-group">
              <label>Insurance Provider</label>
              <input name="insurance_provider" value={form.insurance_provider} onChange={handleChange} />
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '32px' }}>
            <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default NewAppointment;