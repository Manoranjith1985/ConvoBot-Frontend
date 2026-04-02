import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import AppointmentForm from '../../components/OPComponents/AppointmentForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Default empty form state
const initialForm = {
  date: new Date().toISOString().split('T')[0],
  time: '09:00',
  patient_name: '',
  eid: '',
  file_number: '',
  phone: '',
  dob: '',
  gender: 'Male',
  address: '',
  company_name: '',
  provider: '',
  visit_type: 'Consultation',
  billing_type: 'Cash',
  receiver: '',
  payer: '',
  network: '',
  member_id: '',
  discount_percent: '0',
  concerns: '',
  height: '',
  weight: '',
  bp_systolic: '',
  bp_diastolic: '',
  blood_pressure: '',
  allergies: '',
  chronic_conditions: '',
  patient_id: '',
  existingDocuments: [],
  attached_document_ids: [],
  attachedDocuments: [],
  currentDocumentType: '',
  ai_consent: false,
};

const NewAppointment = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [rawDoctors, setRawDoctors] = useState([]);           // Original list from backend
  const [doctorsWithAvailability, setDoctorsWithAvailability] = useState([]); // Enriched list
  const [receivers, setReceivers] = useState([]);
  const [payers, setPayers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Load raw doctors and masters once
  useEffect(() => {
    apiClient.get('/appt/doctors')
      .then(res => {
        const data = res.data.data || res.data || [];
        setRawDoctors(Array.isArray(data) ? data : []);
        setDoctorsWithAvailability(Array.isArray(data) ? data : []); // Initial copy
      })
      .catch(err => {
        console.error('Failed to load doctors:', err);
        setRawDoctors([]);
        setDoctorsWithAvailability([]);
      });

    // Load insurance masters
    const masters = [
      { url: '/admin/masters/receiver', setter: setReceivers },
      { url: '/admin/masters/payer', setter: setPayers },
      { url: '/admin/masters/network', setter: setNetworks },
    ];

    masters.forEach(m => {
      apiClient.get(m.url)
        .then(res => {
          const data = res.data.data || res.data || [];
          m.setter(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error(`Failed to load ${m.url}:`, err));
    });
  }, []);

  // Real-time availability check
  useEffect(() => {
    if (!form.date || !form.time || rawDoctors.length === 0) {
      setDoctorsWithAvailability(rawDoctors);
      return;
    }

    const checkAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const res = await apiClient.get('/appt/doctors/availability', {
          params: { date: form.date, time: form.time }
        });

        if (res.data.status === 'success') {
          const availabilityMap = res.data.data.reduce((acc, avail) => {
            acc[avail.name] = avail;
            return acc;
          }, {});

          // Merge availability info without losing any doctor
          const enriched = rawDoctors.map(doc => {
            const availInfo = availabilityMap[doc.name];
            return {
              ...doc,
              is_available: availInfo?.is_available ?? false,
              availability_reason: availInfo?.reason || 'No schedule defined',
              shift: availInfo?.shift || '—',
            };
          });

          setDoctorsWithAvailability(enriched);
        }
      } catch (err) {
        console.error('Availability check failed:', err);
        // Fallback: keep raw doctors
        setDoctorsWithAvailability(rawDoctors);
      } finally {
        setLoadingAvailability(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [form.date, form.time, rawDoctors]);

  const resetForm = () => {
    setForm(initialForm);
    setSearch('');
    setSearchResults([]);
  };

  const handlePatientSearch = async (e) => {
    const q = e.target.value.trim();
    setSearch(q);

    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await apiClient.get(`/op/patient_search?query=${encodeURIComponent(q)}`);
      if (res.data.status === 'success') {
        setSearchResults(res.data.data || []);
      }
    } catch (err) {
      console.error('Patient search failed:', err);
      setSearchResults([]);
    }
  };

  const getDisplayName = (p) => p.name || p.patient_name || 'Unknown Patient';

  const getSecondaryInfo = (p) => {
    const parts = [];
    if (p.phone) parts.push(p.phone);
    if (p.file_number) parts.push(`File: ${p.file_number}`);
    if (p.eid) parts.push(`EID: ${p.eid}`);
    if (p.dob) parts.push(`DOB: ${p.dob}`);
    return parts.length > 0 ? parts.join(' • ') : 'No additional info';
  };

  const selectPatient = (patient) => {
    const name = patient.name || patient.patient_name || '';

    setForm({
      ...initialForm,
      patient_name: name,
      eid: patient.eid || '',
      file_number: patient.file_number || '',
      phone: patient.phone || '',
      dob: patient.dob || '',
      gender: patient.gender || 'Male',
      address: patient.address || '',
      company_name: patient.company_name || '',
      allergies: patient.allergies || '',
      chronic_conditions: patient.chronic_conditions || '',
      patient_id: patient.id || patient._id || '',
      existingDocuments: patient.documents || [],
      attached_document_ids: [],
      attachedDocuments: [],
    });

    setSearch(name);
    setSearchResults([]);
    setShowForm(true);
  };

  const handleAddNewPatient = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.patient_name?.trim()) return alert('Patient name is required');
    if (!form.phone?.trim()) return alert('Phone number is required');
    if (!form.provider) return alert('Please select a doctor');
    if (!form.date) return alert('Appointment date is required');
    if (!form.time) return alert('Appointment time is required');
    if (!form.ai_consent) return alert("You must consent to AI-assisted documentation to book this appointment.");

    try {
      const payload = {
        ...form,
        attached_document_ids: form.attached_document_ids || [],
        ai_consent: form.ai_consent,
      };

      const res = await apiClient.post('/api/appt/', payload);

      if (res.data.status === 'success') {
        alert('Appointment created successfully!');
        navigate('/op-dashboard');
      } else {
        alert(res.data.message || 'Failed to create appointment');
      }
    } catch (err) {
      console.error('Appointment creation error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error creating appointment.';
      alert(msg);
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
              placeholder="Search by name, phone, file number, EID..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2 mb-6">
              {searchResults.map((p, i) => (
                <div
                  key={i}
                  onClick={() => selectPatient(p)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <p className="font-medium">{getDisplayName(p)}</p>
                  <p className="text-sm text-gray-600">{getSecondaryInfo(p)}</p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center my-6">
            <button
              onClick={handleAddNewPatient}
              className="flex items-center gap-2 mx-auto px-6 py-3 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 font-medium transition-colors"
            >
              <UserPlus size={20} /> Add New Patient & Book Appointment
            </button>
          </div>

          {showForm && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-xl font-semibold mb-6">
                {form.patient_name ? 'Update Patient & Appointment' : 'New Patient & Appointment Details'}
              </h2>

              <AppointmentForm
                form={form}
                setForm={setForm}
                doctors={doctorsWithAvailability}     // ← Use enriched list
                receivers={receivers}
                payers={payers}
                networks={networks}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  resetForm();
                }}
                loadingAvailability={loadingAvailability}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointment;