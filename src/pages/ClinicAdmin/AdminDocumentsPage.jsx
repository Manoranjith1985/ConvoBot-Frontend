// src/pages/ClinicAdmin/AdminDocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DOCUMENT_TYPES = [
  { key: 'letterhead', label: 'Clinic Letterhead', accept: 'image/jpeg,image/png,application/pdf' },
  { key: 'doctor_stamp', label: 'Doctor Stamp', accept: 'image/jpeg,image/png,application/pdf' },
  { key: 'doctor_seal', label: 'Doctor Seal', accept: 'image/jpeg,image/png,application/pdf' },
  { key: 'sick_leave_template', label: 'Sick Leave Template', accept: 'application/pdf' },
  { key: 'claim_form_template', label: 'Claim Form Template', accept: 'application/pdf' },
  { key: 'referral_letter_template', label: 'Referral Letter Template', accept: 'application/pdf' },
  { key: 'other', label: 'Other Documents', accept: 'application/pdf,image/jpeg,image/png' },
];

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]); 
  const [slotDocuments, setSlotDocuments] = useState({}); 
  const [selectedFiles, setSelectedFiles] = useState({}); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);   // Collapsible history

  const fetchDocuments = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/documents');
      const data = Array.isArray(res.data) ? res.data : [];
      setDocuments(data);

      const grouped = {};
      data.forEach((doc) => {
        if (!grouped[doc.document_type] || new Date(doc.created_at) > new Date(grouped[doc.document_type].created_at)) {
          grouped[doc.document_type] = doc;
        }
      });
      setSlotDocuments(grouped);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err.response?.data?.error || 'Failed to load documents.');
      setDocuments([]);
      setSlotDocuments({});
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = (type, file) => {
    setSelectedFiles((prev) => ({ ...prev, [type]: file }));
  };

  const handleUpload = async (type) => {
    const file = selectedFiles[type];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', type);

    try {
      await apiClient.post('/admin/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`${DOCUMENT_TYPES.find(t => t.key === type).label} uploaded successfully!`);
      setSelectedFiles((prev) => ({ ...prev, [type]: null }));
      fetchDocuments();
    } catch (err) {
      const serverMsg = err.response?.data?.error || 'Upload failed.';
      setError(serverMsg);
      alert(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (docId) => {
    try {
      const res = await apiClient.get(`/admin/documents/${docId}/view`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setPreviewUrl(url);
    } catch (err) {
      console.error("[ERROR] View failed:", err);
      const serverMsg = err.response?.data?.error || 'Failed to load preview.';
      alert(serverMsg);
      if (serverMsg.includes("missing")) fetchDocuments();
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await apiClient.delete(`/admin/documents/${docId}`);
      alert('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clinic Documents</h1>
        <button
          onClick={fetchDocuments}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {/* Compact Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {DOCUMENT_TYPES.map(({ key, label, accept }) => {
          const currentDoc = slotDocuments[key];
          const selectedFile = selectedFiles[key];

          return (
            <div 
              key={key} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-base text-gray-800 mb-4 truncate">{label}</h3>

              {/* Preview Area - Smaller */}
              <div className="mb-5 h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 overflow-hidden text-center">
                {currentDoc ? (
                  <div className="text-xs w-full px-2">
                    <p className="text-gray-500 mb-1">Uploaded</p>
                    <p className="font-medium text-gray-700 truncate">{currentDoc.file_name}</p>
                    <div className="flex justify-center gap-4 mt-3">
                      <button
                        onClick={() => handleView(currentDoc._id)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(currentDoc._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">
                    <div className="text-2xl mb-1">📄</div>
                    No file
                  </div>
                )}
              </div>

              {/* Upload Section - Compact */}
              <div className="space-y-3">
                <input
                  type="file"
                  accept={accept}
                  onChange={(e) => handleFileSelect(key, e.target.files?.[0] || null)}
                  className="w-full text-xs border border-gray-300 rounded-xl px-3 py-2 file:mr-3 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                <button
                  onClick={() => handleUpload(key)}
                  disabled={!selectedFile || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  {loading ? 'Uploading...' : `Upload`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact History Section - Collapsible */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div 
          className="px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h2 className="text-lg font-semibold text-gray-800">All Documents History</h2>
          <span className="text-sm text-gray-500">
            {showHistory ? 'Hide' : 'Show'} • {documents.length} files
          </span>
        </div>

        {showHistory && (
          fetchLoading ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">Loading history...</div>
          ) : documents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">No documents uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Type</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">File Name</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">Uploaded On</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-600 w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 capitalize font-medium text-gray-700">
                        {doc.document_type?.replace('_', ' ') || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{doc.file_name}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{doc.created_at}</td>
                      <td className="px-6 py-4 text-center space-x-4">
                        <button 
                          onClick={() => handleView(doc._id)} 
                          className="text-blue-600 hover:text-blue-700"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(doc._id)} 
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Preview Modal - Unchanged but slightly tighter */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg">Document Preview</h3>
              <button 
                onClick={closePreview} 
                className="px-6 py-2 text-red-600 hover:bg-red-50 rounded-2xl font-medium text-sm"
              >
                Close Preview
              </button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full border-0" title="Document Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentsPage;