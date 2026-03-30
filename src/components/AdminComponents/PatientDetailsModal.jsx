// src/components/admin/PatientDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Download, User, Phone, MapPin, Building, 
  CreditCard, Percent, Upload, FileText, Image as ImageIcon 
} from 'lucide-react';
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
      
      if (res.data.status === 'success') {
        setDetail(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load details');
      }
    } catch (err) {
      console.error('Fetch patient detail error:', err);
      setError('Failed to load patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Direct backend document view (bypasses React Router)
  // FIXED: Use correct blueprint prefix
const viewDocument = (doc) => {
  if (!doc) return;
  
  const docId = doc._id || doc.id;
  if (!docId) {
    alert("Invalid document ID");
    return;
  }

  // Use /admin/documents/... (matching your blueprint)
  const viewUrl = `${apiClient.defaults.baseURL}/admin/documents/${docId}/view`;
  window.open(viewUrl, '_blank');
};

  const formatDOB = (dob) => {
    if (!dob) return '-';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) return dob;
    try {
      const date = new Date(dob);
      if (isNaN(date.getTime())) return String(dob);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return String(dob);
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
        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User size={26} className="text-teal-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-semibold text-gray-900 truncate">
                {patient.patient_name || detail?.patient_name || 'Patient Profile'}
              </h2>
              <p className="text-sm text-gray-500">
                File #{detail?.file_number || patient.file_number || '-'} • {patient.phone || detail?.phone || '-'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="py-20 text-center text-gray-500">Loading patient profile...</div>
          ) : error ? (
            <div className="py-20 text-center text-red-600">{error}</div>
          ) : detail ? (
            <>
              {/* Personal Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={18} className="text-teal-600" />
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

              {/* Billing & Insurance */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={18} className="text-teal-600" />
                  Insurance & Billing Details
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

                    {(detail.billing_type || 'Cash') === 'Insurance' && (
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
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Visits */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2 border-b pb-2">
                  <Calendar size={18} className="text-teal-600" />
                  Recent Visits & Encounters
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
                            visit.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {visit.status || 'Booked'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl py-10 text-center text-gray-400 text-sm">
                    No visits recorded yet
                  </div>
                )}
              </div>

              {/* DOCUMENTS SECTION - FIXED & VISIBLE */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload size={18} className="text-teal-600" />
                  Patient Documents
                </h3>

                {detail.existingDocuments && detail.existingDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {detail.existingDocuments.map((doc) => {
                      const docId = doc._id || doc.id;
                      const isImage = doc.mime_type?.startsWith('image');
                      return (
                        <div
                          key={docId}
                          onClick={() => viewDocument(doc)}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer flex gap-4 items-start group"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border flex-shrink-0">
                            {isImage ? (
                              <ImageIcon size={28} className="text-teal-600" />
                            ) : (
                              <FileText size={28} className="text-teal-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                              {doc.file_name || `Document ${docId}`}
                            </p>
                            {doc.document_type && (
                              <p className="text-xs text-teal-600 capitalize mt-0.5">
                                {doc.document_type.replace(/_/g, ' ')}
                              </p>
                            )}
                            {doc.created_at && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {typeof doc.created_at === 'string' 
                                  ? doc.created_at 
                                  : new Date(doc.created_at).toLocaleDateString('en-GB')}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl py-12 text-center text-gray-400">
                    No documents uploaded for this patient yet
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