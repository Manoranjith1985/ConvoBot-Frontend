// src/components/admin/DoctorFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';

const DoctorFormModal = ({ isOpen, onClose, doctor = null, onSave }) => {
  const isEdit = !!doctor;

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    avatar: '',
    experience: '',
    email: '',
    phone: '',
    bio: '',
    qualifications: [],
    shiftStart: '',
    shiftEnd: '',
  });

  const [newQual, setNewQual] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isOpen && doctor) {
      setFormData({
        name: doctor.name || '',
        specialty: doctor.specialty || '',
        avatar: doctor.avatar || '',
        experience: doctor.experience || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        bio: doctor.bio || '',
        qualifications: doctor.qualifications || [],
        shiftStart: doctor.shift?.split(' - ')[0] || '',
        shiftEnd: doctor.shift?.split(' - ')[1] || '',
      });
      setAvatarPreview(doctor.avatar || null);
    } else if (isOpen) {
      // reset for add new
      setFormData({
        name: '', specialty: '', avatar: '', experience: '', email: '', phone: '',
        bio: '', qualifications: [], shiftStart: '', shiftEnd: '',
      });
      setAvatarPreview(null);
      setFile(null);
    }
  }, [isOpen, doctor]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period?.toUpperCase() === 'PM' && hours !== 12) {
      hours += 12;
    }
    if (period?.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const addQualification = () => {
    if (newQual.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQual.trim()],
      }));
      setNewQual('');
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      shift: `${formData.shiftStart} - ${formData.shiftEnd}`,
      qualifications: formData.qualifications,
    };

    // avatar handling note: in real app → upload file separately and get URL
    // for now we send preview/base64 or existing URL
    if (file) {
      payload.avatar = avatarPreview; // base64 – not ideal for prod
      // Better: upload to backend → get URL back
    }

    onSave(payload, isEdit ? doctor.id : null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Upload size={32} />
                </div>
              )}
            </div>
            <label className="mt-3 cursor-pointer text-[var(--primary-color)] hover:underline">
              {file || avatarPreview ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">or paste URL below</p>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://..."
              className="mt-2 w-full max-w-xs px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[var(--primary-color)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialty *</label>
              <input
                required
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="e.g. Pediatrics, Cardiology"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 12 Years"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                required
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 ..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Short summary about the doctor..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours *</label>
              <div className="flex gap-4 items-center">
                <input
                  required
                  type="time"
                  name="shiftStart"
                  value={convertTo24Hour(formData.shiftStart)}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg"
                />
                <span>to</span>
                <input
                  required
                  type="time"
                  name="shiftEnd"
                  value={convertTo24Hour(formData.shiftEnd)}
                  onChange={handleChange}
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newQual}
                  onChange={(e) => setNewQual(e.target.value)}
                  placeholder="e.g. MBBS - AIIMS"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={addQualification}
                  className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg flex items-center gap-1"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.qualifications.map((qual, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {qual}
                    <button
                      type="button"
                      onClick={() => removeQualification(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[var(--primary-color)] text-white rounded-lg hover:opacity-90"
            >
              {isEdit ? 'Save Changes' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorFormModal;