// src/components/admin/tabs/WorkTab.jsx
import React, { useState } from 'react';

const WorkTab = ({ formData, handleChange }) => {
  const [signaturePreview, setSignaturePreview] = useState(
    formData.currentEmployment?.signaturePreview || null
  );

  // Handle signature file upload + preview
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG or JPG recommended for signature)');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Update local preview
    setSignaturePreview(previewUrl);

    // Update formData using the existing handleChange pattern
    // We store both the File object and preview URL
    const fakeEventForFile = {
      target: {
        name: 'currentEmployment.signature',
        value: file,                    // File object for backend upload
      }
    };

    const fakeEventForPreview = {
      target: {
        name: 'currentEmployment.signaturePreview',
        value: previewUrl,
      }
    };

    handleChange(fakeEventForFile);
    handleChange(fakeEventForPreview);
  };

  const removeSignature = () => {
    if (signaturePreview) {
      URL.revokeObjectURL(signaturePreview);
    }
    setSignaturePreview(null);

    const fakeEventFile = {
      target: { name: 'currentEmployment.signature', value: null }
    };
    const fakeEventPreview = {
      target: { name: 'currentEmployment.signaturePreview', value: null }
    };

    handleChange(fakeEventFile);
    handleChange(fakeEventPreview);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Department
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Designation
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Join Date
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Consultation Fee (₹)
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slots per Day
          </label>
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Working Hours
        </label>
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

      {/* ==================== NEW: Doctor Signature Upload ==================== */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Doctor Signature / Stamp
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
            <p className="text-sm text-gray-500 mt-1">PNG or JPG recommended • Max 5MB</p>
          </label>

          {/* Preview Area */}
          {signaturePreview && (
            <div className="mt-6 flex flex-col items-center">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                <img
                  src={signaturePreview}
                  alt="Signature Preview"
                  className="max-h-32 object-contain"
                />
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

        <p className="text-xs text-gray-500 mt-2">
          This signature will appear on generated documents (referral letters, sick leave, etc.)
        </p>
      </div>
    </div>
  );
};

export default WorkTab;