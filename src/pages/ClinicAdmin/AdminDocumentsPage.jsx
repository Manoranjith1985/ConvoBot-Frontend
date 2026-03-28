// src/pages/ClinicAdmin/AdminDocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('letterhead');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = async () => {
    setFetchLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/documents');
      const data = Array.isArray(res.data) ? res.data : [];
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(err.response?.data?.error || 'Failed to load documents.');
      setDocuments([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);

    try {
      await apiClient.post('/admin/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploaded successfully!');
      setSelectedFile(null);
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
      console.log(`[DEBUG] Attempting to view document ID: ${docId}`);
      const res = await apiClient.get(`/admin/documents/${docId}/view`, { 
        responseType: 'blob' 
      });
      const url = URL.createObjectURL(res.data);
      console.log("[DEBUG] Preview URL created successfully");
      setPreviewUrl(url);
    } catch (err) {
      console.error("[ERROR] View failed:", err);
      const serverMsg = err.response?.data?.error || 'Failed to load preview. Check server logs.';
      alert(serverMsg);
      console.log("[DEBUG] Server message:", serverMsg);
      
      if (serverMsg.includes("missing on server")) {
        setTimeout(fetchDocuments, 1000);
      }
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Clinic Documents Management</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Upload Section - unchanged */}
      <div className="bg-white p-8 rounded-2xl shadow mb-10">
        <h2 className="text-2xl font-semibold mb-6">Upload New Document</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="letterhead">Letterhead</option>
              <option value="doctor_stamp">Doctor Stamp</option>
              <option value="doctor_seal">Doctor Seal</option>
              <option value="sick_leave_template">Sick Leave Template</option>
              <option value="claim_form_template">Claim Form Template</option>
              <option value="referral_letter_template">Referral Letter Template</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File (PDF / Image)</label>
            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="w-full border border-gray-300 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          <button onClick={handleUpload} disabled={!selectedFile || loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-10 py-3.5 rounded-2xl font-medium min-w-[160px]">
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-8 py-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Uploaded Documents</h2>
          <button 
            onClick={fetchDocuments}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ↻ Refresh
          </button>
        </div>

        {fetchLoading ? (
          <div className="px-8 py-12 text-center text-gray-500">Loading documents...</div>
        ) : error ? (
          <div className="px-8 py-12 text-center text-red-600">{error}</div>
        ) : documents.length === 0 ? (
          <div className="px-8 py-12 text-center text-gray-500">
            No documents uploaded yet. Upload one above.
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-8 py-4 text-left font-medium text-gray-600">Type</th>
                <th className="px-8 py-4 text-left font-medium text-gray-600">File Name</th>
                <th className="px-8 py-4 text-left font-medium text-gray-600">Uploaded On</th>
                <th className="px-8 py-4 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-8 py-5 capitalize font-medium">
                    {doc.document_type ? doc.document_type.replace('_', ' ') : 'Unknown'}
                  </td>
                  <td className="px-8 py-5 text-gray-700">{doc.file_name || '—'}</td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {doc.created_at || '—'}
                  </td>
                  <td className="px-8 py-5 text-center space-x-6">
                    <button
                      onClick={() => handleView(doc._id)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-lg">Document Preview</h3>
              <button onClick={closePreview} className="px-5 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium">Close Preview</button>
            </div>
            <iframe src={previewUrl} className="flex-1 w-full border-0" title="Document Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentsPage;