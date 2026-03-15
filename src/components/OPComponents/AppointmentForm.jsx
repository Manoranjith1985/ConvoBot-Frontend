// src/components/OPDashboard/AppointmentForm.jsx
import React from 'react';
import { Upload } from 'lucide-react';

const AppointmentForm = ({ form, setForm, doctors, receivers, payers, networks, onSubmit, onCancel }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
        <div>
          <label className="block font-medium text-gray-700 mb-2">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Patient Details */}
        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">Patient Name</label>
          <input
            name="patient"
            value={form.patient}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">EID / Emirates ID</label>
          <input
            name="eid"
            value={form.eid}
            onChange={handleChange}
            placeholder="EID number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">File Number</label>
          <input
            name="fileNumber"
            value={form.fileNumber}
            onChange={handleChange}
            placeholder="Internal file number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Full address"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl min-h-[80px] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Company Name</label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            placeholder="Employer's company"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Doctor & Visit Type */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Provider / Doctor</label>
          <select
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((d, i) => (
              <option key={i} value={d.name}>
                {d.name} ({d.specialty || 'General'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Visit Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          >
            <option>Consultation</option>
            <option>Follow-up</option>
            <option>Procedure</option>
            <option>Emergency</option>
          </select>
        </div>

        {/* Billing Section */}
        <div>
          <label className="block font-medium text-gray-700 mb-2">Billing Type</label>
          <select
            name="billing_type"
            value={form.billing_type}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          >
            <option>Cash</option>
            <option>Insurance</option>
          </select>
        </div>

        {form.billing_type === 'Insurance' && (
          <>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Receiver</label>
              <select
                name="receiver"
                value={form.receiver}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value="">Select Receiver</option>
                {receivers.map((r, i) => (
                  <option key={i} value={r.code}>
                    {r.description} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Payer</label>
              <select
                name="payer"
                value={form.payer}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value="">Select Payer</option>
                {payers.map((p, i) => (
                  <option key={i} value={p.code}>
                    {p.description} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Network</label>
              <select
                name="network"
                value={form.network}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              >
                <option value="">Select Network</option>
                {networks.map((n, i) => (
                  <option key={i} value={n.code}>
                    {n.description} ({n.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Member ID</label>
              <input
                name="memberId"
                value={form.memberId}
                onChange={handleChange}
                placeholder="Insurance member ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Discount %</label>
              <input
                type="number"
                name="discount_percent"
                value={form.discount_percent}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </>
        )}

        {/* Concerns & Vitals */}
        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">Chief Concerns</label>
          <textarea
            name="concerns"
            value={form.concerns}
            onChange={handleChange}
            placeholder="Patient's main concerns..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl min-h-[80px] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              placeholder="e.g. 170"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="e.g. 70"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Blood Pressure</label>
            <input
              name="blood_pressure"
              value={form.blood_pressure}
              onChange={handleChange}
              placeholder="e.g. 120/80"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">Allergies</label>
          <textarea
            name="allergies"
            value={form.allergies}
            onChange={handleChange}
            placeholder="Known allergies..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl min-h-[60px] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-gray-700 mb-2">Chronic Conditions</label>
          <textarea
            name="chronic_conditions"
            value={form.chronic_conditions}
            onChange={handleChange}
            placeholder="Chronic health conditions..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl min-h-[60px] focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>
      </div>

      {/* Documents Upload (placeholder) */}
      <div className="mt-8">
        <label className="block font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Upload size={18} /> Upload Documents (EID, Insurance Card, Previous Reports)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-400 transition-colors">
          <Upload className="mx-auto text-gray-400 mb-3" size={36} />
          <p className="text-gray-600">Drag & drop files or <span className="text-teal-600 font-medium">browse</span></p>
          <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG • Max 10 MB per file</p>
          <input type="file" className="hidden" multiple />
        </div>
        {/* TODO: Real upload logic */}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-7 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          Create Appointment
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;