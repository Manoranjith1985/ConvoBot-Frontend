// src/components/admin/tabs/WorkTab.jsx
import React, { useState } from 'react';

const WorkTab = ({ formData, handleChange }) => {
  const [signaturePreview, setSignaturePreview] = useState(
    formData.currentEmployment?.signaturePreview || null
  );
  const [sealPreview, setSealPreview] = useState(
    formData.currentEmployment?.sealPreview || null
  );

  // Handle Signature Upload
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file for signature');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSignaturePreview(previewUrl);

    handleChange({
      target: { name: 'currentEmployment.signature', value: file }
    });
    handleChange({
      target: { name: 'currentEmployment.signaturePreview', value: previewUrl }
    });
  };

  // Handle Doctor Seal Upload
  const handleSealUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file for doctor seal');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSealPreview(previewUrl);

    handleChange({
      target: { name: 'currentEmployment.seal', value: file }
    });
    handleChange({
      target: { name: 'currentEmployment.sealPreview', value: previewUrl }
    });
  };

  const removeSignature = () => {
    if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    setSignaturePreview(null);
    handleChange({ target: { name: 'currentEmployment.signature', value: null } });
    handleChange({ target: { name: 'currentEmployment.signaturePreview', value: null } });
  };

  const removeSeal = () => {
    if (sealPreview) URL.revokeObjectURL(sealPreview);
    setSealPreview(null);
    handleChange({ target: { name: 'currentEmployment.seal', value: null } });
    handleChange({ target: { name: 'currentEmployment.sealPreview', value: null } });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
          <input
            type="text"
            name="currentEmployment.department"
            value={formData.currentEmployment.department || ''}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            placeholder="e.g. Cardiology"
          />
        </div>

        {/* Designation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Designation</label>
          <input
            type="text"
            name="currentEmployment.designation"
            value={formData.currentEmployment.designation || ''}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            placeholder="e.g. Senior Consultant"
          />
        </div>

        {/* Join Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Join Date</label>
          <input
            type="date"
            name="currentEmployment.joinDate"
            value={formData.currentEmployment.joinDate || ''}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
          />
        </div>

        {/* Consultation Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fee (₹)</label>
          <input
            type="number"
            name="currentEmployment.consultationFee"
            value={formData.currentEmployment.consultationFee || ''}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            placeholder="1500"
          />
        </div>

        {/* Slots per Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Slots per Day</label>
          <input
            type="number"
            name="currentEmployment.slotsPerDay"
            value={formData.currentEmployment.slotsPerDay || ''}
            onChange={handleChange}
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            min="1"
          />
        </div>
      </div>

      {/* Working Hours */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Working Hours</label>
        <div className="flex gap-6 items-center">
          <input
            type="time"
            name="currentEmployment.shiftStart"
            value={formData.currentEmployment.shiftStart || ''}
            onChange={handleChange}
            className="px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
          />
          <span className="text-gray-400 font-medium">to</span>
          <input
            type="time"
            name="currentEmployment.shiftEnd"
            value={formData.currentEmployment.shiftEnd || ''}
            onChange={handleChange}
            className="px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
          />
        </div>
      </div>

      {/* Signature & Seal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Doctor Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Doctor Signature
          </label>
          <div className="border border-gray-300 rounded-2xl p-6 bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              className="hidden"
              id="signature-upload"
            />
            <label
              htmlFor="signature-upload"
              className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] rounded-xl py-8 transition-colors"
            >
              <div className="text-4xl mb-3">✍️</div>
              <p className="font-medium text-gray-700">Click to upload signature</p>
              <p className="text-sm text-gray-500 mt-1">PNG or JPG • Max 5MB</p>
            </label>

            {signaturePreview && (
              <div className="mt-6 flex flex-col items-center">
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <img src={signaturePreview} alt="Signature Preview" className="max-h-32 object-contain" />
                </div>
                <button
                  type="button"
                  onClick={removeSignature}
                  className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  ✕ Remove Signature
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Doctor Seal - NEW */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Doctor Seal
          </label>
          <div className="border border-gray-300 rounded-2xl p-6 bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleSealUpload}
              className="hidden"
              id="seal-upload"
            />
            <label
              htmlFor="seal-upload"
              className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] rounded-xl py-8 transition-colors"
            >
              <div className="text-4xl mb-3">🔖</div>
              <p className="font-medium text-gray-700">Click to upload doctor seal</p>
              <p className="text-sm text-gray-500 mt-1">PNG or JPG • Max 5MB</p>
            </label>

            {sealPreview && (
              <div className="mt-6 flex flex-col items-center">
                <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <img src={sealPreview} alt="Seal Preview" className="max-h-32 object-contain" />
                </div>
                <button
                  type="button"
                  onClick={removeSeal}
                  className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  ✕ Remove Seal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Signature and Seal will appear on generated documents (referral letters, sick leave, medical reports, etc.)
      </p>
    </div>
  );
};

export default WorkTab;