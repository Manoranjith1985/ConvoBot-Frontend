// src/pages/ClinicAdmin/ClinicAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // ← added
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Calendar, DollarSign, Clock, TrendingUp, AlertTriangle,
  FileWarning, Download, X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const ClinicAdminDashboard = ({ role = 'Clinic Admin', primaryColor = '#7c3aed' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [weeklyAppointments, setWeeklyAppointments] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [showPatientsModal, setShowPatientsModal] = useState(false);

  const [recentActivity] = useState([
    { time: '09:15', event: 'Vitals recorded – BP 128/82', patient: 'Deepanraj S', by: 'Nurse Meena' },
    { time: '10:05', event: 'Referral to Cardiology', patient: 'Lakshmi V', by: 'Dr. Rajesh' },
  ]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, patientsRes, weeklyRes, utilRes, schedulesRes] = await Promise.all([
          apiClient.get('/admin/dashboard/summary'),
          apiClient.get('/admin/dashboard/recent-patients?limit=50'), // ← increased limit for modal
          apiClient.get('/admin/dashboard/weekly-appointments'),
          apiClient.get('/admin/dashboard/utilization'),
          apiClient.get('/admin/dashboard/today-schedules')
        ]);

        setMetrics(summaryRes.data || {});
        setRecentPatients(patientsRes.data || []);
        setWeeklyAppointments(weeklyRes.data || []);
        setUtilizationData(utilRes.data || []);
        setTodaySchedules(schedulesRes.data || []);

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ─── Export Helpers ────────────────────────────────────────
  const exportToExcel = (data, filename, sheetName = 'Data') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportWeekly = () => {
    exportToExcel(weeklyAppointments, 'Weekly_Appointments', 'Appointments');
  };

  const handleExportUtilization = () => {
    exportToExcel(utilizationData, 'Doctor_Utilization', 'Utilization');
  };

  const handleExportDashboard = () => {
    // You can combine multiple sheets if desired
    const wb = XLSX.utils.book_new();
    
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(weeklyAppointments),
      'Weekly Appointments'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(utilizationData),
      'Doctor Utilization'
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(recentPatients.slice(0, 50)),
      'Recent Patients'
    );

    XLSX.writeFile(wb, `Clinic_Dashboard_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading dashboard...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB');

  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {role === 'Super Admin' || role === 'Group Admin' ? 'Group' : 'Clinic'} Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Overview • {formattedDate}</p>
        </div>
        <button
          onClick={handleExportDashboard}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium"
        >
          <Download size={18} /> Export Dashboard
        </button>
      </div>

      {/* Metrics – unchanged */}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Charts */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Weekly Appointments</h2>
              <button
                onClick={handleExportWeekly}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-[var(--primary-color)]"
              >
                <Download size={16} /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={weeklyAppointments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--primary-color)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Doctor Utilization (Last 7 Days)</h2>
              <button
                onClick={handleExportUtilization}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-[var(--primary-color)]"
              >
                <Download size={16} /> Export
              </button>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="doctor" angle={-45} textAnchor="end" height={70} />
                <YAxis yAxisId="left" orientation="left" label="Patients" />
                <YAxis yAxisId="right" orientation="right" label="Avg Time (min)" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="patients" fill="#6366f1" name="Patients" radius={4} />
                <Bar yAxisId="right" dataKey="avgTime" fill="#10b981" name="Avg Time" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* High Utilization Alerts – unchanged */}
          
          {/* Recent Patients – now with modal */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" />
              High Utilization
            </h2>
            <div className="space-y-3">
              {utilizationData
                .filter(d => d.patients > 35)
                .map((doc, i) => (
                  <div key={i} className="p-3 bg-amber-50 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-medium">{doc.doctor}</p>
                      <p className="text-sm text-gray-600">{doc.patients} patients • {doc.avgTime?.toFixed(1)} min</p>
                    </div>
                    <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">Alert</span>
                  </div>
                ))}
              {utilizationData.filter(d => d.patients > 35).length === 0 && (
                <p className="text-gray-500 text-center py-4">No high utilization alerts</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Patients</h2>
              <button
                onClick={() => setShowPatientsModal(true)}
                className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Last Visit</th>
                    <th className="text-left py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.slice(0, 5).map((p, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{p.full_name}</td>
                      <td className="py-3">{p.lastVisit}</td>
                      <td className="py-3">{p.insurance || 'Cash'}</td>
                    </tr>
                  ))}
                  {recentPatients.length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">No recent patients</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today's Schedules – unchanged */}
        </div>
      </div>

      {/* Recent Activity – still mock */}

      {/* ─── Patients Modal ──────────────────────────────────────── */}
      {showPatientsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">All Recent Patients</h2>
              <button
                onClick={() => setShowPatientsModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Last Visit</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPatients.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-4 font-medium">{p.full_name}</td>
                      <td className="px-4 py-4">{p.lastVisit}</td>
                      <td className="px-4 py-4">{p.insurance || 'Cash'}</td>
                    </tr>
                  ))}
                  {recentPatients.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t text-right">
              <button
                onClick={() => setShowPatientsModal(false)}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
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

export default ClinicAdminDashboard;