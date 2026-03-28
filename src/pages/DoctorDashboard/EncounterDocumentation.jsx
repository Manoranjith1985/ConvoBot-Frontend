// src/pages/EncounterDocumentation.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mic, MicOff, Save, AlertTriangle, Clock, Pause, Play, 
  AlertCircle, StopCircle, User, Heart, Check, PlayCircle 
} from 'lucide-react';
import ConsultationTimer from '../../components/DoctorComponents/ConsultationTimer';

const API_CORE_URL = import.meta.env.VITE_API_CORE_URL || 'http://127.0.0.1:5001';
const apiClient = axios.create({ baseURL: API_CORE_URL });

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
const apiBaseClient = axios.create({ baseURL: API_BASE_URL });

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const EncounterDocumentation = () => {
  const params = new URLSearchParams(window.location.search);
  const appointmentId = params.get('appointment_id') || params.get('apptId') || '';
  const patientId     = params.get('patient_id') || '';
  const patientName   = params.get('patient') || 'Unknown Patient';
  const apptDate      = params.get('date') || new Date().toISOString().split('T')[0];
  const apptTime      = params.get('time') || '—';
  const visitType     = params.get('type') || 'Consultation';

  const [soap, setSoap] = useState({ subjective: '', objective: '', assessment: '', plan: '' });
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [consultationStart, setConsultationStart] = useState(null);
  const [consultationDuration, setConsultationDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Timer Controls
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);   // NEW: Separate pause state for restart

  const [aiSuggestions, setAiSuggestions] = useState({ icd: [], meds: [], notes: '' });

  // Patient + Appointment Context
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);

  const [editableVitals, setEditableVitals] = useState({
    height: '', weight: '', blood_pressure: ''
  });
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalsEdited, setVitalsEdited] = useState(false);

  useEffect(() => {
    setConsultationStart(new Date().toISOString());
  }, []);

  // Fetch Context (unchanged)
  useEffect(() => {
    if (!patientId || !appointmentId) return;

    const fetchContext = async () => {
      setLoadingContext(true);
      try {
        const [patientRes, apptRes] = await Promise.all([
          apiBaseClient.get(`/doctor/patient/${patientId}`),
          apiBaseClient.get(`/doctor/appointments/history?provider=Dr. Test OP Doctor`)
        ]);

        const patientData = patientRes.data?.data || patientRes.data || {};
        setPatientInfo(patientData);

        const appts = apptRes.data?.data || apptRes.data || [];
        const currentAppt = appts.find(a => 
          String(a._id || a.id) === appointmentId || String(a.patient_id) === patientId
        );

        if (currentAppt) {
          setAppointmentInfo(currentAppt);
          setEditableVitals({
            height: currentAppt.height || patientData.height || '',
            weight: currentAppt.weight || patientData.weight || '',
            blood_pressure: currentAppt.blood_pressure || patientData.blood_pressure || ''
          });

          const complaint = currentAppt.concerns || currentAppt.chief_complaint || currentAppt.notes || '';
          if (complaint && !soap.subjective) {
            setSoap(prev => ({ ...prev, subjective: complaint }));
          }
        } else {
          setEditableVitals({
            height: patientData.height || '',
            weight: patientData.weight || '',
            blood_pressure: patientData.blood_pressure || ''
          });
        }
      } catch (err) {
        console.error('Failed to load context:', err);
        setError('Could not load full patient context.');
      } finally {
        setLoadingContext(false);
      }
    };

    fetchContext();
  }, [patientId, appointmentId]);

  // Speech Recognition (unchanged)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return console.warn('Speech Recognition not supported');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript + ' ';
      }
      if (final.trim()) {
        setTranscript(prev => [...prev, {
          speaker: 'Doctor',
          text: final.trim(),
          timestamp: new Date().toISOString()
        }]);
      }
    };

    recognition.onerror = () => setIsListening(false);

    if (isListening && !isPaused) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening, isPaused]);

  const toggleListening = () => setIsListening(p => !p);
  const togglePause = () => setIsPaused(p => !p);

  // Improved Timer Controls
  const stopTimer = () => {
    setIsTimerRunning(false);
    setIsTimerPaused(true);        // Mark as paused so we can resume
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const resetAndStartTimer = () => {
    setConsultationStart(new Date().toISOString());
    setConsultationDuration(0);
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  const processWithAI = async () => { 
    if (transcript.length === 0) return;
    setProcessingAI(true);
    setError(null);

    const clinicalContext = {
      chief_complaint: getField('concerns') || getField('chief_complaint') || '',
      vitals: { height: editableVitals.height, weight: editableVitals.weight, blood_pressure: editableVitals.blood_pressure },
      allergies: getField('allergies', 'None'),
      chronic_conditions: getField('chronic_conditions', 'None'),
      concerns: getField('concerns', '')
    };

    try {
      const res = await apiClient.post('/process_text_encounter', {
        text_log: transcript,
        specialty: 'GENERAL_PRACTICE',
        clinical_context: clinicalContext
      });

      if (res.data.status === 'success') {
        const { soap_note, coding, suggestions } = res.data;
        setSoap({
          subjective: soap_note?.subjective || soap.subjective,
          objective: soap_note?.objective || '',
          assessment: soap_note?.assessment || '',
          plan: soap_note?.plan || ''
        });
        setAiSuggestions({
          icd: coding?.suggested_icd || [],
          meds: suggestions?.suggested_medications || suggestions?.meds || [],
          notes: suggestions?.notes || ''
        });
      } else {
        setError(res.data.message || 'AI processing failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Connection error');
    } finally {
      setProcessingAI(false);
    }
  };

  const handleSave = async () => { 
    if (!confirmed) return alert('Please confirm before saving.');
    if (!appointmentId) return alert('No appointment ID. Cannot save.');

    setSaving(true);
    setError(null);
    try {
      const res = await apiBaseClient.post('/doctor/encounter/save', {
        appointment_id: appointmentId,
        patient_id: patientId || 'unknown',
        doctor_id: '69b3ec8ded88d9b8d11ec753',
        subjective: soap.subjective.trim(),
        objective: soap.objective.trim(),
        assessment: soap.assessment.trim(),
        plan: soap.plan.trim(),
        icd_codes: aiSuggestions.icd,
        medications: aiSuggestions.meds,
        additional_notes: aiSuggestions.notes,
        duration_seconds: consultationDuration
      });

      if (res.data.status === 'success') {
        alert(`Saved (version ${res.data.data?.version || '?'})`);
        stopTimer();
        window.close();
      } else {
        setError(res.data.message || 'Save failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save error');
    } finally {
      setSaving(false);
    }
  };

  const handleTimerStop = (seconds) => {
    setConsultationDuration(seconds);
  };

  const handleSaveVitals = async () => {
    if (!appointmentId) return alert('No appointment ID');
    setSavingVitals(true);
    try {
      await apiBaseClient.patch(`/doctor/appointments/${appointmentId}/vitals`, {
        height: parseFloat(editableVitals.height) || null,
        weight: parseFloat(editableVitals.weight) || null,
        blood_pressure: editableVitals.blood_pressure || null
      });
      setVitalsEdited(false);
      alert('✅ Vitals updated successfully!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to save vitals');
    } finally {
      setSavingVitals(false);
    }
  };

  const updateVital = (field, value) => {
    setEditableVitals(prev => ({ ...prev, [field]: value }));
    setVitalsEdited(true);
  };

  const getField = (field, fallback = '—') => {
    return appointmentInfo?.[field] || patientInfo?.[field] || fallback;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-teal-700 text-white px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Encounter Documentation</h1>
              <p className="mt-2 opacity-90">
                {patientName} • {visitType} • {formatDateDDMMYYYY(apptDate)} {apptTime}
              </p>
            </div>
            {consultationStart && (
              <div className="flex items-center gap-4">
                <ConsultationTimer 
                  startTime={consultationStart} 
                  onStop={handleTimerStop} 
                  isRunning={isTimerRunning} 
                />
                
                {/* Improved Timer Button */}
                <button
                  onClick={isTimerRunning ? stopTimer : resumeTimer}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isTimerRunning 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <StopCircle size={18} /> Stop Timer
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} /> Resume Timer
                    </>
                  )}
                </button>

                {/* Optional: Full Reset Button */}
                <button
                  onClick={resetAndStartTimer}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-gray-700"
                >
                  Reset Timer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patient Context - Now includes Complaint from Appointment */}
        <div className="px-8 pt-6 border-b pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="text-teal-600" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">Patient Context</h2>
            </div>
            {loadingContext && <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Editable Vitals */}
            <div className="lg:col-span-5 bg-white border border-teal-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-teal-600" size={22} />
                  <span className="font-semibold text-lg text-teal-800">Vitals (Editable)</span>
                </div>
                {vitalsEdited && (
                  <button
                    onClick={handleSaveVitals}
                    disabled={savingVitals}
                    className="flex items-center gap-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    {savingVitals ? 'Saving...' : <><Check size={16} /> Save</>}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Height (cm)</label>
                  <input type="number" value={editableVitals.height} onChange={e => updateVital('height', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Weight (kg)</label>
                  <input type="number" value={editableVitals.weight} onChange={e => updateVital('weight', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">BP</label>
                  <input type="text" value={editableVitals.blood_pressure} onChange={e => updateVital('blood_pressure', e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500" placeholder="120/80" />
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="lg:col-span-7 bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={22} />
                <span className="font-semibold text-red-800">Allergies</span>
              </div>
              <p className="text-red-700">{getField('allergies', 'No known allergies')}</p>
            </div>

            {/* Chief Complaint (from Appointment - FIXED) */}
            <div className="lg:col-span-12 bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
                <span className="font-semibold text-amber-800">Chief Complaint / Concerns</span>
              </div>
              <p className="text-amber-800 text-base font-medium">
                {getField('concerns') || getField('chief_complaint') || getField('notes', 'No complaint recorded for this appointment')}
              </p>
            </div>

            {/* Chronic Conditions */}
            <div className="lg:col-span-12 bg-purple-50 border border-purple-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="text-purple-600" size={22} />
                <span className="font-semibold text-purple-800">Chronic Conditions</span>
              </div>
              <p className="text-purple-700">{getField('chronic_conditions', 'None recorded')}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-100 px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Stop Dictation' : 'Start Dictation'}
            </button>

            <button
              onClick={togglePause}
              className={`px-4 py-2 rounded-lg border font-medium transition-colors flex items-center gap-2 ${
                isPaused ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={processWithAI}
              disabled={processingAI || transcript.length === 0}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                processingAI || transcript.length === 0
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {processingAI ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Clock size={18} />
                  Process with AI
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {transcript.length > 0 && (
              <span>Last: {transcript[transcript.length - 1]?.text.substring(0, 60)}...</span>
            )}
          </div>
        </div>

        {/* Transcription Box */}
        <div className="mx-8 mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-60 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcription Log</h3>
          {transcript.length === 0 ? (
            <p className="text-center text-gray-500 italic">No transcription yet. Start dictation to begin.</p>
          ) : (
            <div className="space-y-3">
              {transcript.map((item, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{item.speaker}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-800">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mx-8 mt-6 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-amber-800">Important Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                This is an AI-assisted draft only. Please review thoroughly and edit as necessary.
                The final clinical responsibility remains with the treating physician.
              </p>
            </div>
          </div>
        </div>

        {/* SOAP Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subjective</label>
              <textarea
                value={soap.subjective}
                onChange={e => setSoap({ ...soap, subjective: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y text-sm"
                placeholder="Chief complaint, history of present illness, past history..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
              <textarea
                value={soap.objective}
                onChange={e => setSoap({ ...soap, objective: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y text-sm"
                placeholder="Vitals, physical exam, lab/imaging findings..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assessment</label>
              <textarea
                value={soap.assessment}
                onChange={e => setSoap({ ...soap, assessment: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y text-sm"
                placeholder="Diagnosis, differentials..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <textarea
                value={soap.plan}
                onChange={e => setSoap({ ...soap, plan: e.target.value })}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-y text-sm"
                placeholder="Treatment, follow-up, referrals..."
              />
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="mx-8 mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} /> AI Suggestions (Review Required)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Suggested ICD Codes</h4>
              <ul className="list-disc pl-5 space-y-1">
                {aiSuggestions.icd.map((code, i) => <li key={i}>{code}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Suggested Medications</h4>
              <ul className="list-disc pl-5 space-y-1">
                {aiSuggestions.meds.map((med, i) => <li key={i}>{med}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Notes</h4>
              <p className="bg-white bg-opacity-60 px-3 py-2 rounded">
                {aiSuggestions.notes}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation & Save */}
        <div className="mx-8 mb-10 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={e => setConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            />
            <label htmlFor="confirm" className="text-gray-700 cursor-pointer select-none">
              I have reviewed and confirm accuracy. Full responsibility accepted.
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => window.close()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !confirmed}
              className={`px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                saving || !confirmed ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save to EMR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterDocumentation;