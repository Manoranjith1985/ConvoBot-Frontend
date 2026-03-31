// src/components/admin/DoctorDetailModal.jsx
import React, { useState } from 'react';
import { X, User, Award, Clock, Calendar, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorDetailModal = ({ 
  isOpen, 
  onClose, 
  doctor, 
  onDoctorUpdated   // Optional callback to refresh list in parent
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEscapeKey(() => {
    if (isOpen) onClose();
  });

  if (!isOpen || !doctor) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  // ==================== EDIT LOGIC ====================
  const handleEdit = () => {
    // We pass the doctor data back to parent so it can open DoctorFormModal in edit mode
    if (onDoctorUpdated) {
      onDoctorUpdated(doctor);   // This will be used as "doctorToEdit" in AdminDoctorsPage
    }
    onClose(); // Close detail modal before opening form
  };

  // ==================== DELETE LOGIC (Copied & Improved from AdminDoctorsPage) ====================
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete doctor "${doctor.name}"?\n\nThis action cannot be undone and will be logged.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const doctorId = doctor._id || doctor.id;
      const res = await apiClient.delete(`/admin/doctors/${doctorId}`);

      if (res.data?.status === 'success' || res.status === 200) {
        alert(`Doctor "${doctor.name}" deleted successfully`);
        onDoctorUpdated?.(null);   // Signal parent to refresh list
        onClose();
      } else {
        alert(res.data?.message || 'Delete failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete doctor. Please try again.';
      alert(msg);
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-8 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              {doctor.avatar ? (
                <img 
                  src={doctor.avatar} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal-100 text-teal-700 text-4xl font-bold">
                  {doctor.name?.[0] || 'D'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">{doctor.name}</h2>
              <p className="text-xl text-[var(--primary-color)] font-medium">{doctor.specialty}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* Compact Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User size={20} className="text-[var(--primary-color)]" /> 
                  Personal Information
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Email</span> <span>{doctor.email || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone</span> <span>{doctor.phone || 'N/A'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Experience</span> 
                    <span>{doctor.experienceYears || doctor.experience || 'N/A'} years</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Professional Bio</span>
                    <p className="text-gray-700 leading-relaxed">{doctor.bio || 'No bio provided.'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-[var(--primary-color)]" /> 
                  Work Configuration
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6 space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div><span className="text-gray-500">Department</span><br />{doctor.currentEmployment?.department || 'N/A'}</div>
                    <div><span className="text-gray-500">Designation</span><br />{doctor.currentEmployment?.designation || 'N/A'}</div>
                    <div><span className="text-gray-500">Join Date</span><br />{formatDate(doctor.currentEmployment?.joinDate)}</div>
                    <div><span className="text-gray-500">Consultation Fee</span><br />₹{doctor.currentEmployment?.consultationFee || 'N/A'}</div>
                    <div><span className="text-gray-500">Slots per Day</span><br />{doctor.currentEmployment?.slotsPerDay || 20}</div>
                    <div><span className="text-gray-500">Shift Timing</span><br />
                      {doctor.currentEmployment?.shiftStart || '--'} – {doctor.currentEmployment?.shiftEnd || '--'}
                    </div>
                  </div>

                  {doctor.currentEmployment?.signaturePreview && (
                    <div className="pt-4 border-t">
                      <span className="text-gray-500 block mb-2">Signature / Stamp</span>
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 inline-block">
                        <img 
                          src={doctor.currentEmployment.signaturePreview} 
                          alt="Signature" 
                          className="max-h-24 object-contain" 
                        />
                      </div>
                    </div>
                  )}
                  {doctor.currentEmployment?.sealPreview && (
                      <div>
                        <span className="text-gray-500 block mb-2">Doctor Seal</span>
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 inline-block">
                          <img 
                            src={doctor.currentEmployment.sealPreview} 
                            alt="Doctor Seal" 
                            className="max-h-24 object-contain" 
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award size={20} className="text-[var(--primary-color)]" /> 
                  Education & Qualifications
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6">
                  {doctor.qualifications?.length > 0 && (
                    <div className="mb-6">
                      <span className="text-gray-500 text-sm">Qualifications</span>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {doctor.qualifications.map((q, i) => (
                          <span key={i} className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-2xl text-sm">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {doctor.educationHistory?.length > 0 && (
                    <div>
                      <span className="text-gray-500 text-sm">Formal Education History</span>
                      <div className="mt-3 space-y-3">
                        {doctor.educationHistory.map((edu, i) => (
                          <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100">
                            <div className="font-medium">{edu.degree}</div>
                            <div className="text-gray-600 text-sm">{edu.institution} • {edu.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!doctor.qualifications?.length && !doctor.educationHistory?.length) && (
                    <p className="text-gray-500 italic">No education details added yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-[var(--primary-color)]" /> 
                  Previous Experience
                </h3>
                <div className="bg-gray-50 rounded-3xl p-6">
                  {doctor.workHistory?.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.workHistory.map((work, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-base">{work.role}</div>
                            <div className="text-gray-600">{work.institution}</div>
                          </div>
                          {work.duration && (
                            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-xl">
                              {work.duration}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No previous work history recorded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t px-8 py-6 bg-white flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-medium transition-colors"
            disabled={!onDoctorUpdated}
          >
            <Edit size={18} /> Edit Profile
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition-colors disabled:opacity-60"
          >
            <Trash2 size={18} /> 
            {isDeleting ? 'Deleting...' : 'Delete Doctor'}
          </button>

          <button
            onClick={onClose}
            className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-50 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailModal;