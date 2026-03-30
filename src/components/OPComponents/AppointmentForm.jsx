// src/components/OPComponents/AppointmentForm.jsx
import React from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import PatientDocumentsSection from './PatientDocumentsSection';

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

      {/* Required Patient Documents */}
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

        <PatientDocumentsSection
          patientId={form.patient_id}
          initialSelectedIds={form.attached_document_ids || []}
          onDocumentsChange={(ids) =>
            setForm((prev) => ({ ...prev, attached_document_ids: ids }))
          }
          requiredDocuments={[
            { label: "Insurance Card (Front)", key: "insurance_front" },
            { label: "Insurance Card (Back)", key: "insurance_back" },
            { label: "Government-issued Photo ID", key: "photo_id" },
            { label: "Proof of Address", key: "proof_of_address" },
            { label: "Signed Consent / HIPAA Form", key: "consent_form" },
            { label: "Referral / Authorization Letter (if applicable)", key: "referral_letter" },
          ]}
        />
      </div>

      {/* AI Consent */}
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
            <p className="font-semibold text-base mb-2">
              Consent for AI-Assisted Medical Documentation
            </p>
            <p>
              I consent to the use of artificial intelligence tools to assist in drafting and summarizing my medical notes and documentation during this visit.
            </p>
            <p className="mt-3">
              <strong>I understand that:</strong>
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>All AI-generated content will be reviewed, edited, and finalized by a qualified healthcare professional.</li>
              <li>This is an assistive tool only — final clinical decisions and documentation remain the responsibility of my doctor.</li>
              <li>I can withdraw this consent at any time by informing clinic staff.</li>
            </ul>
            <p className="mt-4 text-xs text-amber-800 font-medium">
              Checking this box is required to complete your appointment booking.
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
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
            form.ai_consent
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
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