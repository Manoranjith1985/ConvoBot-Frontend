// src/components/admin/tabs/ExperienceTab.jsx
import React, { useState } from 'react';
import { Upload, Plus, Trash2, FileText } from 'lucide-react';

const ExperienceTab = ({ 
  formData, 
  setFormData, 
  handleChange, 
  errors,
  tempExpDocs, 
  setTempExpDocs 
}) => {

  const [newWork, setNewWork] = useState({ role: '', institution: '', duration: '' });

  const addWorkEntry = () => {
    if (newWork.role.trim() && newWork.institution.trim()) {
      setFormData(prev => ({
        ...prev,
        workHistory: [...prev.workHistory, { ...newWork }]
      }));
      setNewWork({ role: '', institution: '', duration: '' });
    }
  };

  const removeWorkEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      workHistory: prev.workHistory.filter((_, i) => i !== index)
    }));
  };

  const handleExpDocUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file
    }));
    setTempExpDocs(prev => [...prev, ...newDocs]);
  };

  const removeTempExpDoc = (index) => setTempExpDocs(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="max-w-[720px] mx-auto px-4 sm:px-6 space-y-10">
      {/* Total Years of Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Total Years of Experience <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="experienceYears"
          value={formData.experienceYears}
          onChange={handleChange}
          placeholder="e.g. 15"
          className={`w-full px-5 py-3.5 border rounded-2xl focus:outline-none ${
            errors.experienceYears ? 'border-red-500' : 'border-gray-300 focus:border-[var(--primary-color)]'
          }`}
        />
        {errors.experienceYears && <p className="text-red-500 text-sm mt-1">{errors.experienceYears}</p>}
      </div>

      {/* Previous Work History */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Previous Work History</label>
        {/* Previous Work History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 mb-6">
          {/* Update to col-span-4 👇 */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Role / Position *"
              value={newWork.role}
              onChange={(e) => setNewWork({ ...newWork, role: e.target.value })}
              className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          {/* Update to col-span-4 👇 */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Institution / Hospital *"
              value={newWork.institution}
              onChange={(e) => setNewWork({ ...newWork, institution: e.target.value })}
              className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          {/* Update to col-span-4 👇 */}
          <div className="md:col-span-4 flex gap-3">
            <input
              type="text"
              placeholder="Duration"
              value={newWork.duration}
              onChange={(e) => setNewWork({ ...newWork, duration: e.target.value })}
              className="flex-1 min-w-0 px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
            <button
              type="button"
              onClick={addWorkEntry}
              className="px-6 bg-[var(--primary-color)] text-white rounded-2xl font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1"
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {formData.workHistory.map((entry, i) => (
            <div key={i} className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded-2xl">
              <div className="text-gray-800 min-w-0 flex-1 pr-4 truncate">
                <strong>{entry.role}</strong> at {entry.institution}
                {entry.duration && <span className="text-gray-500"> ({entry.duration})</span>}
              </div>
              <button 
                type="button" 
                onClick={() => removeWorkEntry(i)} 
                className="text-red-500 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Documents */}
      <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">Experience Supporting Documents</label>
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] rounded-3xl p-10 sm:p-12 text-center cursor-pointer transition-all">
            <Upload size={48} className="text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium text-sm sm:text-base">
            Upload experience letters, testimonials, etc.
          </p>
          <input type="file" multiple accept=".pdf,.jpg,.png" className="hidden" onChange={handleExpDocUpload} />
        </label>

        {tempExpDocs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tempExpDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl">
                <FileText size={28} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 truncate text-sm font-medium min-w-0">{doc.name}</div>
                <button 
                  type="button" 
                  onClick={() => removeTempExpDoc(i)} 
                  className="text-red-500 hover:text-red-600 flex-shrink-0"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceTab;