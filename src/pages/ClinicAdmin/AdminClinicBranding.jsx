// src/pages/admin/ClinicBranding.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const api = axios.create({ baseURL: API_BASE_URL });

const ClinicBranding = () => {
  const [form, setForm] = useState({
    clinicLogo: null,
    clinicLogoPreview: '',
    letterhead: null,
    letterheadPreview: '',
    doctorStamp: null,
    doctorStampPreview: '',
    doctorSeal: null,
    doctorSealPreview: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadExistingBranding();
  }, []);

  const loadExistingBranding = async () => {
    try {
      const res = await api.get('/admin/clinic/branding');
      if (res.data?.data) {
        const d = res.data.data;
        setForm(prev => ({
          ...prev,
          clinicLogoPreview: d.clinicLogoUrl || '',
          letterheadPreview: d.letterheadUrl || '',
          doctorStampPreview: d.doctorStampUrl || '',
          doctorSealPreview: d.doctorSealUrl || '',
        }));
      }
    } catch (err) {
      console.warn('No existing branding found or error loading', err);
    }
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm(prev => ({
      ...prev,
      [field]: file,
      [`${field}Preview`]: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const fd = new FormData();

    if (form.clinicLogo) fd.append('clinicLogo', form.clinicLogo);
    if (form.letterhead) fd.append('letterhead', form.letterhead);
    if (form.doctorStamp) fd.append('doctorStamp', form.doctorStamp);
    if (form.doctorSeal) fd.append('doctorSeal', form.doctorSeal);

    try {
      const res = await api.post('/admin/clinic/branding', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.status === 'success') {
        setSuccess(true);
        // Refresh previews
        loadExistingBranding();
      } else {
        throw new Error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branding');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const UploadField = ({ label, field, preview, accept = "image/*" }) => (
    <div className="border border-dashed border-gray-300 rounded-lg p-6 hover:border-teal-400 transition-colors">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {preview ? (
        <div className="mb-4">
          <img
            src={preview}
            alt="preview"
            className="max-h-40 mx-auto object-contain rounded shadow-sm"
          />
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <ImageIcon size={40} className="mx-auto mb-2" />
          <p>No image uploaded yet</p>
        </div>
      )}

      <label className="mt-4 block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e, field)}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-teal-50 file:text-teal-700
            hover:file:bg-teal-100 cursor-pointer"
        />
      </label>
      <p className="mt-1 text-xs text-gray-500">
        PNG, JPG, max 2MB recommended
      </p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinic Branding</h1>
      <p className="text-gray-600 mb-8">
        Customize logo, letterhead, doctor stamp & seal for documents and login page
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          Branding updated successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <UploadField
          label="Clinic Logo (shown on login & documents)"
          field="clinicLogo"
          preview={form.clinicLogoPreview}
        />

        <UploadField
          label="Letterhead Background / Template"
          field="letterhead"
          preview={form.letterheadPreview}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <UploadField
            label="Doctor Stamp (transparent PNG preferred)"
            field="doctorStamp"
            preview={form.doctorStampPreview}
          />

          <UploadField
            label="Doctor Seal / Signature Seal"
            field="doctorSeal"
            preview={form.doctorSealPreview}
          />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Branding
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClinicBranding;