// src/pages/EncounterDocumentation.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Mic, MicOff, Save, AlertTriangle, Clock, Pause, Play, 
  AlertCircle, StopCircle, User, Heart, Check, PlayCircle, 
  FileEdit, Lock, FileText, Download 
} from 'lucide-react';
import ConsultationTimer from '../../components/DoctorComponents/ConsultationTimer';

const API_CORE_URL = import.meta.env.VITE_API_CORE_URL || 'http://127.0.0.1:5001';
const apiClient = axios.create({ baseURL: API_CORE_URL });

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
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
  const mode          = params.get('mode') || 'new';

  const [soap, setSoap] = useState({ 
    subjective: '', 
    objective: '', 
    assessment: '', 
    plan: '' 
  });
  
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [consultationStart, setConsultationStart] = useState(null);
  const [consultationDuration, setConsultationDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const [aiSuggestions, setAiSuggestions] = useState({ icd: [], meds: [], notes: '', cpt: [] });
  const [generatedReport, setGeneratedReport] = useState(null);

  const [patientInfo, setPatientInfo] = useState(null);
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [existingDocumentation, setExistingDocumentation] = useState(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const [isEditMode, setIsEditMode] = useState(mode === 'edit');

  const [editableVitals, setEditableVitals] = useState({
    height: '', weight: '', blood_pressure: ''
  });
  const [savingVitals, setSavingVitals] = useState(false);
  const [vitalsEdited, setVitalsEdited] = useState(false);

  // Validation for mandatory SOAP fields
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    setConsultationStart(new Date().toISOString());
  }, []);

  // Fetch Patient & Appointment Context
  useEffect(() => {
    if (!appointmentId) return;

    const fetchContext = async () => {
      setLoadingContext(true);
      try {
        let patientData = {};
        if (patientId) {
          const patientRes = await apiBaseClient.get(`/doctor/patient/${patientId}`);
          patientData = patientRes.data?.data || patientRes.data || {};
        }

        const apptRes = await apiBaseClient.get(`/doctor/appointments/history?provider=Dr. Test OP Doctor`);
        const appts = apptRes.data?.data || apptRes.data || [];

        const currentAppt = appts.find(a => 
          String(a._id || a.id) === appointmentId || 
          String(a.patient_id || a.patientId) === patientId
        );

        setAppointmentInfo(currentAppt || {});
        setPatientInfo(patientData);

        if (currentAppt) {
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

  // Load Existing Documentation for Edit Mode
  useEffect(() => {
    if (mode !== 'edit' || !appointmentId) return;

    const loadExistingDoc = async () => {
      try {
        const res = await apiBaseClient.get(`/doctor/encounter/${appointmentId}`);
        const doc = res.data?.data || res.data || {};

        setExistingDocumentation(doc);
        setSoap({
          subjective: doc.subjective || '',
          objective: doc.objective || '',
          assessment: doc.assessment || '',
          plan: doc.plan || ''
        });

        setAiSuggestions({
          icd: Array.isArray(doc.icd_codes) ? doc.icd_codes : [],
          meds: Array.isArray(doc.medications) ? doc.medications : [],
          notes: doc.additional_notes || '',
          cpt: Array.isArray(doc.cpt_codes) ? doc.cpt_codes : []
        });

        setTranscript(Array.isArray(doc.transcript) ? doc.transcript : []);
        setConsultationDuration(doc.duration_seconds || 0);
      } catch (err) {
        console.error('Failed to load existing documentation:', err);
        setError('Could not load previous documentation.');
      }
    };

    loadExistingDoc();
  }, [appointmentId, mode]);

  // Speech Recognition - "Person" + Latest on top
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
        setTranscript(prev => [{
          speaker: 'Person',
          text: final.trim(),
          timestamp: new Date().toISOString()
        }, ...prev]); // Latest on top
      }
    };

    recognition.onerror = () => setIsListening(false);

    if (isListening && !isPaused) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [isListening, isPaused]);

  const toggleListening = () => setIsListening(p => !p);
  const togglePause = () => setIsPaused(p => !p);

  const stopTimer = () => { setIsTimerRunning(false); setIsTimerPaused(true); };
  const resumeTimer = () => { setIsTimerRunning(true); setIsTimerPaused(false); };
  const resetAndStartTimer = () => {
    setConsultationStart(new Date().toISOString());
    setConsultationDuration(0);
    setIsTimerRunning(true);
    setIsTimerPaused(false);
  };

  // Process with AI (RESTORED)
  const processWithAI = async () => {
    if (transcript.length === 0) return alert("No transcription available to process.");
    
    setProcessingAI(true);
    setError(null);

    try {
      const res = await apiClient.post('/process_text_encounter', {
        text_log: transcript,
        specialty: 'GENERAL_PRACTICE',
        clinical_context: {
          chief_complaint: appointmentInfo?.concerns || '',
          vitals: editableVitals,
          allergies: appointmentInfo?.allergies || 'None',
          chronic_conditions: appointmentInfo?.chronic_conditions || 'None',
        }
      });

      if (res.data.status === 'success') {
        const { soap_note, coding, suggestions } = res.data;

        setSoap({
          subjective: soap_note?.subjective?.hpi || soap_note?.subjective?.cc || soap.subjective,
          objective: soap_note?.objective?.exam || 
                     (soap_note?.objective?.vitals ? `BP: ${soap_note.objective.vitals.bp || '—'}` : soap.objective),
          assessment: Array.isArray(soap_note?.assessment?.icd_codes) 
                      ? soap_note.assessment.icd_codes.join(', ') 
                      : soap.assessment,
          plan: Array.isArray(soap_note?.plan?.meds) 
                ? soap_note.plan.meds.join('\n') 
                : soap.plan
        });

        setAiSuggestions({
          icd: Array.isArray(coding?.suggested_icd) ? coding.suggested_icd : [],
          meds: Array.isArray(soap_note?.plan?.meds) ? soap_note.plan.meds : 
                (Array.isArray(suggestions?.suggested_medications) ? suggestions.suggested_medications : []),
          notes: suggestions?.notes || '',
          cpt: Array.isArray(coding?.suggested_cpt) ? coding.suggested_cpt : []
        });

        alert('✅ AI processing completed successfully!');
      } else {
        setError(res.data.message || 'AI processing failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'AI processing error');
    } finally {
      setProcessingAI(false);
    }
  };

  // Validate mandatory SOAP fields
  const validateSoap = () => {
    const errors = {};
    if (!soap.subjective?.trim()) errors.subjective = "Subjective (Chief Complaint / HPI) is required";
    if (!soap.objective?.trim()) errors.objective = "Objective findings are required";
    if (!soap.assessment?.trim()) errors.assessment = "Assessment / Diagnosis is required";
    if (!soap.plan?.trim()) errors.plan = "Plan (Treatment / Follow-up) is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate Report on Clinic Letterhead
  const generateReportOnLetterhead = async () => {
    if (!appointmentId) return alert('No appointment ID');
    if (!validateSoap()) {
      alert('Please fill all mandatory SOAP fields before generating the report.');
      return;
    }

    setGeneratingReport(true);
    setError(null);

    try {
      const payload = {
        subjective: soap.subjective.trim(),
        objective: soap.objective.trim(),
        assessment: soap.assessment.trim(),
        plan: soap.plan.trim(),
        vitals: editableVitals,
        patient_info: {
          name: patientName,
          age: patientInfo?.age || '',
          gender: patientInfo?.gender || '',
          file_number: patientInfo?.file_number || ''
        },
        encounter_id: appointmentId,
        appointment_id: appointmentId
      };

      const res = await apiBaseClient.post('/doctor/generate-report-on-letterhead', payload);

      if (res.data.success) {
        setGeneratedReport(res.data.report_meta);
        alert('✅ Medical Report generated successfully on clinic letterhead!');
      } else {
        setError(res.data.message || 'Report generation failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Save Encounter
  const handleSave = async () => {
    if (!confirmed) return alert('Please confirm before saving.');
    if (!appointmentId) return alert('No appointment ID.');

    if (!validateSoap()) {
      alert('All SOAP fields (Subjective, Objective, Assessment, Plan) are mandatory.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      appointment_id: appointmentId,
      patient_id: patientId || 'unknown',
      doctor_id: '69b3ec8ded88d9b8d11ec753',
      subjective: soap.subjective.trim(),
      objective: soap.objective.trim(),
      assessment: soap.assessment.trim(),
      plan: soap.plan.trim(),
      icd_codes: aiSuggestions.icd,
      medications: aiSuggestions.meds,
      cpt_codes: aiSuggestions.cpt,
      additional_notes: aiSuggestions.notes,
      duration_seconds: consultationDuration,
      transcript: transcript,
      report_meta: generatedReport,
      edit_reason: isEditMode ? 'Doctor edit within 24 hours' : null,
      last_saved_at: new Date().toISOString()
    };

    try {
      let res;
      if (isEditMode) {
        res = await apiBaseClient.put(`/doctor/encounter/${appointmentId}`, payload);
      } else {
        res = await apiBaseClient.post('/doctor/encounter/save', payload);
      }

      if (res.data.status === 'success' || res.status === 201) {
        alert(`✅ Documentation ${isEditMode ? 'Updated' : 'Saved'} successfully!`);
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

  const handleTimerStop = (seconds) => setConsultationDuration(seconds);

  // Add this function inside EncounterDocumentation component
  const handleDownloadGeneratedReport = async () => {
    if (!generatedReport?.report_id) {
      alert('No report available to download.');
      return;
    }
  
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    const downloadUrl = `${baseURL}/doctor/download-report/${generatedReport.report_id}`;
  
    try {
      const response = await fetch(downloadUrl, { method: 'GET' });
  
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedReport.filename || `report_${generatedReport.report_id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
  
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 150);
    } catch (err) {
      console.error('Report download error:', err);
      alert('Failed to download the report. Please try again.');
    }
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
            <div className="flex items-center gap-3">
              {isEditMode ? <FileEdit size={32} /> : <User size={32} />}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {isEditMode ? 'Edit Encounter Documentation' : 'Encounter Documentation'}
                </h1>
                <p className="mt-1 opacity-90">
                  {patientName} • {visitType} • {formatDateDDMMYYYY(apptDate)} {apptTime}
                </p>
              </div>
            </div>

            {!isEditMode && consultationStart && (
              <div className="flex items-center gap-4">
                <ConsultationTimer startTime={consultationStart} onStop={handleTimerStop} isRunning={isTimerRunning} />
                <button 
                  onClick={isTimerRunning ? stopTimer : resumeTimer} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isTimerRunning ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                >
                  {isTimerRunning ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                  {isTimerRunning ? 'Stop Timer' : 'Resume Timer'}
                </button>
                <button onClick={resetAndStartTimer} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-gray-700">
                  Reset Timer
                </button>
              </div>
            )}

            {isEditMode && (
              <div className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <Lock size={18} /> Editing Previous Documentation (Audit Trail Active)
              </div>
            )}
          </div>
        </div>

        {/* Patient Context */}
        <div className="px-8 pt-6 border-b pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <User className="text-teal-600" size={26} />
              <h2 className="text-2xl font-semibold text-gray-800">Patient Context</h2>
            </div>
            {loadingContext && <div className="animate-spin h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full" />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-teal-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-teal-600" size={22} />
                  <span className="font-semibold text-lg text-teal-800">Vitals (Editable)</span>
                </div>
                {vitalsEdited && (
                  <button onClick={handleSaveVitals} disabled={savingVitals} className="flex items-center gap-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg disabled:opacity-50">
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

            <div className="lg:col-span-7 bg-red-50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-600" size={22} />
                <span className="font-semibold text-red-800">Allergies</span>
              </div>
              <p className="text-red-700">{getField('allergies', 'No known allergies')}</p>
            </div>

            <div className="lg:col-span-12 bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-amber-600" size={22} />
                <span className="font-semibold text-amber-800">Chief Complaint / Concerns</span>
              </div>
              <p className="text-amber-800 text-base font-medium">
                {getField('concerns') || getField('chief_complaint') || getField('notes', 'No complaint recorded for this appointment')}
              </p>
            </div>

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
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              onClick={toggleListening} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${isListening ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Stop Dictation' : 'Start Dictation'}
            </button>

            <button 
              onClick={togglePause} 
              className={`px-4 py-2 rounded-lg border font-medium transition-colors flex items-center gap-2 ${isPaused ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button 
              onClick={processWithAI} 
              disabled={processingAI || transcript.length === 0} 
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${processingAI || transcript.length === 0 ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
            >
              {processingAI ? <>Processing AI...</> : <><Clock size={18} /> Process with AI</>}
            </button>

            <button 
              onClick={generateReportOnLetterhead}
              disabled={generatingReport}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${generatingReport ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              {generatingReport ? <>Generating on Letterhead...</> : <><FileText size={18} /> Generate Report on Letterhead</>}
            </button>
          </div>
        </div>

        {/* Transcription Log - Latest on top, Speaker = "Person" */}
        <div className="mx-8 mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6 max-h-80 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Transcription Log ({transcript.length} entries)
          </h3>
          {transcript.length === 0 ? (
            <p className="text-center text-gray-500 italic">No transcription yet. Start dictation to begin.</p>
          ) : (
            <div className="space-y-3">
              {transcript.map((item, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">{item.speaker}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-800 leading-relaxed">{item.text}</p>
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

        {/* SOAP Form - Mandatory Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subjective <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={soap.subjective} 
                onChange={e => {
                  setSoap(prev => ({ ...prev, subjective: e.target.value }));
                  if (validationErrors.subjective) setValidationErrors(prev => ({ ...prev, subjective: '' }));
                }} 
                className={`w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-y text-sm ${validationErrors.subjective ? 'border-red-500' : 'border-gray-300'}`} 
                placeholder="Chief complaint, History of Present Illness..." 
              />
              {validationErrors.subjective && <p className="text-red-500 text-xs mt-1">{validationErrors.subjective}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Objective <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={soap.objective} 
                onChange={e => {
                  setSoap(prev => ({ ...prev, objective: e.target.value }));
                  if (validationErrors.objective) setValidationErrors(prev => ({ ...prev, objective: '' }));
                }} 
                className={`w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-y text-sm ${validationErrors.objective ? 'border-red-500' : 'border-gray-300'}`} 
                placeholder="Physical exam findings, vitals, lab results..." 
              />
              {validationErrors.objective && <p className="text-red-500 text-xs mt-1">{validationErrors.objective}</p>}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={soap.assessment} 
                onChange={e => {
                  setSoap(prev => ({ ...prev, assessment: e.target.value }));
                  if (validationErrors.assessment) setValidationErrors(prev => ({ ...prev, assessment: '' }));
                }} 
                className={`w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-y text-sm ${validationErrors.assessment ? 'border-red-500' : 'border-gray-300'}`} 
                placeholder="Diagnosis, ICD codes, differential diagnosis..." 
              />
              {validationErrors.assessment && <p className="text-red-500 text-xs mt-1">{validationErrors.assessment}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={soap.plan} 
                onChange={e => {
                  setSoap(prev => ({ ...prev, plan: e.target.value }));
                  if (validationErrors.plan) setValidationErrors(prev => ({ ...prev, plan: '' }));
                }} 
                className={`w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 resize-y text-sm ${validationErrors.plan ? 'border-red-500' : 'border-gray-300'}`} 
                placeholder="Medications, CPT codes, follow-up plan, patient instructions..." 
              />
              {validationErrors.plan && <p className="text-red-500 text-xs mt-1">{validationErrors.plan}</p>}
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
              <h4 className="font-medium text-blue-700 mb-2">Notes / CPT</h4>
              <p className="bg-white bg-opacity-60 px-3 py-2 rounded whitespace-pre-wrap">
                {aiSuggestions.notes || '—'}<br/>
                {aiSuggestions.cpt.length > 0 && `CPT: ${aiSuggestions.cpt.join(', ')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Generated Report Preview */}
        {generatedReport && (
          <div className="mx-8 mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
              <FileText size={20} /> Report Generated on Clinic Letterhead
            </h3>
            <p className="text-sm text-emerald-700 mb-4">
              International standard medical report rendered on official clinic letterhead.
            </p>
            
            <button
              onClick={handleDownloadGeneratedReport}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download size={18} /> Download Final PDF Report
            </button>
          </div>
        )}

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
              I have reviewed the AI output and the generated letterhead report. 
              I confirm accuracy and accept full clinical responsibility.
              {isEditMode && " (This edit will be logged in the audit trail.)"}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button onClick={() => window.close()} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !confirmed}
              className={`px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors ${saving || !confirmed ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
            >
              {saving ? <>Saving to EMR...</> : <><Save size={18} /> {isEditMode ? 'Update Documentation' : 'Save to EMR with Letterhead Report'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterDocumentation;