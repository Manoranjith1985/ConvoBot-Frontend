// src/components/admin/PatientDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, FileText } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const PatientDetailModal = ({ patient, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) {
      fetchDetail();
    }
  }, [patient]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/admin/patients/${patient._id || patient.id}`);
      setDetail(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const downloadEncounter = async (appointmentId) => {
    try {
      const res = await apiClient.get(`/admin/encounter/${appointmentId}`, {
        responseType: 'json'  // ← change to json first to handle errors
      });
  
      if (res.data.status === 'error') {
        alert(res.data.message || 'No encounter document available for this appointment.');
        return;
      }
  
      // If success, assume we want to download JSON for now
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `encounter_${appointmentId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
    } catch (err) {
      console.error('Encounter download error:', err);
      if (err.response?.status === 404) {
        alert('No encounter document found for this appointment.');
      } else {
        alert('Failed to download encounter document. Please try again.');
      }
    }
  };

  if (!patient) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">
            {patient.patient_name || 'Patient Details'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={28} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading patient details...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : detail ? (
          <div className="p-6 space-y-8">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b">
              <div>
                <div className="text-sm text-gray-500">File / EID</div>
                <div className="font-medium mt-1">{detail.file_number || detail.eid || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium mt-1">{detail.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Gender • DOB</div>
                <div className="font-medium mt-1">
                  {detail.gender || '-'} • {detail.dob || '-'}
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm text-gray-500">Address</div>
                <div className="mt-1">{detail.address || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="mt-1">{detail.company_name || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-500">Billing Type</div>
                <div className="font-medium mt-1">
                  {detail.billing_type || 'Cash'}
                  {detail.billing_type === 'Insurance' && (
                    <span className="ml-3 text-sm text-gray-600">
                      {detail.receiver} / {detail.payer} / {detail.network} • ID: {detail.member_id || '-'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Visits / Encounters */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} /> Recent Visits & Encounters
              </h3>

              {detail.recent_visits?.length > 0 ? (
                <div className="space-y-4">
                  {detail.recent_visits.map(visit => (
                    <div 
                      key={visit._id}
                      className="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-lg">
                            {visit.date} • {visit.time}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {visit.visit_type} • Dr. {visit.provider_name}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          visit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          visit.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {visit.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => downloadEncounter(visit._id)}
                          className="flex items-center gap-2 text-sm text-[var(--primary-color)] hover:underline"
                          disabled={visit.status !== 'Completed'}
                          title={visit.status !== 'Completed' ? 'Document available after completion' : ''}
                        >
                          <Download size={16} />
                          Download Encounter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                  No visit or encounter records yet
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PatientDetailModal;