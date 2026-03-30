// src/pages/AdminPatientsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, Search, Download, Plus, X, ChevronUp, ChevronDown, Edit 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatientDetailModal from '../../components/AdminComponents/PatientDetailsModal';
import PatientForm from '../../components/AdminComponents/PatientFormModal';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const AdminPatientsPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const navigate = useNavigate();
  
  const [patients, setPatients] = useState([]);           // Raw data from backend
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'patient_name', direction: 'asc' });
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    file_number: '',
    eid: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    company_name: '',
    billing_type: 'Cash',
    receiver: '',
    payer: '',
    network: '',
    member_id: '',
    discount_percent: '0',
    attached_document_ids: [],
    existingDocuments: [],
  });

  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState(null);

  useEscapeKey(() => {
    if (showFormModal) setShowFormModal(false);
    if (selectedPatientForDetail) setSelectedPatientForDetail(null);
  });

  // Fetch all patients
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/patients', { 
        params: { limit: 500 }
      });
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Patients fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchPatients();
  }, [fetchPatients]);

  // Client-side filtering + sorting
  const processedPatients = useMemo(() => {
    let result = [...patients];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(p => 
        (p.patient_name?.toLowerCase() || '').includes(term) ||
        (p.phone?.toLowerCase() || '').includes(term) ||
        (p.file_number?.toLowerCase() || '').includes(term) ||
        (p.eid?.toLowerCase() || '').includes(term)
      );
    }

    // Insurance filter
    if (insuranceFilter !== 'All') {
      result = result.filter(p => 
        (p.billing_type || 'Cash').toLowerCase() === insuranceFilter.toLowerCase()
      );
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';

        if (sortConfig.key === 'dob') {
          const dateA = valA ? new Date(valA.split('/').reverse().join('-')) : new Date(0);
          const dateB = valB ? new Date(valB.split('/').reverse().join('-')) : new Date(0);
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [patients, searchTerm, insuranceFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ==================== ADD NEW PATIENT ====================
  const openAddModal = () => {
    setFormData({
      patient_name: '',
      file_number: '',
      eid: '',
      phone: '',
      dob: '',
      gender: 'Male',
      address: '',
      company_name: '',
      billing_type: 'Cash',
      receiver: '',
      payer: '',
      network: '',
      member_id: '',
      discount_percent: '0',
      attached_document_ids: [],
      existingDocuments: [],
    });
    setIsEditMode(false);
    setCurrentPatientId(null);
    setShowFormModal(true);
  };

  // ==================== EDIT PATIENT ====================
  const openEditModal = async (patient) => {
    try {
      const res = await apiClient.get(`/admin/patients/${patient._id || patient.id}`);
      const fullData = res.data.data || res.data;

      setFormData({
        ...fullData,
        attached_document_ids: fullData.attached_document_ids || [],
        existingDocuments: fullData.existingDocuments || [],
      });

      setCurrentPatientId(patient._id || patient.id);
      setIsEditMode(true);
      setShowFormModal(true);
    } catch (err) {
      console.error('Failed to load patient for edit:', err);
      alert('Failed to load patient details for editing');
    }
  };

  // ==================== FORM SUBMIT (Add or Update) ====================
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient_name?.trim() || !formData.phone?.trim()) {
      alert('Patient name and phone number are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        attached_document_ids: formData.attached_document_ids || [],
      };

      if (isEditMode && currentPatientId) {
        // UPDATE
        await apiClient.put(`/admin/patients/${currentPatientId}`, payload);
        alert('Patient updated successfully');
      } else {
        // CREATE
        await apiClient.post('/admin/patients', payload);
        alert('Patient created successfully');
      }

      setShowFormModal(false);
      fetchPatients(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save patient');
    }
  };

  const exportToCSV = () => {
    let csv = 'File No,Name,Phone,DOB,Gender,Billing Type,Company\n';
    processedPatients.forEach(p => {
      csv += `"${p.file_number || p.eid || ''}","${p.patient_name || ''}","${p.phone || ''}","${p.dob || ''}","${p.gender || ''}","${p.billing_type || 'Cash'}","${p.company_name || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/admin-dashboard')}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-800 hover:underline mb-6 font-medium transition-colors"
      >
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Patients Management</h1>
          <p className="text-gray-500 mt-1">Clinic Admin Portal • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium"
          >
            <Download size={18} /> Export List
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 font-medium"
          >
            <Plus size={18} /> Add Patient
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, phone, file#, EID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <select
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="All">All Billing Types</option>
              <option value="Insurance">Insurance</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="text-right text-sm text-gray-500 self-end">
            Showing {processedPatients.length} of {patients.length} patients
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th onClick={() => handleSort('file_number')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  File No {sortConfig.key === 'file_number' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                </th>
                <th onClick={() => handleSort('patient_name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  Name {sortConfig.key === 'patient_name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                </th>
                <th onClick={() => handleSort('phone')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  Phone
                </th>
                <th onClick={() => handleSort('dob')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  DOB {sortConfig.key === 'dob' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} className="inline" /> : <ChevronDown size={14} className="inline" />)}
                </th>
                <th onClick={() => handleSort('gender')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  Gender
                </th>
                <th onClick={() => handleSort('billing_type')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100">
                  Billing Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading patients...</td></tr>
              ) : processedPatients.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">No patients found</td></tr>
              ) : (
                processedPatients.map(p => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.file_number || p.eid || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.dob || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.gender || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        p.billing_type === 'Insurance' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.billing_type || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedPatientForDetail(p)}
                        className="text-teal-600 hover:text-teal-700 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                      >
                        <Edit size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Form Modal (Add / Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Patient' : 'Add New Patient'}
              </h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <PatientForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowFormModal(false)}
                isEdit={isEditMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatientForDetail && (
        <PatientDetailModal
          patient={selectedPatientForDetail}
          onClose={() => setSelectedPatientForDetail(null)}
        />
      )}
    </div>
  );
};

export default AdminPatientsPage;