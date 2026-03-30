// src/components/admin/AppointmentDetailModal.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  X, User, Activity, Ruler, Weight, Calculator, HeartPulse, 
  AlertTriangle, Stethoscope, Ban, ActivitySquare, History, Loader2, 
  ArrowRightLeft, FileEdit, AlertCircle, Edit3, FileText, Download 
} from 'lucide-react';
import DoctorReferPatientModal from './DoctorReferPatientModal';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
});

const AppointmentDetailModal = ({
  selectedAppt,
  patientData,
  patientHistory = [],
  editableVitals,
  setEditableVitals,
  savingVitals,
  handleSaveVitals,
  patientLoading,
  isToday,
  isFuture,
  getStatusBadge,
  formatDate,
  formatDOB,
  onClose,
  onStartAppointment,
  currentDoctorName = 'Dr. Test OP Doctor'
}) => {
  if (!selectedAppt) return null;

  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);

  // Documents state
  const [encounterDoc, setEncounterDoc] = useState(null);   // SOAP JSON
  const [reportMeta, setReportMeta] = useState(null);       // PDF report metadata
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Edit permission state
  const [docStatus, setDocStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Real 24-hour check
  const hasCompletedEncounter = !!selectedAppt.encounter_completed;
  
  const isWithin24Hours = () => {
    if (!hasCompletedEncounter) return false;
    const completed = new Date(selectedAppt.encounter_completed);
    const now = new Date();
    const hoursDiff = (now - completed) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  // Fetch documentation + permission status
  const fetchDocumentationStatus = async () => {
    if (!selectedAppt.id && !selectedAppt._id) return;
    
    const apptId = selectedAppt.id || selectedAppt._id;
    setLoadingStatus(true);

    try {
      const docRes = await apiClient.get(`/doctor/encounter/${apptId}`);
      const hasDocumentation = docRes.status === 200;

      const permRes = await apiClient.get(`/doctor/encounter/${apptId}/edit-permission-status`);
      const permData = permRes.data || {};

      setDocStatus({
        hasDocumentation,
        canEdit: isWithin24Hours() || permData.can_edit || false,
        permissionStatus: permData.status || 'none'
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setDocStatus({
          hasDocumentation: false,
          canEdit: false,
          permissionStatus: 'none'
        });
      } else {
        console.error('Failed to fetch documentation status', err);
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  // Fetch both Encounter Documentation (SOAP) and Report metadata
  const fetchDocuments = async () => {
    if (!selectedAppt.id && !selectedAppt._id) return;
    const apptId = selectedAppt.id || selectedAppt._id;
    setLoadingDocuments(true);

    try {
      const encRes = await apiClient.get(`/doctor/encounter/${apptId}`);
      if (encRes.data?.status === 'success') {
        setEncounterDoc(encRes.data.data);
      } else {
        setEncounterDoc(null);
      }
    } catch (e) {
      console.log('No encounter documentation found yet');
      setEncounterDoc(null);
    }

    try {
      const repRes = await apiClient.get(`/doctor/reports/${apptId}`);
      if (repRes.data?.status === 'success' && repRes.data.report_meta) {
        setReportMeta(repRes.data.report_meta);
      } else {
        setReportMeta(null);
      }
    } catch (e) {
      console.log('No report generated yet');
      setReportMeta(null);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocumentationStatus();
    fetchDocuments();
  }, [selectedAppt]);

  // Download Report (PDF)
  const handleDownloadReport = async () => {
    if (!reportMeta?.report_id) {
      alert('No report generated yet.\n\nPlease generate the report first from the Encounter Documentation.');
      return;
    }
  
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    const downloadUrl = `${baseURL}/doctor/download-report/${reportMeta.report_id}`;
  
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = reportMeta.filename || `medical_report_${reportMeta.report_id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 150);
  
      console.log('Report downloaded successfully');
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Download failed: ${err.message || 'Unknown error'}\n\nPlease check backend logs and try again.`);
    }
  };
  const handleEditDocumentation = () => {
    const width = 1200;
    const height = 900;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = `/encounter-documentation?appointment_id=${selectedAppt.id || selectedAppt._id}&patient=${encodeURIComponent(selectedAppt.patient_name || patientData?.patient_name || '')}&mode=edit`;

    window.open(
      url,
      'EncounterDoc',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  };

  const handleRequestEditPermission = async () => {
    if (!confirm('This documentation is locked (more than 24 hours old). Send edit permission request to admin?')) return;

    try {
      const apptId = selectedAppt.id || selectedAppt._id;
      await apiClient.post(`/doctor/encounter/request-edit/${apptId}`);
      alert('✅ Edit permission request sent to admin successfully');
      fetchDocumentationStatus();
    } catch (err) {
      alert('Failed to send edit permission request');
    }
  };

  const handleMainAction = () => {
    if (!docStatus) return;

    if (!docStatus.hasDocumentation) {
      onStartAppointment();
    } else if (docStatus.canEdit || docStatus.permissionStatus === 'approved') {
      handleEditDocumentation();
    } else {
      handleRequestEditPermission();
    }
  };

  const getMainButtonConfig = () => {
    if (!docStatus) {
      return { text: 'Loading...', color: 'bg-gray-400', disabled: true };
    }

    if (!docStatus.hasDocumentation) {
      return { text: 'Start Appointment', color: 'bg-teal-600 hover:bg-teal-700', disabled: false };
    }

    if (docStatus.canEdit || docStatus.permissionStatus === 'approved') {
      return { text: 'Edit Documentation', color: 'bg-purple-600 hover:bg-purple-700', disabled: false };
    }

    if (docStatus.permissionStatus === 'pending') {
      return { text: 'Edit Permission Requested', color: 'bg-amber-500', disabled: true };
    }

    return { text: 'Send Edit Permission', color: 'bg-amber-600 hover:bg-amber-700', disabled: false };
  };

  const buttonConfig = getMainButtonConfig();

  const getAppointmentStatus = () => {
    if (isFuture(selectedAppt.date, selectedAppt.time)) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (isToday(selectedAppt.date)) return { label: 'Today', color: 'bg-green-100 text-green-700' };
    if (hasCompletedEncounter) return { label: 'Completed', color: 'bg-purple-100 text-purple-700' };
    return { label: 'Past', color: 'bg-gray-100 text-gray-700' };
  };

  const statusInfo = getAppointmentStatus();

  const handleEditClick = () => setIsEditingVitals(true);
  const handleSaveClick = async () => {
    await handleSaveVitals();
    setIsEditingVitals(false);
  };

  const handleReferPatient = () => setShowReferModal(true);
  const handleReferralSuccess = () => {
    setShowReferModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <User className="text-teal-600" size={22} />
              <div>
                <h2 className="text-lg font-semibold text-teal-700">
                  {selectedAppt.patient_name || 'Appointment Details'}
                </h2>
                <div className={`inline-block px-3 py-0.5 text-xs font-medium rounded-full mt-1 ${statusInfo.color}`}>
                  {statusInfo.label}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-7">
            
            {/* Patient Information */}
            <section>
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-teal-600" />
                Patient Information
              </h3>
              {patientLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-teal-600 mr-3" />
                  <span className="text-sm text-gray-600">Loading patient details...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Full Name</label>
                    <p className="font-medium text-gray-900">
                      {patientData?.patient_name || selectedAppt.patient_name || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">File Number</label>
                    <p className="font-medium text-gray-900">
                      {patientData?.file_number || selectedAppt.file_number || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Phone</label>
                    <p className="font-medium text-gray-900">
                      {patientData?.phone || selectedAppt.phone || '—'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">DOB</label>
                    <p className="font-medium text-gray-900">
                      {formatDOB(patientData?.dob || patientData?.date_of_birth || selectedAppt?.dob)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Gender</label>
                    <p className="font-medium text-gray-900">
                      {patientData?.gender || selectedAppt.gender || '—'}
                    </p>
                  </div>
                  {(patientData?.address || selectedAppt?.address) && (
                    <div className="md:col-span-3">
                      <label className="block text-xs text-gray-500 mb-0.5">Address</label>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">
                        {patientData?.address || selectedAppt?.address}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Vitals Section - unchanged */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
                  <Activity size={20} className="text-teal-600" />
                  Vitals & Stats
                </h3>
                {!isEditingVitals ? (
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-1.5 bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 size={15} /> Edit Vitals
                  </button>
                ) : (
                  <button
                    onClick={handleSaveClick}
                    disabled={savingVitals}
                    className="px-5 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {savingVitals ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Height, Weight, BMI, BP inputs - unchanged */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Ruler size={17} className="text-teal-600" />
                      <span className="text-xs font-medium text-gray-600">Height (cm)</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={editableVitals?.height || ''}
                      onChange={(e) => setEditableVitals(prev => ({ ...prev, height: e.target.value }))}
                      disabled={!isEditingVitals}
                      className={`w-full text-2xl font-bold text-gray-900 focus:outline-none bg-transparent border-b transition-colors ${
                        isEditingVitals ? 'border-teal-300 focus:border-teal-500' : 'border-transparent cursor-default'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Weight size={17} className="text-teal-600" />
                      <span className="text-xs font-medium text-gray-600">Weight (kg)</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={editableVitals?.weight || ''}
                      onChange={(e) => setEditableVitals(prev => ({ ...prev, weight: e.target.value }))}
                      disabled={!isEditingVitals}
                      className={`w-full text-2xl font-bold text-gray-900 focus:outline-none bg-transparent border-b transition-colors ${
                        isEditingVitals ? 'border-teal-300 focus:border-teal-500' : 'border-transparent cursor-default'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Calculator size={17} className="text-teal-600" />
                      <span className="text-xs font-medium text-gray-600">BMI</span>
                    </div>
                    {editableVitals?.height && editableVitals?.weight ? (
                      (() => {
                        const h = parseFloat(editableVitals.height) / 100;
                        const w = parseFloat(editableVitals.weight);
                        const bmi = (w / (h * h)).toFixed(1);
                        let status = 'Normal';
                        let color = 'text-green-600';
                        if (bmi < 18.5) { status = 'Underweight'; color = 'text-orange-600'; }
                        else if (bmi >= 25 && bmi < 30) { status = 'Overweight'; color = 'text-amber-600'; }
                        else if (bmi >= 30) { status = 'Obese'; color = 'text-red-600'; }
                        return (
                          <>
                            <p className="text-2xl font-bold text-gray-900">{bmi}</p>
                            <p className={`text-xs font-medium ${color}`}>{status}</p>
                          </>
                        );
                      })()
                    ) : (
                      <p className="text-2xl font-bold text-gray-400">—</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <HeartPulse size={17} className="text-teal-600" />
                      <span className="text-xs font-medium text-gray-600">BP (mmHg)</span>
                    </div>
                    {!isEditingVitals ? (
                      <p className="text-2xl font-bold text-gray-900">
                        {editableVitals?.blood_pressure || '—'}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          placeholder="120"
                          value={editableVitals?.bp_systolic || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditableVitals(prev => ({
                              ...prev,
                              bp_systolic: val,
                              blood_pressure: val && prev.bp_diastolic ? `${val}/${prev.bp_diastolic}` : val
                            }));
                          }}
                          className="w-16 text-2xl font-bold text-gray-900 focus:outline-none bg-transparent border-b border-teal-300 focus:border-teal-500 text-center"
                        />
                        <span className="text-2xl font-light text-gray-400">/</span>
                        <input
                          type="number"
                          placeholder="80"
                          value={editableVitals?.bp_diastolic || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditableVitals(prev => ({
                              ...prev,
                              bp_diastolic: val,
                              blood_pressure: prev.bp_systolic && val ? `${prev.bp_systolic}/${val}` : val
                            }));
                          }}
                          className="w-16 text-2xl font-bold text-gray-900 focus:outline-none bg-transparent border-b border-teal-300 focus:border-teal-500 text-center"
                        />
                        <span className="text-xs text-gray-500 ml-1">mmHg</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Chief Concerns & Medical History - unchanged */}
            <section>
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-teal-600" />
                Chief Concerns & Medical History
              </h3>
              <div className="space-y-5 text-sm">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Stethoscope size={17} className="text-teal-600" />
                    Chief Complaints
                  </h4>
                  <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                    {selectedAppt.concerns || 'No concerns recorded for this visit.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Ban size={17} className="text-red-500" />
                      Known Allergies
                    </h4>
                    <p className="text-gray-800">{selectedAppt.allergies || 'None reported'}</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <ActivitySquare size={17} className="text-amber-600" />
                      Chronic Conditions
                    </h4>
                    <p className="text-gray-800">{selectedAppt.chronic_conditions || 'None reported'}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Patient Appointment History - unchanged */}
            <section>
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <History size={20} className="text-teal-600" />
                Patient Appointment History
              </h3>
              {patientLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-teal-600 mr-3" />
                  <span className="text-sm text-gray-600">Loading history...</span>
                </div>
              ) : patientHistory.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
                  No previous appointments found for this patient.
                </div>
              ) : (
                <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                  {patientHistory.map((hist, index) => (
                    <div
                      key={`${hist._id || hist.id || index}-${hist.date}-${hist.time}`}
                      className={`border-l-4 pl-5 py-4 rounded-lg text-sm ${
                        isFuture(hist.date, hist.time) ? 'border-blue-500 bg-blue-50' :
                        isToday(hist.date) ? 'border-green-500 bg-green-50' :
                        'border-gray-400 bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(hist.date)} • {hist.time?.slice(0, 5) || '—:--'}
                          </p>
                          <p className="text-gray-600 mt-0.5">
                            {hist.visit_type || 'Consultation'} • {hist.provider_name || hist.doctor || '—'}
                          </p>
                        </div>
                        <span
                          className="px-3 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusBadge(hist).bg,
                            color: getStatusBadge(hist).text,
                          }}
                        >
                          {hist.status || 'Booked'}
                        </span>
                      </div>
                      {hist.concerns && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-700">
                            <span className="font-medium">Complaint:</span> {hist.concerns}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* DOCUMENTS SECTION */}
            <section>
              <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-teal-600" />
                Documents & Reports
                {loadingDocuments && <Loader2 className="animate-spin h-5 w-5 ml-2" />}
              </h3>

              <div className="flex flex-col gap-3">
                {/* Encounter Documentation Button */}
                <button
                  onClick={handleEditDocumentation}
                  disabled={!encounterDoc}
                  className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all text-left
                    ${encounterDoc 
                      ? 'border-teal-200 hover:bg-teal-50 text-teal-700' 
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <FileEdit size={20} />
                    <div>
                      <p className="font-medium">Encounter Documentation (SOAP)</p>
                      <p className="text-xs text-gray-500">
                        {encounterDoc ? 'SOAP notes saved • Click to edit' : 'Not created yet'}
                      </p>
                    </div>
                  </div>
                  <span className="text-teal-600 text-sm font-medium">View / Edit →</span>
                </button>

                {/* Generated Report Button */}
                <button
                  onClick={handleDownloadReport}
                  disabled={!reportMeta}
                  className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all text-left
                    ${reportMeta 
                      ? 'border-emerald-200 hover:bg-emerald-50 text-emerald-700' 
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3">
                    <Download size={20} />
                    <div>
                      <p className="font-medium">Generated Report on Letterhead (PDF)</p>
                      <p className="text-xs text-gray-500">
                        {reportMeta 
                          ? `Generated ${new Date(reportMeta.generated_at).toLocaleDateString('en-GB')}` 
                          : 'Not generated yet'}
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-600 text-sm font-medium">
                    {reportMeta ? 'Download PDF →' : 'Generate First'}
                  </span>
                </button>
              </div>
            </section>

            {/* SINGLE MAIN ACTION BUTTON */}
            <div className="flex flex-wrap gap-3 pt-6 border-t">
              <button
                onClick={handleMainAction}
                disabled={buttonConfig.disabled || loadingStatus}
                className={`flex-1 py-3 px-6 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all text-sm min-h-[52px] ${buttonConfig.color} ${buttonConfig.disabled ? 'opacity-75 cursor-not-allowed' : 'hover:brightness-105'}`}
              >
                {buttonConfig.text}
                {loadingStatus && <Loader2 className="animate-spin h-4 w-4 ml-2" />}
              </button>

              <button
                onClick={handleReferPatient}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-2xl font-medium hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2 min-h-[52px]"
              >
                <ArrowRightLeft size={16} />
                Refer Patient
              </button>

              {isFuture(selectedAppt.date, selectedAppt.time) ? (
                <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-2xl font-medium hover:bg-teal-50 transition-colors text-sm min-h-[52px]">
                  Reschedule
                </button>
              ) : (
                <button className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 py-3 px-6 rounded-2xl font-medium hover:bg-orange-100 transition-colors text-sm min-h-[52px]">
                  Recall Patient
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Referral Modal */}
      <DoctorReferPatientModal
        isOpen={showReferModal}
        onClose={() => setShowReferModal(false)}
        appointment={selectedAppt}
        patientData={patientData}
        currentDoctorName={currentDoctorName}
        onReferralSuccess={handleReferralSuccess}
      />
    </>
  );
};

export default AppointmentDetailModal;