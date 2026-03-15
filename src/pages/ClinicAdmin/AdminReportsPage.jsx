// src/pages/AdminReportsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, AlertTriangle } from 'lucide-react';

const AdminReportsPage = ({ primaryColor = '#0d9488' }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [revRes, utilRes, auditRes] = await Promise.all([
        apiClient.get('/admin/reports/revenue'),
        apiClient.get('/admin/reports/utilization'),
        apiClient.get('/admin/reports/audits')
      ]);
      setRevenueData(revRes.data.data || []);
      setUtilizationData(utilRes.data.data || []);
      setAuditData(auditRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-[var(--primary-color)]">Clinic Reports</h1>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Revenue & Savings</h2>
          <button onClick={() => exportReport(revenueData, 'revenue_report')} className="flex gap-2 items-center text-gray-600">
            <Download size={18} /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#0d9488" />
            <Bar dataKey="savings" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Utilization Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Doctor Utilization</h2>
          <button onClick={() => exportReport(utilizationData, 'utilization_report')} className="flex gap-2 items-center text-gray-600">
            <Download size={18} /> Export
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={utilizationData}>
            <XAxis dataKey="doctor" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="utilization" fill="#6366f1" />
            <Bar dataKey="patients" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle size={20} /> Audit Trail
          </h2>
          <button onClick={() => exportReport(auditData, 'audit_report')} className="flex gap-2 items-center text-gray-600">
            <Download size={18} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditData.map((log, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 text-sm">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm">{log.user}</td>
                  <td className="px-6 py-4 text-sm">{log.action}</td>
                  <td className="px-6 py-4 text-sm">{JSON.stringify(log.changes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;