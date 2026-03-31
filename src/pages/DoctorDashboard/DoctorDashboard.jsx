// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Users, Calendar } from 'lucide-react';
import AcceptReferralModal from '../../components/DoctorComponents/AcceptReferralModal';
import { useDoctor } from '../../context/DoctorContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({ baseURL: API_BASE_URL });

const DoctorDashboard = () => {
  const [metrics, setMetrics] = useState({
    inPatients: 0,
    outPatients: 0,
    appointments: 0,
  });

  const { doctorId } = useParams();
  const { selectedDoctor } = useDoctor();

  const provider = selectedDoctor?.name || 'Dr. Test OP Doctor';

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [nextPatient, setNextPatient] = useState({});
  const [requests, setRequests] = useState([]);
  const [isLoadingNext, setIsLoadingNext] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, apptsRes, nextRes, reqsRes] = await Promise.all([
          apiClient.get(`/doctor/dashboard-metrics?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/today_appointments?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/next_patient?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/appointment_requests?provider=${encodeURIComponent(provider)}`),
        ]);
        

        const formatDOB = (dob) => {
          if (!dob) return 'Not recorded';
        
          const str = String(dob).trim();
        
          // Already in DD/MM/YYYY? Return as-is
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            return str;
          }
        
          const date = new Date(dob);
          if (isNaN(date.getTime())) {
            return str; // Return original if unparseable
          }
        
          return `${date.getDate().toString().padStart(2, '0')}/${
            (date.getMonth() + 1).toString().padStart(2, '0')
          }/${date.getFullYear()}`;
        };

        console.log('Next patient raw:', nextRes.data);

        setMetrics(metricsRes.data?.data || { inPatients: 0, outPatients: 0, appointments: 0 });

        const rawAppts = apptsRes.data?.data || apptsRes.data || [];
        const formattedAppts = rawAppts.map(appt => ({
          ...appt,
          patient: appt.patient_name || appt.patient || 'Unknown Patient',
          type: appt.visit_type || appt.type || 'Unknown Type',
          avatar: appt.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          time: appt.time || 'N/A',
          status: appt.status || 'Unknown',
        }));
        setTodayAppointments(formattedAppts);

        const raw = nextRes.data?.data || nextRes.data || {};

        const formattedNext = {
          name: raw.patient_name || raw.patient || 'N/A',
          address: raw.address || `${raw.billing_type || 'N/A'} • ${raw.visit_type || 'N/A'}`,
          
          // DOB - Now properly formatted using the same logic as the modal
          dob: formatDOB(raw.dob || raw.date_of_birth),
          
          // Gender - More robust mapping
          sex: raw.sex || raw.gender || 'Not recorded',
          
          weight: raw.weight ? `${raw.weight} kg` : 'N/A',
          height: raw.height ? `${raw.height} cm` : 'N/A',
          bloodPressure: raw.blood_pressure || 'N/A',
          allergies: raw.allergies || 'None',
          chronicConditions: raw.chronic_conditions || 'None',
          lastAppointment: raw.last_appointment || 'First visit',
          registerDate: raw.created_at?.$date
            ? new Date(raw.created_at.$date).toLocaleDateString('en-GB')
            : 'N/A',
          
          conditions: [
            ...(raw.chronic_conditions && raw.chronic_conditions !== 'None' ? [raw.chronic_conditions] : []),
            ...(raw.allergies && raw.allergies !== 'None' ? [`Allergy: ${raw.allergies}`] : []),
            ...(raw.concerns ? [raw.concerns] : []),
          ].filter(Boolean),

          phone: raw.phone || raw.mobile || 'Not available',
          appointmentId: raw.id || raw._id || '',
          patientId: raw.patient_id?.$oid || raw.patient_id || '',
          date: raw.date || '',
          time: raw.time || '',
          visitType: raw.visit_type || raw.type || 'Consultation',
        };

        setNextPatient(formattedNext);
        setRequests(reqsRes.data?.data || reqsRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoadingNext(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAccept = async (referral) => {
    setSelectedReferral(referral);
    setShowAcceptModal(true);
  };

  const handleReject = async (appointmentId) => {
    if (!appointmentId) return alert('Invalid appointment ID');
    try {
      await apiClient.post(`/doctor/appointment_requests/reject/${appointmentId}`);
      alert('Appointment Rejected');
      window.location.reload();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Appointments</p>
          <p className="text-3xl font-bold text-blue-600">{metrics.appointments}</p>
          <Calendar className="w-10 h-10 text-blue-400 opacity-30 float-right -mt-10" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">In Patients</p>
          <p className="text-3xl font-bold text-purple-600">{metrics.inPatients}</p>
          <Users className="w-10 h-10 text-purple-400 opacity-30 float-right -mt-10" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Out Patients</p>
          <p className="text-3xl font-bold text-green-600">{metrics.outPatients}</p>
          <Users className="w-10 h-10 text-green-400 opacity-30 float-right -mt-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Today’s Appointments</h2>
          {todayAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No appointments today</p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-4 rounded-lg border ${
                    appt.status === 'Booked' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <img
                    src={appt.avatar}
                    alt={appt.patient}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                    onError={e => (e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100')}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{appt.patient}</h3>
                    <p className="text-sm text-gray-600">{appt.type}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${appt.status === 'Booked' ? 'text-blue-600' : 'text-gray-700'}`}>
                      {appt.time}
                    </p>
                    {appt.status === 'Booked' && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Next Patient Details</h2>

          {isLoadingNext ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 mr-4" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">{[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
              ))}</div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt={nextPatient.name}
                  className="w-20 h-20 rounded-full mr-4 object-cover"
                  onError={e => (e.target.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100')}
                />
                <div>
                  <h3 className="text-xl font-bold">{nextPatient.name}</h3>
                  <p className="text-gray-600 text-sm">{nextPatient.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-gray-500">D.O.B</p>
                  <p className="font-medium">{nextPatient.dob}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sex</p>
                  <p className="font-medium">{nextPatient.sex}</p>
                </div>
                <div>
                  <p className="text-gray-500">Weight</p>
                  <p className="font-medium">{nextPatient.weight}</p>
                </div>
                <div>
                  <p className="text-gray-500">Height</p>
                  <p className="font-medium">{nextPatient.height}</p>
                </div>
                <div>
                  <p className="text-gray-500">BP</p>
                  <p className="font-medium">{nextPatient.bloodPressure}</p>
                </div>
                <div>
                  <p className="text-gray-500">Allergies</p>
                  <p className="font-medium">{nextPatient.allergies}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-500 mb-2">Concerns & Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {nextPatient.conditions?.length > 0 ? nextPatient.conditions.map((cond, i) => (
                    <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {cond}
                    </span>
                  )) : (
                    <span className="text-gray-500 text-sm">No conditions / concerns recorded</span>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700">
                  {nextPatient.phone}
                </button>
                <button className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">
                  Documents
                </button>
                <button
                  className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50"
                  onClick={() => {
                    const w = 1200, h = 800;
                    const left = window.screen.width / 2 - w / 2;
                    const top = window.screen.height / 2 - h / 2;
                    window.open(
                      `/encounter-documentation?` +
                      `appointment_id=${nextPatient.appointmentId || ''}&` +
                      `patient_id=${nextPatient.patientId || ''}&` +
                      `patient=${encodeURIComponent(nextPatient.name || '')}&` +
                      `date=${encodeURIComponent(nextPatient.date || '')}&` +
                      `time=${encodeURIComponent(nextPatient.time || '')}&` +
                      `type=${encodeURIComponent(nextPatient.visitType || '')}`,
                      'EncounterDoc',
                      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes`
                    );
                  }}
                >
                  Chat / Document
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Appointment Requests</h2>
          <a href="#" className="text-blue-600 hover:underline">See All →</a>
        </div>
        <div className="space-y-4">
          {requests.map((req, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div>
                  <h4 className="font-medium">{req.name || 'Unknown Patient'}</h4>
                  <p className="text-sm text-gray-600">
                    {req.type || 'Consultation'} • {req.time || '—'} ({req.date || '—'})
                  </p>
                  {req.referral_from && (
                    <p className="text-sm text-purple-700 mt-1">
                      Referred by: {req.referral_from}
                    </p>
                  )}
                  {req.referral_notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Note: {req.referral_notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0">
                {req.status?.toLowerCase() === 'pending confirmation' || req.status?.toLowerCase() === 'pending' ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAccept(req)}
                      className="px-5 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-5 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                    >
                      × Reject
                    </button>
                  </div>
                ) : (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    req.status?.toLowerCase() === 'accepted' ? 'bg-green-100 text-green-700' :
                    req.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.status?.charAt(0).toUpperCase() + req.status?.slice(1) || 'Unknown'}
                  </span>
                )}
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-center text-gray-500 py-8">No pending appointment requests</p>
          )}

          <AcceptReferralModal
            isOpen={showAcceptModal}
            onClose={() => setShowAcceptModal(false)}
            referral={selectedReferral}
            onSuccess={() => {
              // Refresh requests
              window.location.reload(); // or better: refetch requests
            }}
          />
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;