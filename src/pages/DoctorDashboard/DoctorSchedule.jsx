// src/pages/DoctorSchedule.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';
import AppointmentDetailModal from '../../components/DoctorComponents/AppointmentDetailModal';
import DoctorReferPatientModal from '../../components/DoctorComponents/DoctorReferPatientModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Helper: Safely convert any MongoDB ID format to clean string
const toIdString = (id) => {
  if (!id) return '';
  if (typeof id === 'string') return id.trim();
  if (typeof id === 'object') {
    return id.$oid || 
           id._id?.$oid || 
           id.toString?.() || 
           JSON.stringify(id).replace(/["{}]/g, '').trim();
  }
  return String(id).trim();
};

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // Editable Vitals
  const [editableVitals, setEditableVitals] = useState({
    height: '',
    weight: '',
    blood_pressure: ''
  });
  const [savingVitals, setSavingVitals] = useState(false);

  useEscapeKey(() => setSelectedAppt(null));

  const provider = 'Dr. Test OP Doctor';

  // Fetch All Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await apiClient.get(`/doctor/appointments/history?provider=${encodeURIComponent(provider)}`);
        const appts = res.data?.data || res.data || [];

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const future = appts.filter(a => new Date(`${a.date}T${a.time || '00:00'}`) > now);
        const today = appts.filter(a => a.date === todayStr);
        const past = appts.filter(a => a.date < todayStr);

        future.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
        past.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

        setAppointments([...future, ...today, ...past]);
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Load Patient + Vitals when appointment is selected
  useEffect(() => {
    if (!selectedAppt) {
      setEditableVitals({ height: '', weight: '', blood_pressure: '' });
      setPatientData(null);
      setPatientHistory([]);
      return;
    }

    const patientId = toIdString(selectedAppt.patient_id || selectedAppt._id);

    if (!patientId || patientId.length < 10) {
      console.warn('Invalid patient ID detected:', selectedAppt.patient_id || selectedAppt._id);
      return;
    }

    const fetchPatientDetails = async () => {
      setPatientLoading(true);
      try {
        const [patientRes, historyRes] = await Promise.all([
          apiClient.get(`doctor/patient/${patientId}`),
          apiClient.get(`doctor/patient/${patientId}/appointments`)
        ]);

        const patient = patientRes.data?.data || patientRes.data || null;
        setPatientData(patient);

        setEditableVitals({
          height: selectedAppt.height || patient?.height || '',
          weight: selectedAppt.weight || patient?.weight || '',
          blood_pressure: selectedAppt.blood_pressure || patient?.blood_pressure || ''
        });

        setPatientHistory(historyRes.data?.data || []);
      } catch (err) {
        console.error("Patient data fetch failed:", err);
      } finally {
        setPatientLoading(false);
      }
    };

    fetchPatientDetails();
  }, [selectedAppt]);

  const handleSaveVitals = async () => {
    if (!selectedAppt) return;

    const apptId = toIdString(selectedAppt._id || selectedAppt.id);

    if (!apptId) {
      alert('Cannot save vitals — missing appointment ID');
      return;
    }

    setSavingVitals(true);
    try {
      await apiClient.patch(`/doctor/appointments/${apptId}/vitals`, {
        height: parseFloat(editableVitals.height) || null,
        weight: parseFloat(editableVitals.weight) || null,
        blood_pressure: editableVitals.blood_pressure || null
      });

      setSelectedAppt(prev => ({
        ...prev,
        height: editableVitals.height,
        weight: editableVitals.weight,
        blood_pressure: editableVitals.blood_pressure
      }));

      alert('✅ Vitals saved successfully!');
    } catch (err) {
      console.error('Failed to save vitals:', err);
      alert('❌ Failed to save vitals. Please try again.');
    } finally {
      setSavingVitals(false);
    }
  };

  const isToday = (dateStr) => new Date().toISOString().split('T')[0] === dateStr;
  const isFuture = (dateStr, timeStr = '00:00') => new Date(`${dateStr}T${timeStr}`) > new Date();

  const getStatusBadge = (appt) => {
    const status = (appt.status || 'Booked').toLowerCase();
    if (status === 'cancelled') return { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled' };
    if (isFuture(appt.date, appt.time)) return { bg: '#dbeafe', text: '#1e40af', label: 'Upcoming' };
    if (isToday(appt.date)) return { bg: '#d1fae5', text: '#065f46', label: 'Today' };
    return { bg: '#f3f4f6', text: '#374151', label: 'Past' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const openAppointmentDetail = (appt) => setSelectedAppt(appt);
  const closeModal = () => setSelectedAppt(null);

  // Fixed: Start Appointment with clean IDs
  const handleStartAppointment = () => {
    if (!selectedAppt) return;

    const apptId = toIdString(selectedAppt._id || selectedAppt.id);
    const patId = toIdString(selectedAppt.patient_id);

    window.open(
      `/encounter-documentation?appointment_id=${apptId}&patient_id=${patId}&patient=${encodeURIComponent(selectedAppt.patient_name || 'Unknown Patient')}&date=${selectedAppt.date}&time=${selectedAppt.time}&type=${encodeURIComponent(selectedAppt.visit_type || 'Consultation')}`,
      'EncounterDoc',
      'width=1200,height=900,resizable=yes,scrollbars=yes'
    );
  };

  // Fixed: Refer Patient - Pass required fields (phone, provider, etc.)
  const handleReferPatient = () => {
    if (!selectedAppt) return;

    // Extract clean data for referral
    const referralData = {
      appointment_id: toIdString(selectedAppt._id || selectedAppt.id),
      patient_id: toIdString(selectedAppt.patient_id),
      patient_name: selectedAppt.patient_name || 'Unknown Patient',
      phone: selectedAppt.phone || patientData?.phone || patientData?.mobile || '',   // Try multiple sources
      provider: provider,   // Current doctor
      referral_from: provider,
      referral_notes: '',   // Can be enhanced later with modal input
      date: selectedAppt.date,
      time: selectedAppt.time,
      visit_type: selectedAppt.visit_type || 'Consultation'
    };

    setShowReferModal(true);
    // You can pass referralData to the modal if needed by lifting state or using context
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/doctor-dashboard')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 hover:underline mb-6 font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-700 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-600" />
            Doctor's Appointment Schedule
          </h1>
          <p className="mt-2 text-gray-600">
            View and manage all your past, today’s, and upcoming appointments
          </p>
        </div>

        {/* Appointment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No appointments found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appt) => {
                const badge = getStatusBadge(appt);
                return (
                  <div
                    key={appt._id || appt.id}
                    onClick={() => openAppointmentDetail(appt)}
                    className="p-5 flex items-center gap-5 cursor-pointer hover:bg-teal-50/30 transition-colors"
                  >
                    <div className="flex-shrink-0 text-center w-16">
                      <div className="text-2xl font-bold text-teal-700">
                        {new Date(appt.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 uppercase font-medium">
                        {new Date(appt.date).toLocaleString('default', { month: 'short' })}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-lg">
                        {appt.patient_name}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-teal-600" /> {appt.time || '—'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{appt.visit_type || 'Consultation'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Render Modal */}
        <AppointmentDetailModal
          selectedAppt={selectedAppt}
          patientData={patientData}
          patientHistory={patientHistory}
          editableVitals={editableVitals}
          setEditableVitals={setEditableVitals}
          savingVitals={savingVitals}
          handleSaveVitals={handleSaveVitals}
          patientLoading={patientLoading}
          isToday={isToday}
          isFuture={isFuture}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          onClose={closeModal}
          onStartAppointment={handleStartAppointment}
          onReferPatient={handleReferPatient}
        />

        {/* Refer Modal - Now receives proper data */}
        {showReferModal && selectedAppt && (
          <DoctorReferPatientModal
            isOpen={showReferModal}
            onClose={() => setShowReferModal(false)}
            appointment={selectedAppt}
            patientData={patientData}
            currentDoctorName={provider}
            onReferralSuccess={() => {
              alert('Referral created successfully');
              setShowReferModal(false);
              // Optional: refresh appointments list
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;