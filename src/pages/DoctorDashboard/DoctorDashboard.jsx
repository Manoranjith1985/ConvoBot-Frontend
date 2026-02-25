// src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

const DoctorDashboard = () => {
  const [metrics, setMetrics] = useState({
    inPatients: 0,
    outPatients: 0,
    appointments: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);
  const [nextPatient, setNextPatient] = useState({});
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const provider = 'Dr. Test OP Doctor';
  
        const [metricsRes, apptsRes, nextRes, reqsRes] = await Promise.all([
          apiClient.get(`/doctor/dashboard-metrics?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/today_appointments?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/next_patient?provider=${encodeURIComponent(provider)}`),
          apiClient.get(`/doctor/appointment_requests?provider=${encodeURIComponent(provider)}`),
        ]);
  
        // ── Debug logs ────────────────────────────────────────
        console.log("Metrics response:", metricsRes.data);
        console.log("Today appointments raw:", apptsRes.data);
        console.log("Next patient raw:", nextRes.data);
        console.log("Requests raw:", reqsRes.data);
        // ──────────────────────────────────────────────────────
  
        setMetrics(metricsRes.data?.data || { inPatients: 0, outPatients: 0, appointments: 0 });
  
        // Handle both possible response shapes: {status,data} or direct array
        const rawAppts = apptsRes.data?.data || apptsRes.data || [];
  
        const formattedAppts = rawAppts.map(appt => ({
          ...appt,
          patient: appt.patient_name || appt.patient || 'Unknown Patient',
          type: appt.visit_type || appt.type || 'Unknown Type',
          avatar: appt.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
          time: appt.time || 'N/A',
          status: appt.status || 'Unknown'
        }));
  
        console.log("Formatted appointments ready to render:", formattedAppts);
  
        setTodayAppointments(formattedAppts);
  
        setNextPatient(nextRes.data?.data || nextRes.data || {});
  
        // Requests - also handle both shapes
        setRequests(reqsRes.data?.data || reqsRes.data || []);
  
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        console.error('Error response:', err.response?.data);
      }
    };
  
    fetchDashboardData();
  }, []);

  // Accept Appointment
  // Accept Appointment
const handleAccept = async (appointmentId) => {
  if (!appointmentId) {
    alert('Invalid appointment ID');
    return;
  }

  try {
    await apiClient.post(`/doctor/appointment_requests/accept/${appointmentId}`);
    alert('Appointment Accepted');
    window.location.reload(); // or refresh requests state
  } catch (err) {
    alert('Failed to accept');
  }
};

// Reject Appointment
const handleReject = async (appointmentId) => {
  if (!appointmentId) {
    alert('Invalid appointment ID');
    return;
  }

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
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Patients</p>
              <p className="text-3xl font-bold text-purple-600">{metrics.inPatients}</p>
            </div>
            <Users className="w-10 h-10 text-purple-400 opacity-30" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Out Patients</p>
              <p className="text-3xl font-bold text-green-600">{metrics.outPatients}</p>
            </div>
            <Users className="w-10 h-10 text-green-400 opacity-30" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Appointments</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.appointments}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-400 opacity-30" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Appointments */}
<div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold mb-6">Today Appointment</h2>
  
        {todayAppointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
            No appointments today
            </p>
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
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"; }}
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

        {/* Next Patient Card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Next Patient Details</h2>

          <div className="flex items-center mb-6">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
              alt={nextPatient.name || 'Patient'}
              className="w-20 h-20 rounded-full mr-4 object-cover"
            />
            <div>
              <h3 className="text-xl font-bold">{nextPatient.name || 'N/A'}</h3>
              <p className="text-gray-600 text-sm">{nextPatient.address || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500">D.O.B</p><p>{nextPatient.dob || 'N/A'}</p></div>
            <div><p className="text-gray-500">Sex</p><p>{nextPatient.sex || 'N/A'}</p></div>
            <div><p className="text-gray-500">Weight</p><p>{nextPatient.weight || 'N/A'}</p></div>
            <div><p className="text-gray-500">Height</p><p>{nextPatient.height || 'N/A'}</p></div>
            <div><p className="text-gray-500">Last Appointment</p><p>{nextPatient.lastAppointment || 'N/A'}</p></div>
            <div><p className="text-gray-500">Register Date</p><p>{nextPatient.registerDate || 'N/A'}</p></div>
          </div>

          <div className="mt-6">
            <p className="text-gray-500 mb-2">Conditions</p>
            <div className="flex flex-wrap gap-2">
              {(nextPatient.conditions || []).map((cond, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {cond}
                </span>
              ))}
              {(nextPatient.conditions || []).length === 0 && (
                <span className="text-gray-500 text-sm">No conditions listed</span>
              )}
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              {nextPatient.phone || 'No Phone'}
            </button>
            <button className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Documents
            </button>
            <button className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                onClick={() => {
                  // Open new window with EncounterDocumentation page
                  const width = 1200;
                  const height = 800;
                  const left = window.screen.width / 2 - width / 2;
                  const top = window.screen.height / 2 - height / 2;

                  // In DoctorDashboard - Chat button onClick:
                  window.open(
                    `/encounter-documentation`,
                    'EncounterDocumentation',
                    `width=1200,height=800,top=${top},left=${left},resizable=yes,scrollbars=yes`
                  );
                }}
              >
                Chat
              </button>
          </div>
        </div>
      </div>

      {/* Appointment Requests - UPDATED with Accept/Reject buttons */}
      <div className="mt-10 bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Appointment Requests</h2>
          <a href="#" className="text-blue-600 hover:underline">See All →</a>
        </div>

        <div className="space-y-4">
          {requests.map((req, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-4" />
                <div>
                  <h4 className="font-medium">{req.name || 'Unknown'}</h4>
                  <p className="text-sm text-gray-600">{req.type || 'N/A'} • {req.time || 'N/A'}</p>
                </div>
              </div>
              <div>
                {req.status === 'pending' ? (
                  <div className="flex space-x-3">
                  <button 
                    onClick={() => handleAccept(req.id)}
                    className="px-5 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium"
                  >
                    ✓ Accept
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="px-5 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                  >
                    × Reject
                  </button>
                </div>
                ) : (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm">
                    {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Accepted'}
                  </span>
                )}
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-center text-gray-500 py-4">No pending or accepted requests</p>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;