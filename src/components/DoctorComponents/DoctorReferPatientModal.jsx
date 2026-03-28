// src/components/DoctorComponents/DoctorReferPatientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, FileText, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorReferPatientModal = ({
  isOpen,
  onClose,
  appointment,
  patientData,
  currentDoctorName = 'Dr. Test OP Doctor',
  onReferralSuccess,
}) => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    try {
      const res = await apiClient.get('/op/doctors');
      setDoctors(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setError('Could not load available doctors');
    }
  };

  const toIdString = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id.trim();
    if (typeof id === 'object') {
      return id.$oid || id._id?.$oid || id.toString?.() || '';
    }
    return String(id).trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!appointment || !selectedDoctor) {
      setError('Please select a doctor to refer to');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const patientId = toIdString(appointment.patient_id || patientData?._id);
      const phone = appointment.phone || patientData?.phone || patientData?.mobile || '';

      if (!patientId) throw new Error('Patient ID is missing');
      if (!phone) throw new Error('Patient phone number is required for referral');

      const referralData = {
        patient_id: patientId,
        patient_name: appointment.patient_name || patientData?.patient_name || 'Unknown Patient',
        provider: selectedDoctor,           // ← This is what the error was complaining about
        provider_name: selectedDoctor,      // ← Also send as provider_name for maximum compatibility
        phone: phone,
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        visit_type: 'Referral',
        status: 'Pending',
        referral_from: currentDoctorName,
        referral_notes: notes.trim() || '',
        referred_from_appointment_id: toIdString(appointment._id || appointment.id),
        concerns: `Referral from ${currentDoctorName}: ${notes}`,
        billing_type: 'Cash',
      };

      // Use dedicated referral endpoint (we will add it)
      const res = await apiClient.post('/op/referral', referralData);

      if (res.data?.status === 'success') {
        alert('✅ Referral appointment created successfully');
        onReferralSuccess?.();
        onClose();
      } else {
        throw new Error(res.data?.message || 'Failed to create referral');
      }
    } catch (err) {
      console.error('Referral creation failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!appointment) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Refer</h2>
          <p className="text-gray-600 mb-6">Patient information is missing.</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Refer Patient to Another Doctor</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
              <User size={28} className="text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{appointment.patient_name || 'Unknown Patient'}</h3>
              <p className="text-sm text-gray-600">
                Phone: {appointment.phone || patientData?.phone || patientData?.mobile || '—'} • 
                File: {appointment.file_number || '—'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referring to <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select a doctor...</option>
              {doctors.map((doc) => (
                <option key={doc._id || doc.id} value={doc.name || doc.provider_name}>
                  {doc.name || doc.provider_name} {doc.specialty && `(${doc.specialty})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Referral / Clinical Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Symptoms, suspected diagnosis, urgency level..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDoctor}
              className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 ${loading || !selectedDoctor ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Creating Referral...
                </>
              ) : (
                'Confirm & Create Referral'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorReferPatientModal;