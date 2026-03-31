// src/pages/AdminDoctorsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import DoctorDetailModal from '../../components/AdminComponents/DoctorDetailsModal';
import DoctorFormModal from '../../components/AdminComponents/DoctorFormModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const AdminDoctorsPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMode, setFormMode] = useState(null); // 'add' | 'edit'
  const [doctorToEdit, setDoctorToEdit] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // for detail modal

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/doctors');
      setDoctors(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Doctors fetch error:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.specialty || '').toLowerCase().includes(search.toLowerCase()) ||
    String(d.experience || '').includes(search)
  );

  const handleOpenAdd = () => {
    setDoctorToEdit(null);
    setFormMode('add');
  };

  const handleOpenEdit = (doc) => {
    setDoctorToEdit(doc);
    setFormMode('edit');
    setSelectedDoctor(null);
  };

  const handleFormSave = async (doctorData, doctorId) => {
    try {
      if (doctorId) {
        await apiClient.put(`/admin/doctors/${doctorId}`, doctorData);
      } else {
        await apiClient.post('/admin/doctors', {
          ...doctorData,
          added_by_role: role,
          added_at: new Date().toISOString()
        });
      }
      fetchDoctors();
      setFormMode(null);
      setDoctorToEdit(null);
    } catch (err) {
      console.error('Doctor save error:', err);
      alert('Failed to save doctor.');
    }
  };

  const downloadDoctorList = () => {
    // ... (keep your existing CSV logic)
    let csv = 'Name,Specialty,Experience,Email,Phone\n';
    doctors.forEach(d => {
      csv += `"${d.name || ''}","${d.specialty || ''}","${d.experience || ''}","${d.email || ''}","${d.phone || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading doctors...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-2 text-teal-600 hover:underline mb-6">
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary-color)]">Doctors Management</h1>
          <p className="text-gray-500 mt-1">Clinic Admin Portal • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadDoctorList} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl">
            <Download size={18} /> Export List
          </button>
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl hover:opacity-90">
            <Plus size={18} /> Add Doctor
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, specialty, experience..."
          className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        />
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <div
            key={doc._id || doc.id}
            onClick={() => setSelectedDoctor(doc)}
            className="bg-white rounded-3xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-[var(--primary-color)]/30 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                {doc.avatar ? (
                  <img 
                    src={doc.avatar} 
                    alt={doc.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 text-2xl font-bold">
                    {doc.name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl group-hover:text-[var(--primary-color)] truncate">{doc.name}</h3>
                <p className="text-[var(--primary-color)] font-medium truncate">{doc.specialty}</p>
                <div className="text-sm text-gray-600 mt-1">
                  {doc.experience || '?'} years experience
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredDoctors.length === 0 && <p className="col-span-full text-center py-12 text-gray-500">No doctors found</p>}
      </div>

      {/* Modals */}
      <DoctorFormModal
        isOpen={formMode !== null}
        onClose={() => { setFormMode(null); setDoctorToEdit(null); }}
        doctor={doctorToEdit}
        onSave={handleFormSave}
      />

      <DoctorDetailModal
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        doctor={selectedDoctor}
        onDoctorUpdated={(updatedDoctor) => {
          if (updatedDoctor) {
            // Open edit form
            setDoctorToEdit(updatedDoctor);
            setFormMode('edit');
          } else {
            // Delete or other action → refresh list
            fetchDoctors();
          }
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
};

export default AdminDoctorsPage;