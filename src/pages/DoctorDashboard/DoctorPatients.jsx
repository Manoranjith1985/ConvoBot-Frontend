// src/pages/DoctorPatients.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { 
  Search, User, Calendar, Clock, FileText, AlertCircle, 
  X, Ban, ActivitySquare 
} from 'lucide-react';
import useEscapeKey from '../../hooks/UseEscapeKey';
import { useDoctor } from '../../context/DoctorContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TODO: Replace with real auth context later
  const { doctorId } = useParams();
  const { selectedDoctor } = useDoctor();

  const currentDoctor = selectedDoctor?.name || 'Dr. Test OP Doctor';

  useEscapeKey(() => setSelectedPatient(null));

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
          firstVisit: p.firstVisit || p.appointments?.[p.appointments?.length - 1]?.date || '—',
          lastVisit: p.lastVisit || p.appointments?.[0]?.date || '—'
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
        <button
          onClick={() => navigate('/doctor-dashboard')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 hover:underline mb-6 font-medium transition-colors"
        >
          ← Back to Dashboard
        </button>

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
                key={patient.id || patient._id || patient.name}
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

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
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
              </div>
            ))}
          </div>
        )}

        {/* Patient Detail Modal with Faded Background */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-3">
                  <User className="text-teal-600" /> Patient Profile
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8">
                {/* Basic Info */}
                <div className="flex items-start gap-6 mb-10">
                  <div className="w-24 h-24 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-700 text-5xl font-bold flex-shrink-0">
                    {selectedPatient.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 pt-2">
                    <h2 className="text-3xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-gray-600">
                      {selectedPatient.file_number && <div>File No: <span className="font-medium text-gray-900">{selectedPatient.file_number}</span></div>}
                      {selectedPatient.eid && <div>EID: <span className="font-medium text-gray-900">{selectedPatient.eid}</span></div>}
                      {selectedPatient.phone && <div>Phone: <span className="font-medium text-gray-900">{selectedPatient.phone}</span></div>}
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-gray-500 text-sm">First Visit</p>
                    <p className="text-2xl font-semibold mt-1">{formatDateDDMMYYYY(selectedPatient.firstVisit)}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-gray-500 text-sm">Last Visit</p>
                    <p className="text-2xl font-semibold mt-1">{formatDateDDMMYYYY(selectedPatient.lastVisit)}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-gray-500 text-sm">Total Visits</p>
                    <p className="text-2xl font-semibold mt-1">{selectedPatient.appointments?.length || 0}</p>
                  </div>
                </div>

                {/* Clinical Info - Most Relevant for Doctor */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Ban className="text-red-500" size={20} /> Known Allergies
                    </h3>
                    <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-gray-800 min-h-[110px]">
                      {selectedPatient.allergies || 'No known allergies recorded'}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <ActivitySquare className="text-amber-600" size={20} /> Chronic Conditions
                    </h3>
                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-gray-800 min-h-[110px]">
                      {selectedPatient.chronic_conditions || 'No chronic conditions recorded'}
                    </div>
                  </div>
                </div>

                {/* Appointment History */}
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="text-teal-600" size={20} /> Appointment History
                </h3>
                {selectedPatient.appointments?.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedPatient.appointments.map((appt, idx) => (
                      <div key={idx} className="border-l-4 border-teal-500 pl-5 py-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{appt.type || 'Consultation'}</p>
                            <p className="text-sm text-gray-600 mt-0.5">
                              {formatDateDDMMYYYY(appt.date)} • {appt.time || '—'}
                            </p>
                          </div>
                          <span className={`px-4 py-1 text-xs font-medium rounded-full ${
                            appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            appt.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {appt.status || 'Booked'}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="mt-4 text-sm text-gray-700 border-t pt-3">{appt.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-500 italic">
                    No appointment history recorded yet for this patient.
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors"
                >
                  Close
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