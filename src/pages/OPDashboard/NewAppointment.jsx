// src/pages/OPDashboard/NewAppointment.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';
import AppointmentForm from '../../components/OPComponents/AppointmentForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const NewAppointment = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [payers, setPayers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    patient: '',
    eid: '',
    fileNumber: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    companyName: '',
    provider: '',
    type: 'Consultation',
    billing_type: 'Cash',
    receiver: '',
    payer: '',
    network: '',
    memberId: '',
    discount_percent: '0',
    concerns: '',
    height: '',
    weight: '',
    blood_pressure: '',
    allergies: '',
    chronic_conditions: '',
  });

  useEscapeKey(() => {
    if (showForm) setShowForm(false);
  });

  useEffect(() => {
    // Load doctors
    apiClient.get('/op/doctors')
      .then(res => setDoctors(res.data?.data || []))
      .catch(console.error);

    // Load masters for dropdowns
    const masters = [
      { url: '/admin/masters/receiver', setter: setReceivers },
      { url: '/admin/masters/payer', setter: setPayers },
      { url: '/admin/masters/network', setter: setNetworks }
    ];

    masters.forEach(m => {
      apiClient.get(m.url)
        .then(res => m.setter(res.data.data || []))
        .catch(console.error);
    });
  }, []);

  const handlePatientSearch = async (e) => {
    const q = e.target.value.trim();
    setSearch(q);
    setForm(f => ({ ...f, patient: q }));

    if (q.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await apiClient.get(`/admin/dashboard/recent-patients?search=${encodeURIComponent(q)}&limit=10`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Patient search error:', err);
    }
  };

  const selectPatient = (patient) => {
    setForm(f => ({
      ...f,
      patient: patient.full_name || patient.patient_name || '',
      eid: patient.eid || '',
      fileNumber: patient.file_number || '',
      phone: patient.phone || '',
      dob: patient.dob || '',
      gender: patient.gender || 'Male',
      address: patient.address || '',
      companyName: patient.company_name || '',
      billing_type: patient.billing_type || 'Cash',
      receiver: patient.receiver || '',
      payer: patient.payer || '',
      network: patient.network || '',
      memberId: patient.member_id || '',
      discount_percent: patient.discount_percent || '0',
      height: patient.height || '',
      weight: patient.weight || '',
      blood_pressure: patient.blood_pressure || '',
      allergies: patient.allergies || '',
      chronic_conditions: patient.chronic_conditions || ''
    }));
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/admin/appointments', form);
      if (res.data.status === 'success') {
        alert('Appointment created successfully');
        navigate('/op-dashboard');
      } else {
        alert('Failed to create appointment');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/op-dashboard')}
          className="flex items-center gap-2 text-teal-600 hover:underline mb-6"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Appointment</h1>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Search Existing Patient</h2>

          <div className="relative mb-4">
            <input
              value={search}
              onChange={handlePatientSearch}
              placeholder="Search by name, phone, file number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 max-h-60 overflow-y-auto space-y-2 mb-6">
              {searchResults.map((p, i) => (
                <div
                  key={i}
                  onClick={() => selectPatient(p)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <p className="font-medium">{p.full_name || p.patient_name}</p>
                  <p className="text-sm text-gray-600">
                    {p.phone} • {p.file_number || p.eid || 'No ID'}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 font-medium transition-colors"
            >
              <UserPlus size={20} /> Add New Patient & Book Appointment
            </button>
          </div>

          {showForm && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-xl font-semibold mb-6">New Patient & Appointment Details</h2>
              <AppointmentForm
                form={form}
                setForm={setForm}
                doctors={doctors}
                receivers={receivers}
                payers={payers}
                networks={networks}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointment;