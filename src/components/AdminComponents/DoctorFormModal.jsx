// src/components/admin/DoctorFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';

import PersonalTab from './AdminDoctorTabs/PersonalTab';
import EducationTab from './AdminDoctorTabs/EducationTab';
import ExperienceTab from './AdminDoctorTabs/ExperienceTab';
import WorkTab from './AdminDoctorTabs/WorkTab';
import useEscapeKey from '../../hooks/UseEscapeKey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorFormModal = ({ isOpen, onClose, doctor = null, onSave }) => {
  const isEdit = !!doctor;

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'work', label: 'Work Configuration' },
  ];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTabId = tabs[activeTabIndex].id;

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    avatar: '',
    email: '',
    phone: '',
    bio: '',
    experienceYears: '',
    qualifications: [],
    educationHistory: [],
    workHistory: [],
    currentEmployment: {
      department: '',
      designation: '',
      joinDate: '',
      slotsPerDay: 20,
      consultationFee: '',
      shiftStart: '',
      shiftEnd: '',
    },
    experienceDocuments: [],
    educationDocuments: [],
  });

  const [errors, setErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [tempEduDocs, setTempEduDocs] = useState([]);
  const [tempExpDocs, setTempExpDocs] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  useEscapeKey(onClose);

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true);
    try {
      const res = await apiClient.get('/admin/masters/specialities');
      setSpecialties(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load specialties:', err);
      setSpecialties([]);
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const validateCurrentTab = useCallback(() => {
    const newErrors = {};

    if (activeTabId === 'personal') {
      if (!formData.name?.trim()) newErrors.name = 'Full name is required';
      if (!formData.specialty) newErrors.specialty = 'Specialty is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    }

    if (activeTabId === 'education') {
      if (formData.qualifications.length === 0 && formData.educationHistory.length === 0) {
        newErrors.education = 'Please add at least one qualification or education entry';
      }
    }

    if (activeTabId === 'experience') {
      if (!formData.experienceYears?.trim()) {
        newErrors.experienceYears = 'Years of experience is required';
      }
    }

    // Work tab validation can be expanded later
    if (activeTabId === 'work') {
      // Example: if (!formData.currentEmployment.shiftStart) newErrors.shiftStart = 'Shift start is recommended';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [activeTabId, formData]);

  useEffect(() => {
    if (isOpen) {
      fetchSpecialties();

      if (doctor) {
        setFormData({
          name: doctor.name || '',
          specialty: doctor.specialty || '',
          avatar: doctor.avatar || '',
          email: doctor.email || '',
          phone: doctor.phone || '',
          bio: doctor.bio || '',
          experienceYears: doctor.experienceYears || doctor.experience || '',
          qualifications: doctor.qualifications || [],
          educationHistory: doctor.educationHistory || [],
          workHistory: doctor.workHistory || [],
          currentEmployment: {
            department: '',
            designation: '',
            joinDate: '',
            slotsPerDay: 20,
            consultationFee: '',
            shiftStart: '',
            shiftEnd: '',
            ...doctor.currentEmployment,
          },
          experienceDocuments: doctor.experienceDocuments || [],
          educationDocuments: doctor.educationDocuments || [],
        });
        setAvatarPreview(doctor.avatar || null);
      } else {
        setFormData({
          name: '',
          specialty: '',
          avatar: '',
          email: '',
          phone: '',
          bio: '',
          experienceYears: '',
          qualifications: [],
          educationHistory: [],
          workHistory: [],
          currentEmployment: {
            department: '',
            designation: '',
            joinDate: '',
            slotsPerDay: 20,
            consultationFee: '',
            shiftStart: '',
            shiftEnd: '',
          },
          experienceDocuments: [],
          educationDocuments: [],
        });
        setAvatarPreview(null);
        setAvatarFile(null);
        setTempEduDocs([]);
        setTempExpDocs([]);
      }

      setActiveTabIndex(0);
      setErrors({});
    }
  }, [isOpen, doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('currentEmployment.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        currentEmployment: { ...prev.currentEmployment, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const goToNextTab = () => {
    if (validateCurrentTab() && activeTabIndex < tabs.length - 1) {
      setActiveTabIndex((prev) => prev + 1);
      setErrors({});
    }
  };

  const goToPrevTab = () => {
    if (activeTabIndex > 0) {
      setActiveTabIndex((prev) => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTabIndex !== tabs.length - 1 || !validateCurrentTab()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      specialty: formData.specialty,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      bio: formData.bio || '',
      experienceYears: formData.experienceYears,
      experience: formData.experienceYears,
      qualifications: formData.qualifications,
      educationHistory: formData.educationHistory,
      workHistory: formData.workHistory,
      currentEmployment: formData.currentEmployment,
      avatar: avatarPreview,
      // TODO: Properly lift signature, stamp, seal from WorkTab in future
    };

    onSave(payload, isEdit ? (doctor?._id || doctor?.id) : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[820px] max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 py-6 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isEdit ? 'Edit Doctor Profile' : 'Add New Doctor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 px-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabIndex(index)}
              className={`flex-1 min-w-[140px] whitespace-nowrap py-5 font-medium text-sm transition-all border-b-2 px-4
                ${activeTabIndex === index
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)] font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 w-full box-border">
          {activeTabId === 'personal' && (
            <PersonalTab
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              avatarPreview={avatarPreview}
              setAvatarPreview={setAvatarPreview}
              setAvatarFile={setAvatarFile}
              specialties={specialties}
              loadingSpecialties={loadingSpecialties}
            />
          )}

          {activeTabId === 'education' && (
            <EducationTab
              formData={formData}
              setFormData={setFormData}
              tempEduDocs={tempEduDocs}
              setTempEduDocs={setTempEduDocs}
              errors={errors}
            />
          )}

          {activeTabId === 'experience' && (
            <ExperienceTab
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              errors={errors}
              tempExpDocs={tempExpDocs}
              setTempExpDocs={setTempExpDocs}
            />
          )}

          {activeTabId === 'work' && (
            <WorkTab
              formData={formData}
              handleChange={handleChange}
            />
          )}
        </div>

        {/* Navigation Footer - MOVED OUTSIDE <form> to prevent accidental submission */}
        <div className="border-t p-8 bg-white flex justify-between items-center">
          <button
            type="button"
            onClick={goToPrevTab}
            disabled={activeTabIndex === 0}
            className="flex items-center gap-2 px-8 py-3.5 border border-gray-300 rounded-2xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} /> Previous
          </button>

          {activeTabIndex < tabs.length - 1 ? (
            <button
              type="button"
              onClick={goToNextTab}
              className="flex items-center gap-2 px-10 py-3.5 bg-[var(--primary-color)] text-white rounded-2xl hover:opacity-90 font-medium disabled:opacity-50"
            >
              Next <ArrowRight size={20} />
            </button>
          ) : (
            // Submit button ONLY shown on Work tab
            <form onSubmit={handleSubmit}>
              <button
                type="submit"
                className="px-12 py-3.5 bg-[var(--primary-color)] text-white rounded-2xl hover:opacity-90 font-semibold text-lg"
              >
                {isEdit ? 'Update Doctor' : 'Create Doctor'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorFormModal;