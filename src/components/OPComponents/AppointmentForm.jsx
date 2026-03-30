// src/components/OPComponents/AppointmentForm.jsx
import React from 'react';
import { X, Save, AlertCircle, Upload, FileText } from 'lucide-react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const AppointmentForm = ({
  form,
  setForm,
  doctors,
  receivers,
  payers,
  networks,
  onSubmit,
  onCancel,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Document Upload Handler
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !form.currentDocumentType) {
      if (!form.currentDocumentType) alert("Please select a Document Type first.");
      return;
    }

    const newAttached = [...(form.attachedDocuments || [])];   // New structure: array of objects

    for (const file of files) {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('document_type', form.currentDocumentType);

      try {
        const res = await apiClient.post('/admin/documents', formPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.document_id) {
          newAttached.push({
            document_id: res.data.document_id,
            file_name: file.name,
            document_type: form.currentDocumentType,
          });
        }
      } catch (err) {
        console.error('File upload failed:', err);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setForm((prev) => ({
      ...prev,
      attachedDocuments: newAttached,           // Store full objects
      attached_document_ids: newAttached.map(item => item.document_id), // For backend
      currentDocumentType: '',                  // Reset type
    }));
  };

  const removeAttachedDocument = (index) => {
    const updated = [...(form.attachedDocuments || [])];
    updated.splice(index, 1);

    setForm((prev) => ({
      ...prev,
      attachedDocuments: updated,
      attached_document_ids: updated.map(item => item.document_id),
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Patient Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            name="patient_name"
            value={form.patient_name || ''}
            onChange={handleChange}
            placeholder="Full name"
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
            value={form.phone || ''}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            File Number
            {form.file_number && <span className="text-xs text-gray-500 ml-2">(existing patient)</span>}
          </label>
          <input
            type="text"
            name="file_number"
            value={form.file_number || ''}
            readOnly
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed ${
              form.file_number ? 'font-medium' : 'italic text-gray-400'
            }`}
            placeholder={form.file_number ? form.file_number : "Auto-generated for new patients"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            EID <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            name="eid"
            value={form.eid || ''}
            onChange={handleChange}
            placeholder="EID number"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="date"
            name="dob"
            value={form.dob || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="gender"
            value={form.gender || 'Male'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            name="address"
            value={form.address || ''}
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
            value={form.company_name || ''}
            onChange={handleChange}
            placeholder="Employer / Company"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Appointment Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Doctor <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="provider"
            value={form.provider || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc._id} value={doc.name}>
                {doc.name} {doc.specialty ? `(${doc.specialty})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Visit Type <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="visit_type"
            value={form.visit_type || 'Consultation'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Consultation">Consultation</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Check-up">Check-up</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="date"
            name="date"
            value={form.date || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="time"
            name="time"
            value={form.time || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Billing Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Billing Type <span className="text-red-500">*</span>
          </label>
          <select
            required
            name="billing_type"
            value={form.billing_type || 'Cash'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="Cash">Cash</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>

        {form.billing_type === 'Insurance' && (
          <>
            {/* Receiver Dropdown - FIXED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Receiver <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="receiver"
                value={form.receiver || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Receiver</option>
                {receivers.map((r) => (
                  <option key={r._id} value={r.description || r.code}>
                    {r.description || r.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Payer Dropdown - FIXED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payer <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="payer"
                value={form.payer || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Payer</option>
                {payers.map((p) => (
                  <option key={p._id} value={p.description || p.code}>
                    {p.description || p.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Network Dropdown - FIXED */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Network <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="network"
                value={form.network || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select Network</option>
                {networks.map((n) => (
                  <option key={n._id} value={n.description || n.code}>
                    {n.description || n.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Member ID <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                name="member_id"
                value={form.member_id || ''}
                onChange={handleChange}
                placeholder="Member ID"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount % <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                name="discount_percent"
                value={form.discount_percent || '0'}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </>
        )}

        {/* Clinical Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Chief Complaints / Concerns <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            name="concerns"
            value={form.concerns || ''}
            onChange={handleChange}
            placeholder="Reason for visit, symptoms..."
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Vitals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Height (cm) <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="number"
            name="height"
            value={form.height || ''}
            onChange={handleChange}
            placeholder="e.g. 170"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Weight (kg) <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="number"
            name="weight"
            value={form.weight || ''}
            onChange={handleChange}
            placeholder="e.g. 70"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Blood Pressure (mmHg) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              required
              type="number"
              name="bp_systolic"
              value={form.bp_systolic || ''}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({ 
                  ...prev, 
                  bp_systolic: val,
                  blood_pressure: val && form.bp_diastolic ? `${val}/${form.bp_diastolic}` : (val || '')
                }));
              }}
              placeholder="120"
              min="50"
              max="250"
              className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center font-medium"
            />
            <span className="text-2xl font-light text-gray-400">/</span>
            <input
              required
              type="number"
              name="bp_diastolic"
              value={form.bp_diastolic || ''}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({ 
                  ...prev, 
                  bp_diastolic: val,
                  blood_pressure: form.bp_systolic && val ? `${form.bp_systolic}/${val}` : (val || '')
                }));
              }}
              placeholder="80"
              min="30"
              max="150"
              className="w-24 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-center font-medium"
            />
            <span className="text-sm text-gray-500 ml-3">mmHg</span>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Enter Systolic / Diastolic pressure</p>
        </div>


        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Allergies</label>
          <textarea
            name="allergies"
            value={form.allergies || ''}
            onChange={handleChange}
            placeholder="Known allergies..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Chronic Conditions</label>
          <textarea
            name="chronic_conditions"
            value={form.chronic_conditions || ''}
            onChange={handleChange}
            placeholder="Diabetes, Hypertension, etc..."
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="bg-white border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Required Patient Documents</h3>
            <p className="text-sm text-gray-600 mt-1">
              Please upload these important documents to complete the appointment booking
            </p>
          </div>
        </div>

        {/* Document Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.currentDocumentType || ''}
            onChange={(e) => setForm(prev => ({ ...prev, currentDocumentType: e.target.value }))}
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
              disabled={!form.currentDocumentType}
            />
          </div>
        </label>

        {/* Newly Attached Files - NOW SHOWS TYPE */}
        {(form.attachedDocuments?.length || 0) > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Newly Attached Files</p>
            <div className="space-y-3">
              {form.attachedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-teal-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-800">{doc.file_name}</span>
                      <p className="text-xs text-teal-600 capitalize">
                        {doc.document_type.replace(/_/g, ' ')}
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
      </div>

      {/* AI Consent + Action Buttons (unchanged) */}
      <div className="md:col-span-2 p-6 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
        <label className="flex items-start gap-4 cursor-pointer select-none">
          <input
            type="checkbox"
            name="ai_consent"
            required
            checked={form.ai_consent || false}
            onChange={handleChange}
            className="mt-1.5 h-5 w-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500 focus:ring-offset-2"
          />
          <div className="text-sm leading-relaxed text-amber-900">
            <p className="font-semibold text-base mb-2">Consent for AI-Assisted Medical Documentation</p>
            <p>I consent to the use of artificial intelligence tools to assist in drafting and summarizing my medical notes...</p>
            {/* ... rest of consent text unchanged ... */}
          </div>
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!form.ai_consent}
          className={`px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm ${
            form.ai_consent ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <Save size={18} />
          Book Appointment
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;