// src/components/DoctorComponents/AppointmentDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { X, User, Activity, Ruler, Weight, Calculator, HeartPulse, 
         AlertTriangle, Stethoscope, Ban, ActivitySquare, History, Loader2, ArrowRightLeft, Edit3 } from 'lucide-react';

const AppointmentDetailModal = ({
selectedAppt,
patientData,
patientHistory,
editableVitals,
setEditableVitals,
savingVitals,
handleSaveVitals,
patientLoading,
isToday,
isFuture,
getStatusBadge,
formatDate,
onClose,
onStartAppointment,
onReferPatient
}) => {
if (!selectedAppt) return null;

const [isEditingVitals, setIsEditingVitals] = useState(false);

// Debug: Log the selectedAppt to see what _id looks like
useEffect(() => {
    console.log("Selected Appointment Full Object:", selectedAppt);
    console.log("Selected Appointment _id:", selectedAppt?._id);
    console.log("Selected Appointment id:", selectedAppt?.id);
}, [selectedAppt]);

const handleEditClick = () => setIsEditingVitals(true);

const handleSaveClick = async () => {
    await handleSaveVitals();
    setIsEditingVitals(false);
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-teal-700 flex items-center gap-3">
            <User className="text-teal-600" />
            {selectedAppt.patient_name}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-10">
          {/* Patient Information */}
          <section>
            <h3 className="text-xl font-semibold text-teal-800 mb-5 flex items-center gap-3">
              <User size={24} className="text-teal-600" />
              Patient Information
            </h3>

            {patientLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-3" />
                <span>Loading patient details...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.patient_name || selectedAppt.patient_name || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">File Number</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.file_number || selectedAppt.file_number || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">EID</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.eid || selectedAppt.eid || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.phone || selectedAppt.phone || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">DOB</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.dob || selectedAppt.dob || '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</label>
                  <p className="font-medium text-gray-900">
                    {patientData?.gender || selectedAppt.gender || '—'}
                  </p>
                </div>
                {patientData?.address && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Address</label>
                    <p className="font-medium text-gray-900">{patientData.address}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Vitals Section with Edit / Save Toggle */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold text-teal-800 flex items-center gap-3">
                <Activity size={24} className="text-teal-600" />
                Vitals & Stats
              </h3>

              {!isEditingVitals ? (
                <button
                  onClick={handleEditClick}
                  className="px-5 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit Vitals
                </button>
              ) : (
                <button
                  onClick={handleSaveClick}
                  disabled={savingVitals}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Ruler size={20} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Height (cm)</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={editableVitals.height}
                  onChange={(e) => setEditableVitals(prev => ({ ...prev, height: e.target.value }))}
                  disabled={!isEditingVitals}
                  className={`w-full text-3xl font-bold text-gray-900 focus:outline-none bg-transparent border-b transition-colors ${
                    isEditingVitals ? 'border-teal-300 focus:border-teal-500' : 'border-transparent cursor-default'
                  }`}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Weight size={20} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">Weight (kg)</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={editableVitals.weight}
                  onChange={(e) => setEditableVitals(prev => ({ ...prev, weight: e.target.value }))}
                  disabled={!isEditingVitals}
                  className={`w-full text-3xl font-bold text-gray-900 focus:outline-none bg-transparent border-b transition-colors ${
                    isEditingVitals ? 'border-teal-300 focus:border-teal-500' : 'border-transparent cursor-default'
                  }`}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Calculator size={20} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">BMI</span>
                </div>
                {editableVitals.height && editableVitals.weight ? (
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
                        <p className="text-3xl font-bold text-gray-900">{bmi}</p>
                        <p className={`text-sm font-medium ${color}`}>{status}</p>
                      </>
                    );
                  })()
                ) : (
                  <p className="text-3xl font-bold text-gray-400">—</p>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <HeartPulse size={20} className="text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">BP (mmHg)</span>
                </div>
                <input
                  type="text"
                  placeholder="120/80"
                  value={editableVitals.blood_pressure}
                  onChange={(e) => setEditableVitals(prev => ({ ...prev, blood_pressure: e.target.value }))}
                  disabled={!isEditingVitals}
                  className={`w-full text-3xl font-bold text-gray-900 focus:outline-none bg-transparent border-b transition-colors ${
                    isEditingVitals ? 'border-teal-300 focus:border-teal-500' : 'border-transparent cursor-default'
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Chief Concerns & Medical History */}
          <section>
            <h3 className="text-xl font-semibold text-teal-800 mb-5 flex items-center gap-3">
              <AlertTriangle size={24} className="text-teal-600" />
              Chief Concerns & Medical History
            </h3>
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Stethoscope size={18} className="text-teal-600" />
                  Chief Complaints
                </h4>
                <p className="text-gray-800 whitespace-pre-line">
                  {selectedAppt.concerns || 'No concerns recorded for this visit.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Ban size={18} className="text-red-500" />
                    Known Allergies
                  </h4>
                  <p className="text-gray-800">
                    {selectedAppt.allergies || 'None reported'}
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <ActivitySquare size={18} className="text-amber-600" />
                    Chronic Conditions
                  </h4>
                  <p className="text-gray-800">
                    {selectedAppt.chronic_conditions || 'None reported'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Patient Appointment History */}
          <section>
            <h3 className="text-xl font-semibold text-teal-800 mb-5 flex items-center gap-3">
              <History size={24} className="text-teal-600" />
              Patient Appointment History
            </h3>

            {patientLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-teal-600 mr-3" />
                <span>Loading history...</span>
              </div>
            ) : patientHistory.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-600">
                No previous appointments found for this patient.
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {patientHistory.map((hist, index) => (
                  <div
                    key={index}
                    className={`border-l-4 pl-5 py-4 rounded-lg ${
                      isFuture(hist.date, hist.time) ? 'border-blue-500 bg-blue-50' :
                      isToday(hist.date) ? 'border-green-500 bg-green-50' :
                      'border-gray-400 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {formatDate(hist.date)} • {hist.time?.slice(0, 5) || '—:--'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {hist.visit_type || 'Consultation'} • {hist.provider_name || hist.doctor || '—'}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
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
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Complaint:</span> {hist.concerns}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            {isFuture(selectedAppt.date, selectedAppt.time) && (
              <button
                onClick={onStartAppointment}
                className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 transition-colors min-w-[160px]"
              >
                Start Appointment
              </button>
            )}

            <button
              onClick={onReferPatient}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[160px]"
            >
              <ArrowRightLeft size={18} />
              Refer This Patient
            </button>

            {isFuture(selectedAppt.date, selectedAppt.time) ? (
              <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-lg font-medium hover:bg-teal-50 transition-colors min-w-[160px]">
                Reschedule
              </button>
            ) : (
              <button className="flex-1 bg-orange-50 text-orange-700 border border-orange-200 py-3 px-6 rounded-lg font-medium hover:bg-orange-100 transition-colors min-w-[160px]">
                Recall Patient
              </button>
            )}

            <button className="flex-1 border border-teal-200 text-teal-700 py-3 px-6 rounded-lg font-medium hover:bg-teal-50 transition-colors min-w-[160px]">
              Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;