// src/pages/Patients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch unique patients and their history
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/doctor/patients', {
          params: { provider: 'Dr. Test OP Doctor' }, // ← replace with auth later
        });

        if (res.data.status === 'success') {
          setPatients(res.data.data || []);
        } else {
          setError(res.data.message || 'Failed to load patients');
        }
      } catch (err) {
        setError('Network error: Could not fetch patients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients by search
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openHistory = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Patients</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search patients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading patients...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No patients found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.name}
              onClick={() => openHistory(patient)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all border border-gray-200"
            >
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                  alt={patient.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{patient.name}</h3>
                  <p className="text-sm text-gray-600">
                    {patient.appointments?.length || 0} visits
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last visit: {patient.lastVisit || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Medical History: {selectedPatient.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Visits</p>
                    <p className="font-medium">{selectedPatient.appointments?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">First Visit</p>
                    <p className="font-medium">{selectedPatient.firstVisit || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Visit</p>
                    <p className="font-medium">{selectedPatient.lastVisit || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Appointment History</h3>
              <div className="space-y-4">
                {selectedPatient.appointments?.length > 0 ? (
                  selectedPatient.appointments.map((appt, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{appt.visit_type || 'Consultation'}</p>
                          <p className="text-sm text-gray-600">
                            {appt.date} • {appt.time}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            appt.status === 'Booked'
                              ? 'bg-blue-100 text-blue-800'
                              : appt.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appt.status || 'Unknown'}
                        </span>
                      </div>
                      {appt.notes && (
                        <p className="mt-2 text-sm text-gray-700">{appt.notes}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6">No appointment history available</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;