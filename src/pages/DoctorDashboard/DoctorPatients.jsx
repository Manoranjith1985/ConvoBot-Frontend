// src/pages/DoctorPatients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Calendar, Clock, FileText, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: replace with real auth context
  const currentDoctor = 'Dr. Test OP Doctor';

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/doctor/patients', {
          params: { provider: currentDoctor }
        });

        const data = res.data?.data || res.data || [];
        setPatients(data.map(p => ({
          ...p,
          name: p.name || p.patient_name || 'Unknown',
          firstVisit: p.appointments?.[p.appointments.length - 1]?.date || '—',
          lastVisit: p.appointments?.[0]?.date || '—'
        })));
      } catch (err) {
        console.error(err);
        setError('Failed to load your patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.file_number && p.file_number.includes(searchTerm)) ||
    (p.eid && p.eid.includes(searchTerm))
  );

  const openPatientDetail = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  const startDocumentation = (patient) => {
    // Find the most recent/future appointment for this patient
    const latestAppt = patient.appointments?.[0] || {};
    const apptId = latestAppt.id || latestAppt._id || '';

    const width = 1200;
    const height = 900;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      `/encounter-documentation?apptId=${apptId}&patient=${encodeURIComponent(patient.name)}&date=${latestAppt.date || ''}&time=${latestAppt.time || ''}&type=${encodeURIComponent(latestAppt.type || 'Consultation')}`,
      'EncounterDoc',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600 p-6">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        {error}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-teal-800">My Patients</h1>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, file no., EID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border">
            {searchTerm ? 'No matching patients found' : 'No patients registered under you yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id || patient.name}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 cursor-pointer"
                onClick={() => openPatientDetail(patient)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-semibold text-xl">
                    {patient.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">
                      {patient.file_number ? `File: ${patient.file_number}` : patient.eid ? `EID: ${patient.eid}` : '—'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-gray-500">First Visit</p>
                    <p className="font-medium">{formatDateDDMMYYYY(patient.firstVisit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Visit</p>
                    <p className="font-medium">{formatDateDDMMYYYY(patient.lastVisit)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Visits</p>
                    <p className="font-medium">{patient.appointments?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startDocumentation(patient);
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Start Documentation
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-teal-800">Patient Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-3xl font-bold">
                    {selectedPatient.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                    <p className="text-gray-600 mt-1">
                      {selectedPatient.file_number ? `File: ${selectedPatient.file_number}` : ''}
                      {selectedPatient.eid ? ` • EID: ${selectedPatient.eid}` : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">First Visit</p>
                    <p className="text-lg font-medium">{formatDateDDMMYYYY(selectedPatient.firstVisit)}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">Last Visit</p>
                    <p className="text-lg font-medium">{formatDateDDMMYYYY(selectedPatient.lastVisit)}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <p className="text-sm text-gray-500">Total Visits</p>
                    <p className="text-lg font-medium">{selectedPatient.appointments?.length || 0}</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-4">Appointment History</h3>
                {selectedPatient.appointments?.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPatient.appointments.map((appt, idx) => (
                      <div key={idx} className="border-l-4 border-teal-500 pl-4 py-3 bg-gray-50 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appt.type || 'Consultation'}</p>
                            <p className="text-sm text-gray-600">
                              {formatDateDDMMYYYY(appt.date)} • {appt.time || '—'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            appt.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="mt-2 text-sm text-gray-700">{appt.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8 italic">
                    No appointment history recorded yet
                  </p>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => startDocumentation(selectedPatient)}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  Start Documentation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPatients;