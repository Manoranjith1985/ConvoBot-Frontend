// src/components/admin/ReferPatientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const ReferPatientModal = ({ isOpen, onClose, targetDoctor, onReferralCreated }) => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Using existing endpoint - in production better to have /admin/patients
      const res = await apiClient.get('/admin/dashboard/recent-patients?limit=100');
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone || '').includes(searchTerm) ||
    (p.file_number || '').includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }

    const selectedPatient = patients.find(p => p._id === selectedPatientId || p.id === selectedPatientId);
    if (!selectedPatient) return;

    try {
      // Create new appointment / referral record
      await apiClient.post('/admin/appointments', {
        patient_id: selectedPatient._id || selectedPatient.id,
        patient_name: selectedPatient.full_name || selectedPatient.patient_name,
        provider_name: targetDoctor.name,
        date: new Date().toISOString().split('T')[0], // today or let admin choose later
        time: "09:00", // placeholder - improve later with time picker
        visit_type: "Referral",
        status: "Pending",
        referral_from: "Clinic Admin", // or current user name/role
        referral_notes: referralNotes.trim() || undefined,
        created_at: new Date().toISOString()
      });

      alert('Referral created successfully');
      onReferralCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create referral');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            Refer Patient to {targetDoctor.name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Search & Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Patient *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, file number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              />
            </div>

            <div className="mt-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {loading ? (
                <p className="p-4 text-center text-gray-500">Loading patients...</p>
              ) : filteredPatients.length === 0 ? (
                <p className="p-4 text-center text-gray-500">No patients found</p>
              ) : (
                filteredPatients.map(patient => (
                  <label
                    key={patient._id || patient.id}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                      selectedPatientId === (patient._id || patient.id) ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="patient"
                      value={patient._id || patient.id}
                      checked={selectedPatientId === (patient._id || patient.id)}
                      onChange={() => setSelectedPatientId(patient._id || patient.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{patient.full_name || patient.patient_name}</div>
                      <div className="text-sm text-gray-600">
                        {patient.phone ? `${patient.phone} • ` : ''}
                        {patient.file_number || patient.eid || 'No ID'}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Referral Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Remarks / Reason
            </label>
            <textarea
              value={referralNotes}
              onChange={e => setReferralNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Clinical reason for referral, symptoms, required specialty input..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90"
            >
              Confirm Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferPatientModal;