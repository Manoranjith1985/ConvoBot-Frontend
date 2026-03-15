// src/pages/AdminPatientsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Search, Download, Plus, X, Calendar, User, Phone, 
  FileText, Building, Cake, FileCheck 
} from 'lucide-react';
import PatientDetailModal from '../../components/AdminComponents/PatientDetailsModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const AdminPatientsPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [insuranceFilter, setInsuranceFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_name: '',
    file_number: '',
    eid: '',
    phone: '',
    address: '',
    company_name: '',
    dob: '',
    gender: 'Male',
    billing_type: 'Cash',
    receiver: '',
    payer: '',
    network: '',
    member_id: ''
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        billing_type: insuranceFilter === 'All' ? undefined : insuranceFilter,
        limit: 100
      };
      const res = await apiClient.get('/admin/patients', { params });
      setPatients(res.data.data || []);
    } catch (err) {
      console.error('Patients fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await apiClient.get(`/admin/patients/${id}`);
      setPatientDetail(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetail(selectedPatient._id || selectedPatient.id);
    }
  }, [selectedPatient]);

  const filteredPatients = patients; // already filtered server-side

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.phone) {
      alert('Name and Phone are required');
      return;
    }

    try {
      await apiClient.post('/admin/patients', formData);
      alert('Patient added successfully');
      setShowAddModal(false);
      setFormData({
        patient_name: '', file_number: '', eid: '', phone: '', address: '',
        company_name: '', dob: '', gender: 'Male', billing_type: 'Cash',
        receiver: '', payer: '', network: '', member_id: ''
      });
      fetchPatients();
    } catch (err) {
      alert('Failed to add patient');
      console.error(err);
    }
  };

  const exportToCSV = () => {
    let csv = 'File No,Name,Phone,DOB,Gender,Type,Last Visit\n';
    patients.forEach(p => {
      csv += `"${p.file_number || p.eid || ''}","${p.patient_name || ''}","${p.phone || ''}","${p.dob || ''}","${p.gender || ''}","${p.billing_type || 'Cash'}","${p.lastVisit || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--primary-color)]">Patients Management</h1>
          <p className="text-gray-500 mt-1">Clinic Admin • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
          >
            <Download size={18} /> Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl hover:opacity-90"
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                fetchPatients(); // live search
              }}
              placeholder="Search name, phone, file no, EID..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <select
              value={insuranceFilter}
              onChange={(e) => {
                setInsuranceFilter(e.target.value);
                fetchPatients();
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="All">All Billing Types</option>
              <option value="Insurance">Insurance</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="text-right text-sm text-gray-500 self-end">
            Showing {filteredPatients.length} patients
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Visit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-500">Loading patients...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-gray-500">No patients found</td></tr>
              ) : (
                filteredPatients.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.file_number || p.eid || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.patient_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.dob || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.gender || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        p.billing_type === 'Insurance' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {p.billing_type || 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{p.lastVisit || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="text-[var(--primary-color)] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Add New Patient</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={28} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 space-y-6">
              {/* same form as before – kept minimal */}
              {/* ... form fields ... */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2.5 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-xl">
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail Popup */}
      {selectedPatient && (
        <PatientDetailModal 
            patient={selectedPatient} 
            onClose={() => setSelectedPatient(null)} 
        />
       )} 
    </div>
  );
};

export default AdminPatientsPage;