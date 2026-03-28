// src/pages/AdminMastersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  Database, Plus, X, Edit, Trash2, Upload, Download, AlertCircle, Search,
  Stethoscope, UserCog, Activity, FileText, DollarSign, Building, Network,
  Award   // ← NEW: Icon for Specialties
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Master types with metadata
const MASTER_TYPES = [
  { key: 'providers', label: 'Providers', icon: Stethoscope, description: 'Doctors & medical staff' },
  { key: 'clinicians', label: 'Clinicians', icon: UserCog, description: 'Specialist clinicians' },
  { key: 'specialities', label: 'Specialities', icon: Award, description: 'Doctor & medical specialties (Cardiology, Dermatology, etc.)' },
  { key: 'cpt', label: 'CPT Services', icon: Activity, description: 'Procedure codes & pricing' },
  { key: 'icd', label: 'ICD Codes', icon: FileText, description: 'Diagnosis codes' },
  { key: 'pricelist', label: 'Pricelists', icon: DollarSign, description: 'Service pricing tiers' },
  { key: 'receiver', label: 'Receivers', icon: Building, description: 'Insurance receivers' },
  { key: 'payer', label: 'Payers', icon: Building, description: 'Insurance payers' },
  { key: 'network', label: 'Networks', icon: Network, description: 'Insurance networks' }
];

const AdminMastersPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const [selectedType, setSelectedType] = useState('providers'); // default
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchItems(selectedType);
  }, [selectedType]);

  const fetchItems = async (masterType) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/admin/masters/${masterType}`);
      setItems(res.data.data || []);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add or edit
  const openModal = (item = null) => {
    setEditItem(item);
    setFormData(item ? { ...item } : {});
    setShowModal(true);
  };

  // Save (add or update)
  const handleSave = async () => {
    if (!formData.code?.trim()) {
      alert('Code is required');
      return;
    }

    try {
      const endpoint = `/admin/masters/${selectedType}`;
      if (editItem) {
        await apiClient.put(`${endpoint}/${editItem._id}`, formData);
      } else {
        await apiClient.post(endpoint, formData);
      }
      setShowModal(false);
      fetchItems(selectedType);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save');
    }
  };

  // Delete with confirmation
  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await apiClient.delete(`/admin/masters/${selectedType}/${deleteConfirm}`);
      setDeleteConfirm(null);
      fetchItems(selectedType);
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // Import CSV
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let count = 0;
          for (const row of results.data) {
            if (row.code?.trim()) {
              await apiClient.post(`/admin/masters/${selectedType}`, row);
              count++;
            }
          }
          alert(`Imported ${count} items`);
          fetchItems(selectedType);
        } catch (err) {
          alert('Import failed');
        }
      }
    });
  };

  // Export XLSX
  const handleExport = () => {
    if (items.length === 0) return alert('No data');
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedType.toUpperCase());
    XLSX.writeFile(wb, `${selectedType}_export.xlsx`);
  };

  // Dynamic form fields
  const getFormFields = () => {
    const base = [
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea', required: true }
    ];

    const t = selectedType?.toLowerCase() || '';
    if (t === 'cpt') return [...base, { key: 'price', label: 'Price (₹)', type: 'number' }];
    if (t === 'icd') return [...base, { key: 'category', label: 'Category', type: 'text' }];
    if (t === 'pricelist') return [...base, { key: 'amount', label: 'Amount', type: 'number' }];
    if (t === 'specialities') {
      return [
        { key: 'code', label: 'Specialty Code', type: 'text', required: true },
        { key: 'description', label: 'Specialty Name', type: 'text', required: true },
        { key: 'category', label: 'Category (e.g. Surgical, Medical)', type: 'text' },
      ];
    }
    return base;
  };

  const filteredItems = items.filter(item =>
    (item.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Masters Management</h1>
          <p className="text-gray-500 mt-1">Clinic Admin • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer text-gray-700 font-medium">
            <Upload size={18} /> Import CSV
            <input type="file" accept=".csv" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleExport}
            disabled={loading || items.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium disabled:opacity-50"
          >
            <Download size={18} /> Export XLSX
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 font-medium"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>
      </div>

      {/* Type Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Master Category</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSearchTerm('');
          }}
          className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        >
          {MASTER_TYPES.map(m => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search code or description..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 animate-pulse">Loading {selectedType} items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No {selectedType} items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  {selectedType === 'cpt' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  )}
                  {selectedType === 'icd' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  )}
                  {selectedType === 'specialities' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  )}
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.code || '-'}</td>
                    <td className="px-6 py-4 text-sm">{item.description || '-'}</td>
                    {selectedType === 'cpt' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">₹{item.price || '0.00'}</td>
                    )}
                    {selectedType === 'icd' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category || '-'}</td>
                    )}
                    {selectedType === 'specialities' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category || '-'}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(item)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editItem ? 'Edit' : 'Add New'} {selectedType.toUpperCase()} Item
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={28} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <div className="space-y-6">
              {getFormFields().map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] min-h-[80px] resize-y"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl hover:opacity-90 font-medium"
                >
                  {editItem ? 'Update Item' : 'Save Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {selectedType} item?  
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMastersPage;