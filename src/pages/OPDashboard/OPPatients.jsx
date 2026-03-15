// src/pages/OPDashboard/OPPatients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, Calendar, Phone, ChevronDown, ChevronUp, History, Download, FileText, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const OPPatients = () => {
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_patients: 0,
    active_patients: 0,
    todays_visits: 0,
    in_patients: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    eid: '',
    mobile: '',
    insurance: '',
    dateFrom: '',
    dateTo: '',
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsRes, metricsRes] = await Promise.all([
          apiClient.get('/op/patients'),
          apiClient.get('/op/patients/metrics'),
        ]);

        setPatients(patientsRes.data?.data || []);
        setMetrics(metricsRes.data?.data || metrics);
      } catch (err) {
        console.error(err);
        setError('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = patients.filter(p => {
    const s = filters.search.toLowerCase();
    const matchesSearch = !s || 
      p.name?.toLowerCase().includes(s) ||
      p.id?.toLowerCase().includes(s) ||
      p.file_number?.includes(s) ||
      p.eid?.toLowerCase().includes(s);

    const matchesEid    = !filters.eid    || p.eid?.toLowerCase().includes(filters.eid.toLowerCase());
    const matchesMobile = !filters.mobile || p.mobile?.includes(filters.mobile);
    const matchesIns    = !filters.insurance || p.billing_type?.toLowerCase() === filters.insurance.toLowerCase();

    const lastVisit = p.lastVisit ? new Date(p.lastVisit) : null;
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to   = filters.dateTo   ? new Date(filters.dateTo)   : null;
    const matchesDate = (!from || (lastVisit && lastVisit >= from)) &&
                        (!to   || (lastVisit && lastVisit <= to));

    return matchesSearch && matchesEid && matchesMobile && matchesIns && matchesDate;
  });

  const exportToExcel = () => {
    const data = filteredPatients.map(p => ({
      'Patient ID':   p.id,
      'File Number':  p.file_number || '—',
      Name:           p.name,
      Mobile:         p.mobile || '—',
      EID:            p.eid || '—',
      DOB:            formatDateDDMMYYYY(p.dob),
      Gender:         p.gender || '—',
      'Last Visit':   formatDateDDMMYYYY(p.lastVisit),
      Status:         p.status || '—',
      Billing:        p.billing_type || '—',
      Insurance:      p.receiver || p.insurance_provider || '—',
      Allergies:      p.allergies || 'None',
      'Chronic Cond.': p.chronic || 'None',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Patients');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), `Patients_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading patients...</div>;
  if (error)   return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-teal-700">Patient Management</h1>
          <p className="text-gray-600 mt-1">All registered patients • OP Reception</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="primary-btn flex items-center gap-2"
        >
          <Download size={18} /> Export List
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Filter size={18} className="text-teal-600" />
            Quick Filters
          </h3>
          <div className="text-sm text-gray-500">
            {filteredPatients.length} of {patients.length} patients shown
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search name / ID</label>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              placeholder="Name, File #, EID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">EID / Emirates ID</label>
            <input
              type="text"
              value={filters.eid}
              onChange={e => setFilters({...filters, eid: e.target.value})}
              placeholder="784-XXXX-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="text"
              value={filters.mobile}
              onChange={e => setFilters({...filters, mobile: e.target.value})}
              placeholder="+971 ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Type</label>
            <select
              value={filters.insurance}
              onChange={e => setFilters({...filters, insurance: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10"></th>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>DOB</th>
              <th>Last Visit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-16 text-gray-500 italic">
                  No patients match the current filters
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => (
                <React.Fragment key={patient.id}>
                  <tr 
                    className="border-b hover:bg-teal-50/30 cursor-pointer transition-colors"
                    onClick={() => setExpandedRow(expandedRow === patient.id ? null : patient.id)}
                  >
                    <td className="p-5 text-center">
                      {expandedRow === patient.id ? (
                        <ChevronUp size={20} className="text-teal-600 mx-auto" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-5 font-mono text-teal-700">{patient.id}</td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                          {patient.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="p-5">{patient.mobile || '—'}</td>
                    <td className="p-5">{formatDateDDMMYYYY(patient.dob)}</td>
                    <td className="p-5">{formatDateDDMMYYYY(patient.lastVisit)}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        patient.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {patient.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>

                  {expandedRow === patient.id && (
                    <tr>
                      <td colSpan="7" className="bg-gray-50 p-0">
                        <div className="p-8">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div>
                              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <FileText size={18} /> Patient Information
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div><strong>File Number:</strong> {patient.file_number || '—'}</div>
                                <div><strong>EID:</strong> {patient.eid || '—'}</div>
                                <div><strong>Gender:</strong> {patient.gender || '—'}</div>
                                <div><strong>Address:</strong> {patient.address || '—'}</div>
                                <div><strong>Company:</strong> {patient.company_name || '—'}</div>
                                <div><strong>Allergies:</strong> {patient.allergies || 'None reported'}</div>
                                <div><strong>Chronic Conditions:</strong> {patient.chronic || 'None reported'}</div>
                                <div><strong>Billing Type:</strong> {patient.billing_type || '—'}</div>
                                {patient.billing_type === 'Insurance' && (
                                  <>
                                    <div><strong>Receiver:</strong> {patient.receiver || '—'}</div>
                                    <div><strong>Member ID:</strong> {patient.member_id || '—'}</div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <History size={18} /> Recent Visits
                              </h3>
                              {patient.history?.length > 0 ? (
                                <div className="space-y-4">
                                  {patient.history.slice(0, 5).map((visit, i) => (
                                    <div key={i} className="bg-white p-4 rounded-lg border shadow-sm">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium">{formatDateDDMMYYYY(visit.date)}</span>
                                        <span className="text-teal-600">{visit.type}</span>
                                      </div>
                                      <div className="text-gray-700">{visit.reason || 'No details'}</div>
                                      <div className="text-xs text-gray-500 mt-2">
                                        Doctor: {visit.doctor || '—'}
                                      </div>
                                    </div>
                                  ))}
                                  {patient.history.length > 5 && (
                                    <p className="text-sm text-gray-500 italic mt-2">
                                      + {patient.history.length - 5} more visits
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">No previous visits recorded.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OPPatients;