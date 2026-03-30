// src/pages/AdminDoctorsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Stethoscope, Clock, Users, Award, Download, Plus, X, Trash2, 
  Edit, Calendar, AlertTriangle, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DoctorFormModal from '../../components/AdminComponents/DoctorFormModal';
import ReferPatientModal from '../../components/AdminComponents/ReferPatientModal';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const AdminDoctorsPage = ({ role = 'Clinic Admin', primaryColor = '#0d9488' }) => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formMode, setFormMode] = useState(null); // 'add' | 'edit' | null
  const [doctorToEdit, setDoctorToEdit] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showReferModal, setShowReferModal] = useState(false);

  useEscapeKey(() => setSelectedDoctor(null));

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

  const handleViewDoctor = async (doc) => {
    try {
      const res = await apiClient.get(`/admin/doctors/${doc._id || doc.id}`);
      setSelectedDoctor(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      setSelectedDoctor(doc); // fallback
    }
  };

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
      alert('Failed to save doctor. Check console for details.');
    }
  };

  const downloadDoctorList = () => {
    let csv = 'Name,Specialty,Experience,Avg Time/Patient,Total Patients,Email,Phone\n';
    doctors.forEach(d => {
      csv += `"${d.name || ''}","${d.specialty || ''}","${d.experience || ''}",${d.average_time_per_patient || ''},${d.totalPatients || ''},"${d.email || ''}","${d.phone || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'doctors_list.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = async () => {
    if (!selectedDoctor) return;
    try {
      const res = await apiClient.get(`/admin/doctors/${selectedDoctor._id || selectedDoctor.id}/report`);
      const report = res.data.data || [];

      let csv = "Date,Patient,Time Taken (min),Visit Type\n";
      report.forEach(r => {
        csv += `${r.date || ''},${r.patient || ''},${r.time_taken_minutes || 15},${r.visit_type || ''}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(selectedDoctor.name || 'doctor').replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Report download failed');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/admin/doctors/${id}`);
      setDeleteConfirmId(null);
      setSelectedDoctor(null);
      fetchDoctors();
    } catch (err) {
      alert('Delete failed');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading doctors...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;

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
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--primary-color)]">
            Doctors Management
          </h1>
          <p className="text-gray-500 mt-1">Clinic Admin Portal • {new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadDoctorList}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700"
          >
            <Download size={18} /> Export List
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[var(--primary-color)] text-white px-6 py-2.5 rounded-xl hover:opacity-90 font-medium"
          >
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

      {/* Doctors Grid - Fixed Avatar Rendering */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            onClick={() => handleViewDoctor(doc)}
            className="bg-white rounded-3xl shadow-md p-6 cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-[var(--primary-color)]/30 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                {doc.avatar ? (
                  <img 
                    src={doc.avatar} 
                    alt={doc.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Dr'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 text-2xl font-bold">
                    {doc.name?.[0] || '?'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xl group-hover:text-[var(--primary-color)] transition-colors truncate">
                  {doc.name}
                </h3>
                <p className="text-[var(--primary-color)] font-medium truncate">{doc.specialty}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{doc.experience || '?'} yrs</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {doc.average_time_per_patient || '?'} min
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredDoctors.length === 0 && !loading && (
          <p className="col-span-full text-center py-12 text-gray-500">No doctors found</p>
        )}
      </div>

      {/* Doctor Form Modal */}
      <DoctorFormModal
        isOpen={formMode !== null}
        onClose={() => {
          setFormMode(null);
          setDoctorToEdit(null);
        }}
        doctor={doctorToEdit}
        onSave={handleFormSave}
      />

      {/* Doctor Detail Modal */}
      {selectedDoctor && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white z-10 p-6 border-b flex justify-between items-center rounded-t-3xl">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {selectedDoctor.name}
                </h2>
                <p className="text-lg text-[var(--primary-color)] mt-1">
                  {selectedDoctor.specialty || 'General Physician'}
                </p>
              </div>
              <button onClick={() => setSelectedDoctor(null)} className="text-gray-500 hover:text-gray-800">
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Avatar & Quick Stats */}
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {selectedDoctor.avatar ? (
                    <img
                      src={selectedDoctor.avatar}
                      alt={selectedDoctor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Dr'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--primary-color)] text-6xl font-bold">
                      {selectedDoctor.name?.[0] || '?'}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Experience</div>
                      <div className="font-medium">{selectedDoctor.experience || '?'} years</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Avg Time / Patient</div>
                      <div className="font-medium">{selectedDoctor.average_time_per_patient || '?'} min</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Patients</div>
                      <div className="font-medium">{selectedDoctor.totalPatients || 0}</div>
                    </div>
                  </div>

                  {selectedDoctor.email && <p className="text-gray-700">{selectedDoctor.email}</p>}
                  {selectedDoctor.phone && <p className="text-gray-700">{selectedDoctor.phone}</p>}
                </div>
              </div>

              {/* Qualifications */}
              {selectedDoctor.qualifications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Qualifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.qualifications.map((q, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Schedule */}
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Today's Schedule
                </h3>
                {selectedDoctor.today_appointments?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDoctor.today_appointments.map((a, i) => (
                      <div key={i} className="bg-gray-50 p-4 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                          <div className="font-medium">{a.time}</div>
                          <div className="text-sm text-gray-600">{a.patient_name}</div>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                          {a.visit_type || 'Consultation'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic bg-gray-50 p-4 rounded-xl">
                    No appointments scheduled today
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => setShowReferModal(true)}
                  className="py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Users size={18} /> Refer Patient
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedDoctor)}
                  className="py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2"
                >
                  <Edit size={18} /> Edit Profile
                </button>
                <button
                  onClick={() => setDeleteConfirmId(selectedDoctor._id || selectedDoctor.id)}
                  className="py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-700 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Deleting this doctor cannot be undone and will be logged.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refer Patient Modal */}
      {selectedDoctor && showReferModal && (
        <ReferPatientModal
          isOpen={showReferModal}
          onClose={() => setShowReferModal(false)}
          targetDoctor={selectedDoctor}
          onReferralCreated={() => fetchDoctors()}
        />
      )}
    </div>
  );
};

export default AdminDoctorsPage;