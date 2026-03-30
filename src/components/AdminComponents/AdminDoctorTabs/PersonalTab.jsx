// src/components/admin/tabs/PersonalTab.jsx
import { User, Upload } from 'lucide-react';

const PersonalTab = ({ 
  formData, 
  handleChange, 
  errors, 
  avatarPreview, 
  setAvatarPreview, 
  setAvatarFile, 
  specialties, 
  loadingSpecialties 
}) => {

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col items-center">
        <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-gray-100">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <User size={64} />
            </div>
          )}
        </div>
        <label className="mt-6 cursor-pointer flex items-center gap-2 text-[var(--primary-color)] hover:underline font-medium">
          <Upload size={20} /> {avatarPreview ? 'Change Photo' : 'Upload Profile Photo'}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className={`w-full px-5 py-3.5 border rounded-2xl ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Specialty <span className="text-red-500">*</span>
          </label>
          <select 
            name="specialty" 
            value={formData.specialty} 
            onChange={handleChange} 
            disabled={loadingSpecialties}
            className={`w-full px-5 py-3.5 border rounded-2xl ${
              errors.specialty ? 'border-red-500' : 'border-gray-300 focus:border-[var(--primary-color)] focus:outline-none'
            } ${loadingSpecialties ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          >
            <option value="">
              {loadingSpecialties ? 'Loading specialties...' : 'Select Specialty'}
            </option>
            
            {!loadingSpecialties && specialties.map((spec, index) => {
              const isString = typeof spec === 'string';
              const label = isString ? spec : (spec.description || spec.name || spec);
              const value = isString ? spec : (spec.description || spec.name || spec._id || spec);
              
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            className={`w-full px-5 py-3.5 border rounded-2xl ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            className={`w-full px-5 py-3.5 border rounded-2xl ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Professional Bio</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            rows={5} 
            className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl resize-y" 
            placeholder="Brief professional summary..." 
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalTab;