// src/components/admin/PatientDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, User, Phone, MapPin, Building, CreditCard, Percent } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const PatientDetailModal = ({ patient, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patient) fetchDetail();
  }, [patient]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
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
      const res = await apiClient.get(`/admin/encounter/${appointmentId}`, { responseType: 'json' });
      if (res.data.status === 'error') {
        alert(res.data.message || 'No encounter document available.');
        return;
      }
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `encounter_${appointmentId}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert(err.response?.status === 404 ? 'No encounter document found.' : 'Failed to download encounter.');
    }
  };

  const formatDOB = (dob) => {
    if (!dob) return '-';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob;
    try {
      const date = new Date(dob);
      if (isNaN(date.getTime())) return dob;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dob;
    }
  };

  if (!patient) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-[var(--primary-color)]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User size={26} className="text-[var(--primary-color)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 truncate">
                {patient.patient_name || 'Patient Profile'}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                File #{detail?.file_number || patient.file_number || '-'} 
                <span className="text-[var(--primary-color)]">•</span> 
                {patient.phone || detail?.phone || '-'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <X size={26} />
          </button>
        </div>

        {/* Scrollable Content – FIXED SCROLLING */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading patient profile...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : detail ? (
            <>
              {/* PERSONAL INFORMATION */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-[var(--primary-color)]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 bg-gray-50 rounded-2xl p-5 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">File No / EID</div>
                    <div className="font-semibold mt-0.5">{detail.file_number || detail.eid || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Phone</div>
                    <div className="font-semibold mt-0.5 flex items-center gap-1">
                      <Phone size={15} /> {detail.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Gender • DOB</div>
                    <div className="font-semibold mt-0.5">
                      {detail.gender || '-'} • {formatDOB(detail.dob)}
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Address</div>
                    <div className="mt-1 flex gap-2 leading-relaxed">
                      <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      {detail.address || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Company</div>
                    <div className="font-semibold mt-0.5 flex items-center gap-1">
                      <Building size={15} /> {detail.company_name || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* BILLING & INSURANCE – NOW COMPACT & ALWAYS RENDERS DATA */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-[var(--primary-color)]" />
                  Insurance &amp; Billing Details
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-4 py-1 text-sm font-semibold rounded-3xl ${
                      (detail.billing_type || 'Cash') === 'Insurance'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {detail.billing_type || 'Cash'}
                    </span>

                    {(detail.billing_type || 'Cash') === 'Insurance' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-sm">
                        <div>
                          <span className="text-gray-500 block text-xs">Receiver</span>
                          <span className="font-medium">{detail.receiver || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Payer</span>
                          <span className="font-medium">{detail.payer || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-xs">Network</span>
                          <span className="font-medium">{detail.network || '-'}</span>
                        </div>
                        {detail.member_id && (
                          <div>
                            <span className="text-gray-500 block text-xs">Member ID</span>
                            <span className="font-medium">{detail.member_id}</span>
                          </div>
                        )}
                        {detail.discount_percent && parseFloat(detail.discount_percent) > 0 && (
                          <div className="col-span-2 sm:col-span-1 flex items-center gap-1 text-amber-600 font-medium text-xs mt-1">
                            <Percent size={14} />
                            Discount: {detail.discount_percent}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        Cash payment – No insurance details required
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RECENT VISITS */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2">
                  <Calendar size={18} className="text-[var(--primary-color)]" />
                  Recent Visits &amp; Encounters
                </h3>

                {detail.recent_visits?.length > 0 ? (
                  <div className="space-y-3">
                    {detail.recent_visits.map((visit) => (
                      <div
                        key={visit._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl p-4 transition-all text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {visit.date} • {visit.time || ''}
                          </div>
                          <div className="text-gray-600">
                            {visit.visit_type || 'Consultation'} • Dr. {visit.provider_name || '-'}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                          <span className={`px-3.5 py-1 text-xs font-medium rounded-3xl whitespace-nowrap ${
                            visit.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            visit.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {visit.status}
                          </span>
                          <button
                            onClick={() => downloadEncounter(visit._id)}
                            disabled={visit.status !== 'Completed'}
                            className="flex items-center gap-1.5 text-[var(--primary-color)] hover:text-teal-700 disabled:opacity-40 font-medium text-sm"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl py-10 text-center text-gray-400 text-sm">
                    No visits or encounter records yet
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;