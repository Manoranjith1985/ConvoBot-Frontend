// src/components/admin/PatientForm.jsx
import React from 'react';

const PatientForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
  doctors = [],           // optional – not used here but kept for consistency
  receivers = [],
  payers = [],
  networks = [],
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
          <select
            name="gender"
            value={formData.gender || 'Male'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Address & Company */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            placeholder="Full address"
            rows={2}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
          />
        </div>

        {/* Billing Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Type</label>
          <select
            name="billing_type"
            value={formData.billing_type || 'Cash'}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
          >
            <option value="Cash">Cash</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>

        {formData.billing_type === 'Insurance' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Receiver</label>
              <select
                name="receiver"
                value={formData.receiver || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              >
                <option value="">Select Receiver</option>
                {receivers.map(r => (
                  <option key={r._id || r.id} value={r.name || r.receiver}>
                    {r.name || r.receiver}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payer</label>
              <select
                name="payer"
                value={formData.payer || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              >
                <option value="">Select Payer</option>
                {payers.map(p => (
                  <option key={p._id || p.id} value={p.name || p.payer}>
                    {p.name || p.payer}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Network</label>
              <select
                name="network"
                value={formData.network || ''}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              >
                <option value="">Select Network</option>
                {networks.map(n => (
                  <option key={n._id || n.id} value={n.name || n.network}>
                    {n.name || n.network}
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount %</label>
              <input
                type="number"
                name="discount_percent"
                value={formData.discount_percent || '0'}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
              />
            </div>
          </>
        )}
      </div>

      {/* Form Actions */}
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
          className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 font-medium transition-colors"
        >
          {isEdit ? 'Update Patient' : 'Save Patient'}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;