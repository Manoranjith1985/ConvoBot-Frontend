// src/components/admin/PatientForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const PatientForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [receivers, setReceivers] = useState([]);
  const [payers, setPayers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Fetch Insurance Masters
  useEffect(() => {
    const fetchMasters = async () => {
      setLoadingMasters(true);
      try {
        const [recRes, payRes, netRes] = await Promise.all([
          apiClient.get('/admin/masters/receiver'),
          apiClient.get('/admin/masters/payer'),
          apiClient.get('/admin/masters/network'),
        ]);

        setReceivers(recRes.data.data || recRes.data || []);
        setPayers(payRes.data.data || payRes.data || []);
        setNetworks(netRes.data.data || netRes.data || []);
      } catch (err) {
        console.error('Failed to load insurance masters:', err);
        setReceivers([]);
        setPayers([]);
        setNetworks([]);
      } finally {
        setLoadingMasters(false);
      }
    };

    fetchMasters();
  }, []);

  // Sync attached_document_ids when editing
  useEffect(() => {
    if (isEdit && formData.existingDocuments) {
      setFormData(prev => ({
        ...prev,
        attached_document_ids: prev.attached_document_ids || []
      }));
    }
  }, [isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==================== DOCUMENT UPLOAD HANDLERS (FIXED) ====================
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // IMPORTANT: Require document type selection
    if (!formData.currentDocumentType) {
      alert("Please select a Document Type before uploading.");
      return;
    }

    setUploading(true);
    const newAttachedIds = [...(formData.attached_document_ids || [])];

    for (const file of files) {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('document_type', formData.currentDocumentType);   // ← FIXED: Use selected type

      try {
        const res = await apiClient.post('/admin/documents', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.document_id) {
          newAttachedIds.push(res.data.document_id);
        } else if (res.data.id) {
          newAttachedIds.push(res.data.id);
        }
      } catch (err) {
        console.error('File upload failed:', err);
        const errorMsg = err.response?.data?.error || 'Upload failed. Please try again.';
        alert(`Failed to upload ${file.name}: ${errorMsg}`);
      }
    }

    setFormData((prev) => ({
      ...prev,
      attached_document_ids: newAttachedIds,
    }));
    setUploading(false);
  };

  const removeAttachedDocument = (index) => {
    const updated = [...(formData.attached_document_ids || [])];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, attached_document_ids: updated }));
  };

  const removeExistingDocument = (docId) => {
    const updatedExisting = (formData.existingDocuments || []).filter(
      (doc) => (doc._id || doc.id) !== docId
    );
    setFormData((prev) => ({ ...prev, existingDocuments: updatedExisting }));
  };

  // ==================== RENDER ====================
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Personal & Insurance Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            name="patient_name"
            value={formData.patient_name || ''}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="tel"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">File Number</label>
          <input
            type="text"
            name="file_number"
            value={formData.file_number || ''}
            onChange={handleChange}
            placeholder="Internal file number"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">EID / Emirates ID</label>
          <input
            type="text"
            name="eid"
            value={formData.eid || ''}
            onChange={handleChange}
            placeholder="EID number"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select
            name="gender"
            value={formData.gender || 'Male'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Full address"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name || ''}
            onChange={handleChange}
            placeholder="Company / Employer"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Billing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Type</label>
          <select
            name="billing_type"
            value={formData.billing_type || 'Cash'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Cash">Cash</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>

        {/* Insurance Fields */}
        {formData.billing_type === 'Insurance' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Receiver {loadingMasters && <span className="text-xs text-gray-400">(loading...)</span>}
              </label>
              <select
                name="receiver"
                value={formData.receiver || ''}
                onChange={handleChange}
                disabled={loadingMasters}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Receiver</option>
                {receivers.map((r) => (
                  <option key={r._id || r.id} value={r.name || r.receiver || r.code}>
                    {r.name || r.receiver || r.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payer {loadingMasters && <span className="text-xs text-gray-400">(loading...)</span>}
              </label>
              <select
                name="payer"
                value={formData.payer || ''}
                onChange={handleChange}
                disabled={loadingMasters}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Payer</option>
                {payers.map((p) => (
                  <option key={p._id || p.id} value={p.name || p.payer || p.code}>
                    {p.name || p.payer || p.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Network {loadingMasters && <span className="text-xs text-gray-400">(loading...)</span>}
              </label>
              <select
                name="network"
                value={formData.network || ''}
                onChange={handleChange}
                disabled={loadingMasters}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Network</option>
                {networks.map((n) => (
                  <option key={n._id || n.id} value={n.name || n.network || n.code}>
                    {n.name || n.network || n.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Member ID</label>
              <input
                type="text"
                name="member_id"
                value={formData.member_id || ''}
                onChange={handleChange}
                placeholder="Member ID"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Discount % - FIXED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount %</label>
              <input
                type="number"
                name="discount_percent"
                value={formData.discount_percent !== undefined ? formData.discount_percent : 0}
                onChange={(e) => {
                  let value = e.target.value;
                  
                  // Allow empty input while typing
                  if (value === '') {
                    setFormData((prev) => ({ ...prev, discount_percent: '' }));
                    return;
                  }

                  // Convert to number and clamp between 0 and 100
                  let num = parseFloat(value);
                  if (isNaN(num)) num = 0;
                  
                  // Clamp value
                  num = Math.max(0, Math.min(100, num));
                  
                  setFormData((prev) => ({ ...prev, discount_percent: num }));
                }}
                min="0"
                max="100"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter value between 0 and 100</p>
            </div>
          </>
        )}
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={20} className="text-teal-600" /> Patient Documents
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload EID, insurance card, claim forms, lab reports, TOB, etc.
        </p>

        {/* Document Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currentDocumentType || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, currentDocumentType: e.target.value }))}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Select Document Type</option>
            <option value="eid">Emirates ID (EID)</option>
            <option value="insurance_card_front">Insurance Card - Front</option>
            <option value="insurance_card_back">Insurance Card - Back</option>
            <option value="tob">Table of Benefits (TOB)</option>
            <option value="claim_form">Claim Form</option>
            <option value="lab_report">Lab Report</option>
            <option value="photo_id">Government Photo ID</option>
            <option value="proof_of_address">Proof of Address</option>
            <option value="consent_form">Signed Consent / AI Consent</option>
            <option value="referral_letter">Referral Letter</option>
            <option value="other">Other Document</option>
          </select>
        </div>

        {/* Upload Area */}
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-teal-400 hover:bg-teal-50 transition-all">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="font-medium text-gray-700">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG • Max 10MB</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || !formData.currentDocumentType}
            />
          </div>
        </label>

        {uploading && <p className="text-center text-teal-600 text-sm mt-3">Uploading...</p>}

        {/* Newly Attached Files - Now shows Document Type */}
        {(formData.attached_document_ids?.length || 0) > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Newly Attached Files</p>
            <div className="space-y-3">
              {formData.attached_document_ids.map((docId, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-teal-600" />
                    <div>
                      <span className="text-sm text-gray-700">Document ID: {docId}</span>
                      <p className="text-xs text-teal-600 capitalize">
                        {formData.currentDocumentType ? formData.currentDocumentType.replace(/_/g, ' ') : 'Unknown Type'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachedDocument(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Documents */}
        {(formData.existingDocuments?.length || 0) > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Existing Documents</p>
            <div className="space-y-3">
              {formData.existingDocuments.map((doc) => {
                const docId = doc._id || doc.id;
                return (
                  <div key={docId} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      {doc.mime_type?.startsWith('image') ? (
                        <ImageIcon size={20} className="text-teal-600" />
                      ) : (
                        <FileText size={20} className="text-teal-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{doc.file_name || `Document ${docId}`}</p>
                        {doc.document_type && (
                          <p className="text-xs text-teal-600 capitalize">
                            {doc.document_type.replace(/_/g, ' ')}
                          </p>
                        )}
                        {doc.created_at && (
                          <p className="text-xs text-gray-500">
                            Uploaded: {typeof doc.created_at === 'string' ? doc.created_at : '—'}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingDocument(docId)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-8 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium transition-colors"
        >
          {isEdit ? 'Update Patient' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
