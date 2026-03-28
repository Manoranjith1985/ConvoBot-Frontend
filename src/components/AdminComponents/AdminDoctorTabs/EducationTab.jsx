// src/components/admin/tabs/EducationTab.jsx
import React, { useState } from 'react';
import { Upload, Plus, Trash2, FileText } from 'lucide-react';

const EducationTab = ({ 
  formData, 
  setFormData, 
  tempEduDocs, 
  setTempEduDocs, 
  errors 
}) => {

  const [newQual, setNewQual] = useState('');
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });

  const addQualification = () => {
    if (newQual.trim()) {
      setFormData(prev => ({ ...prev, qualifications: [...prev.qualifications, newQual.trim()] }));
      setNewQual('');
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({ ...prev, qualifications: prev.qualifications.filter((_, i) => i !== index) }));
  };

  const addEducationEntry = () => {
    if (newEducation.degree.trim() && newEducation.institution.trim()) {
      setFormData(prev => ({
        ...prev,
        educationHistory: [...prev.educationHistory, { ...newEducation }]
      }));
      setNewEducation({ degree: '', institution: '', year: '' });
    }
  };

  const removeEducationEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      educationHistory: prev.educationHistory.filter((_, i) => i !== index)
    }));
  };

  const handleEduDocUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      file
    }));
    setTempEduDocs(prev => [...prev, ...newDocs]);
  };

  const removeTempEduDoc = (index) => setTempEduDocs(prev => prev.filter((_, i) => i !== index));

  return (
    <div className="max-w-[720px] mx-auto space-y-10 px-4 sm:px-6">
      {/* Qualifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Qualifications / Degrees</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newQual}
            onChange={(e) => setNewQual(e.target.value)}
            placeholder="e.g. MBBS - AIIMS"
            className="flex-1 px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)] min-w-0"
          />
          <button
            type="button"
            onClick={addQualification}
            className="px-9 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white rounded-2xl flex items-center gap-2 font-medium whitespace-nowrap self-stretch sm:self-auto"
          >
            <Plus size={20} /> Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {formData.qualifications.map((q, i) => (
            <div key={i} className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm">
              {q}
              <button 
                type="button" 
                onClick={() => removeQualification(i)} 
                className="text-red-500 hover:text-red-600 flex-shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Formal Education History */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">Formal Education History</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 mb-6">
          {/* Changed from col-span-5 to col-span-4 */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Degree *"
              value={newEducation.degree}
              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
              className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          {/* Changed from col-span-5 to col-span-4 */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Institution *"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
              className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
          </div>
          {/* Changed from col-span-2 to col-span-4 */}
          <div className="md:col-span-4 flex gap-3">
            <input
              type="text"
              placeholder="Year"
              value={newEducation.year}
              onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
              className="flex-1 min-w-0 px-5 py-3.5 border border-gray-300 rounded-2xl focus:outline-none focus:border-[var(--primary-color)]"
            />
            <button
              type="button"
              onClick={addEducationEntry}
              className="px-8 bg-[var(--primary-color)] text-white rounded-2xl font-medium whitespace-nowrap flex-shrink-0"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          {/* Text varies slightly between the two files */}
          Certificates & Transcripts 
        </label>
        
        {/* Added flex, flex-col, items-center, justify-center, and w-full 👇 */}
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 hover:border-[var(--primary-color)] rounded-3xl p-10 sm:p-12 text-center cursor-pointer transition-all">
          <Upload size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Click or drag to upload education documents (PDF, JPG, PNG)
          </p>
          <input type="file" multiple accept=".pdf,.jpg,.png" className="hidden" onChange={handleEduDocUpload} />
        </label>

        {tempEduDocs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tempEduDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 bg-gray-50 p-5 rounded-2xl">
                <FileText size={28} className="text-gray-500 flex-shrink-0" />
                <div className="flex-1 truncate text-sm font-medium min-w-0">{doc.name}</div>
                <button 
                  type="button" 
                  onClick={() => removeTempEduDoc(i)} 
                  className="text-red-500 hover:text-red-600 flex-shrink-0"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.education && <p className="text-red-500 text-center font-medium mt-6">{errors.education}</p>}
    </div>
  );
};

export default EducationTab;