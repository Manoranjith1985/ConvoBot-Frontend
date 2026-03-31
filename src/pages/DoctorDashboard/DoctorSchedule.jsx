import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';
import AppointmentDetailModal from '../../components/DoctorComponents/AppointmentDetailModal';
import DoctorReferPatientModal from '../../components/DoctorComponents/DoctorReferPatientModal';
import { useDoctor } from '../../context/DoctorContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

// Helper: Safely convert any MongoDB ID format to clean string
const toIdString = (id) => {
  if (!id) return '';
  if (typeof id === 'string') return id.trim();
  if (typeof id === 'object') {
    return id.$oid || id._id?.$oid || id.toString?.() || JSON.stringify(id).replace(/["{}]/g, '').trim();
  }
  return String(id).trim();
};

// Helper: Format date as DD/MM/YYYY
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const formatDOB = (dob) => {
  if (!dob) return '—';
  const str = String(dob).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str;
  const date = new Date(dob);
  if (isNaN(date.getTime())) return str;
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const DoctorSchedule = () => {
  const navigate = useNavigate();
  const { selectedDoctor } = useDoctor();
  const provider = selectedDoctor?.name || 'Dr. Test OP Doctor';
  
  const [appointments, setAppointments] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // Editable Vitals (with structured BP support)
  const [editableVitals, setEditableVitals] = useState({
    height: '',
    weight: '',
    blood_pressure: '',
    bp_systolic: '',
    bp_diastolic: '',
  });
  const [savingVitals, setSavingVitals] = useState(false);

  useEscapeKey(() => {
    if (showReferModal) setShowReferModal(false);
    else if (selectedAppt) setSelectedAppt(null);
  });

  // Fetch Appointments + DEDUPLICATION
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await apiClient.get(`/doctor/appointments/history?provider=${encodeURIComponent(provider)}`);
        let appts = res.data?.data || res.data || [];

        // ←←← DEDUPLICATE BY ID (fixes the exact crash you are seeing)
        const uniqueMap = new Map();
        appts.forEach(appt => {
          const id = appt._id || appt.id;
          if (id && !uniqueMap.has(id)) uniqueMap.set(id, appt);
        });
        appts = Array.from(uniqueMap.values());

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
  }, [provider]);

  // Load Patient Details + BP splitting
  useEffect(() => {
    if (!selectedAppt) {
      setEditableVitals({ height: '', weight: '', blood_pressure: '', bp_systolic: '', bp_diastolic: '' });
      setPatientData(null);
      setPatientHistory([]);
      return;
    }

    const patientId = toIdString(selectedAppt.patient_id || selectedAppt._id);
    if (!patientId || patientId.length < 10) return;

    const fetchPatientDetails = async () => {
      setPatientLoading(true);
      try {
        const [patientRes, historyRes] = await Promise.all([
          apiClient.get(`doctor/patient/${patientId}`),
          apiClient.get(`doctor/patient/${patientId}/appointments`)
        ]);

        const patient = patientRes.data?.data || patientRes.data || null;
        setPatientData(patient);

        const bp = selectedAppt.blood_pressure || patient?.blood_pressure || '';
        const [sys, dia] = String(bp).split('/');

        setEditableVitals({
          height: selectedAppt.height || patient?.height || '',
          weight: selectedAppt.weight || patient?.weight || '',
          blood_pressure: bp,
          bp_systolic: sys?.trim() || '',
          bp_diastolic: dia?.trim() || '',
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
    if (!apptId) return alert('Cannot save vitals — missing appointment ID');

    setSavingVitals(true);
    try {
      await apiClient.patch(`/doctor/appointments/${apptId}/vitals`, {
        height: parseFloat(editableVitals.height) || null,
        weight: parseFloat(editableVitals.weight) || null,
        blood_pressure: editableVitals.blood_pressure || null,
      });

      setSelectedAppt(prev => ({
        ...prev,
        height: editableVitals.height,
        weight: editableVitals.weight,
        blood_pressure: editableVitals.blood_pressure,
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

  const openAppointmentDetail = (appt) => setSelectedAppt(appt);
  const closeModal = () => setSelectedAppt(null);

  const handleStartAppointment = () => {
    if (!selectedAppt) return;
    const apptId = toIdString(selectedAppt._id || selectedAppt.id);
    const patId = toIdString(selectedAppt.patient_id);

    window.open(
      `/encounter-documentation?appointment_id=${apptId}&patient_id=${patId}&patient=${encodeURIComponent(selectedAppt.patient_name || 'Unknown Patient')}&date=${selectedAppt.date}&time=${selectedAppt.time}&type=${encodeURIComponent(selectedAppt.visit_type || 'Consultation')}&provider=${encodeURIComponent(provider)}`,
      'EncounterDoc',
      'width=1200,height=900,resizable=yes,scrollbars=yes'
    );
  };

  const handleReferPatient = () => {
    if (!selectedAppt) return;
    setShowReferModal(true);
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
        <button onClick={() => navigate('/doctor-dashboard')} className="flex items-center gap-2 text-teal-600 hover:text-teal-800 hover:underline mb-6 font-medium transition-colors">
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-teal-700 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-teal-600" />
            Doctor's Appointment Schedule
          </h1>
          <p className="mt-2 text-gray-600">View and manage all your past, today’s, and upcoming appointments</p>
        </div>

        {/* Appointment List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No appointments found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {appointments.map((appt, index) => {
                const badge = getStatusBadge(appt);
                const uniqueKey = `${appt._id || appt.id || 'no-id'}-${appt.date || ''}-${appt.time || ''}-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    onClick={() => openAppointmentDetail(appt)}
                    className="p-5 flex items-center gap-5 cursor-pointer hover:bg-teal-50/30 transition-colors"
                  >
                    {/* rest of your card remains unchanged */}
                    <div className="flex-shrink-0 text-center w-16">
                      <div className="text-2xl font-bold text-teal-700">{new Date(appt.date).getDate()}</div>
                      <div className="text-xs text-gray-500 uppercase font-medium">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate text-lg">{appt.patient_name}</div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} className="text-teal-600" /> {appt.time || '—'}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{appt.visit_type || 'Consultation'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
                      <ChevronRight className="text-gray-400" size={20} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
          formatDate={formatDateDDMMYYYY}
          formatDOB={formatDOB}
          onClose={closeModal}
          onStartAppointment={handleStartAppointment}
          onReferPatient={handleReferPatient}
          currentDoctorName = {provider}
        />

        {showReferModal && selectedAppt && (
          <DoctorReferPatientModal
            isOpen={showReferModal}
            onClose={() => setShowReferModal(false)}
            appointment={selectedAppt}
            patientData={patientData}
            currentDoctorName={provider}
            onReferralSuccess={() => { alert('Referral created successfully'); setShowReferModal(false); }}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorSchedule;