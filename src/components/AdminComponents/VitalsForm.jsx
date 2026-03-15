// src/components/admin/VitalsForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const VitalsForm = ({ patientId, onSave }) => {
  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    temp: '',
    weight: '',
    height: '',
    glucose: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/vitals', { patient_id: patientId, ...vitals });
      alert('Vitals recorded');
      onSave?.();
    } catch (err) {
      alert('Failed to save vitals');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input name="bp" value={vitals.bp} onChange={handleChange} placeholder="Blood Pressure" className="px-4 py-2 border rounded-lg" />
        <input name="pulse" value={vitals.pulse} onChange={handleChange} placeholder="Pulse" className="px-4 py-2 border rounded-lg" />
        <input name="temp" value={vitals.temp} onChange={handleChange} placeholder="Temperature" className="px-4 py-2 border rounded-lg" />
        <input name="weight" value={vitals.weight} onChange={handleChange} placeholder="Weight (kg)" className="px-4 py-2 border rounded-lg" />
        <input name="height" value={vitals.height} onChange={handleChange} placeholder="Height (cm)" className="px-4 py-2 border rounded-lg" />
        <input name="glucose" value={vitals.glucose} onChange={handleChange} placeholder="Glucose" className="px-4 py-2 border rounded-lg" />
      </div>
      <button type="submit" className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg">
        Record Vitals
      </button>
    </form>
  );
};

export default VitalsForm;