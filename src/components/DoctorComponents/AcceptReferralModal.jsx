// src/components/DoctorComponents/AcceptReferralModal.jsx
import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import useEscapeKey from '../../hooks/UseEscapeKey';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const AcceptReferralModal = ({ 
  isOpen, 
  onClose, 
  referral, 
  onSuccess 
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEscapeKey(() => {
    if (isOpen) onClose();
  });

  if (!isOpen || !referral) return null;

  const handleAccept = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.post(`/doctor/appointment_requests/accept/${referral.id || referral._id}`, {
        date: selectedDate,
        time: selectedTime
      });

      if (res.data.status === 'success') {
        alert(`✅ Referral accepted for ${selectedDate} at ${selectedTime}`);
        onSuccess?.();
        onClose();
      } else {
        setError(res.data.message || "Failed to accept referral");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to accept referral. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Accept Referral</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="font-semibold text-lg">{referral.patient_name || referral.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              Referred by: {referral.referral_from || 'Unknown Doctor'}
            </div>
            {referral.referral_notes && (
              <div className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-xl border">
                {referral.referral_notes}
              </div>
            )}
          </div>

          {/* Date & Time Picker */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={18} className="text-teal-600" />
                Appointment Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={18} className="text-teal-600" />
                Appointment Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={loading || !selectedDate || !selectedTime}
              className={`flex-1 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 ${
                loading || !selectedDate || !selectedTime
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Accepting...
                </>
              ) : (
                'Accept & Schedule'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptReferralModal;