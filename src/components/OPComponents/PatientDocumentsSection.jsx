// src/components/OPComponents/PatientDocumentsSection.jsx
import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

const PatientDocumentsSection = ({
  patientId,
  initialSelectedIds = [],
  onDocumentsChange,
}) => {
  const fileInputRef = useRef(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState('');

  const documentTypes = [
    { value: 'insurance_front', label: 'Insurance Card (Front)' },
    { value: 'insurance_back', label: 'Insurance Card (Back)' },
    { value: 'photo_id', label: 'Government-issued Photo ID' },
    { value: 'proof_of_address', label: 'Proof of Address' },
    { value: 'consent_form', label: 'Signed Consent / HIPAA Form' },
    { value: 'referral_letter', label: 'Referral / Authorization Letter' },
    { value: 'lab_reports', label: 'Lab Reports / Medical Records' },
    { value: 'other', label: 'Other Document' },
  ];

  const handleUploadClick = () => {
    if (!selectedDocType) {
      alert('Please select a document type first');
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newDocs = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      docType: selectedDocType,
      docTypeLabel: documentTypes.find((t) => t.value === selectedDocType)?.label || 'Other',
    }));

    const updatedDocs = [...uploadedDocs, ...newDocs];
    setUploadedDocs(updatedDocs);

    onDocumentsChange(updatedDocs);
  };

  const removeDoc = (id) => {
    const updated = uploadedDocs.filter((doc) => doc.id !== id);
    setUploadedDocs(updated);
    onDocumentsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Document Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Document Type <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">-- Choose Document Type --</option>
          {documentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      <div>
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={!selectedDocType}
          className={`w-full border-2 border-dashed rounded-2xl p-10 text-center transition-all group ${
            selectedDocType
              ? 'border-gray-300 hover:border-teal-500 cursor-pointer'
              : 'border-gray-200 cursor-not-allowed opacity-60'
          }`}
        >
          <Upload size={48} className="mx-auto text-gray-400 group-hover:text-teal-500 mb-4" />
          <p className="text-gray-700 font-medium">
            {selectedDocType ? `Upload ${documentTypes.find(t => t.value === selectedDocType)?.label}` : 'Select document type first'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PDF, JPG, PNG supported • Multiple files allowed
          </p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedDocs.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Uploaded Documents ({uploadedDocs.length})</p>
          {uploadedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                  <p className="text-xs text-teal-600 font-medium">{doc.docTypeLabel}</p>
                  <p className="text-xs text-gray-500">{doc.size}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDocumentsSection;