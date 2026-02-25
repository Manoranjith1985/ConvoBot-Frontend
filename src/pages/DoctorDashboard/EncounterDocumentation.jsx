// src/pages/EncounterDocumentation.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, MicOff, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.CORE_VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const apiClient = axios.create({ baseURL: API_BASE_URL });

const EncounterDocumentation = () => {
  // Query params from Schedule page
  const params = new URLSearchParams(window.location.search);
  const patient = params.get('patient') || 'Unknown Patient';
  const date = params.get('date') || new Date().toISOString().split('T')[0];
  const time = params.get('time') || '--:--';
  const type = params.get('type') || 'Consultation';

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);           // array of {speaker, text}
  const [soapNote, setSoapNote] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });
  const [status, setStatus] = useState('ready'); // ready | listening | processing | signed
  const [recognition, setRecognition] = useState(null);

  // Browser Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recog = new SpeechRecognitionAPI();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' ';
        }
      }
      if (finalText) {
        setTranscript(prev => [...prev, {
          speaker: 'Doctor',
          text: finalText.trim()
        }]);
      }
    };

    setRecognition(recog);
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  // Generate Documentation from transcript
  const generateDocumentation = async () => {
    if (transcript.length === 0) {
      alert("Please start recording the conversation first.");
      return;
    }

    setStatus('processing');

    try {
      const res = await apiClient.post('/process_text_encounter', {
        text_log: transcript,
        specialty: 'GENERAL_PRACTICE'
      });

      const aiSoap = res.data.documentation?.soap_note || {};

      // Flatten to match the simple UI in the screenshot
      setSoapNote({
        subjective: `${aiSoap.subjective?.cc || ''}\n${aiSoap.subjective?.hpi || ''}`.trim(),
        objective:  aiSoap.objective?.exam || '',
        assessment: aiSoap.assessment?.narrative || '',
        plan:       aiSoap.plan?.instructions || ''
      });

      setStatus('ready');
    } catch (err) {
      alert('Failed to generate documentation: ' + (err.response?.data?.message || err.message));
      setStatus('ready');
    }
  };

  // Save to EMR (your existing /sign_encounter endpoint)
  const saveToEMR = async () => {
    const payload = {
      soap_note: {
        subjective: { cc: '', hpi: soapNote.subjective },
        objective:  { exam: soapNote.objective },
        assessment: { narrative: soapNote.assessment },
        plan:       { instructions: soapNote.plan }
      },
      patient_name: patient,
      date,
      time,
      visit_type: type,
      transcript: transcript,
      timestamp: new Date().toISOString()
    };

    try {
      await apiClient.post('/sign_encounter', payload);
      alert('✅ Saved to EMR successfully!');
      setStatus('signed');
      setTimeout(() => window.close(), 1200);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const printDocument = () => window.print();
  const exportPDF = () => alert('PDF export coming soon...');

  return (
    <div className="min-h-screen bg-[#f0f4ff] py-8 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Real-time Encounter Documentation
        </h1>

        {/* Doctor–Patient Conversation Card */}
        <div className="bg-white rounded-3xl shadow p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Doctor–Patient Conversation</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[180px] text-sm overflow-y-auto">
            {transcript.length === 0 ? (
              <p className="text-gray-400 italic">
                Live conversation transcription appears here...
              </p>
            ) : (
              transcript.map((entry, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <span className="font-medium text-teal-600">{entry.speaker}:</span>{' '}
                  {entry.text}
                </div>
              ))
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={toggleListening}
              className={`flex-1 py-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-3 transition-all ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff size={24} /> Stop Recording
                </>
              ) : (
                <>
                  <Mic size={24} /> Start Recording
                </>
              )}
            </button>

            <button
              onClick={generateDocumentation}
              disabled={status === 'processing' || transcript.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-3 disabled:opacity-70"
            >
              🤖 Generate Documentation
            </button>
          </div>
        </div>

        {/* AI-Generated Clinical Notes */}
        <div className="bg-white rounded-3xl shadow p-8">
          <h2 className="text-xl font-semibold mb-6">AI-Generated Clinical Notes (Editable)</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SUBJECTIVE */}
            <div>
              <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-2">SUBJECTIVE</label>
              <textarea
                value={soapNote.subjective}
                onChange={(e) => setSoapNote(prev => ({ ...prev, subjective: e.target.value }))}
                className="w-full h-40 border border-gray-200 rounded-2xl p-5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Patient's symptoms and concerns..."
              />
            </div>

            {/* OBJECTIVE */}
            <div>
              <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-2">OBJECTIVE</label>
              <textarea
                value={soapNote.objective}
                onChange={(e) => setSoapNote(prev => ({ ...prev, objective: e.target.value }))}
                className="w-full h-40 border border-gray-200 rounded-2xl p-5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Clinical observations..."
              />
            </div>

            {/* ASSESSMENT */}
            <div>
              <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-2">ASSESSMENT</label>
              <textarea
                value={soapNote.assessment}
                onChange={(e) => setSoapNote(prev => ({ ...prev, assessment: e.target.value }))}
                className="w-full h-40 border border-gray-200 rounded-2xl p-5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Diagnosis..."
              />
            </div>

            {/* PLAN */}
            <div>
              <label className="block text-xs font-semibold tracking-widest text-gray-500 mb-2">PLAN</label>
              <textarea
                value={soapNote.plan}
                onChange={(e) => setSoapNote(prev => ({ ...prev, plan: e.target.value }))}
                className="w-full h-40 border border-gray-200 rounded-2xl p-5 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Treatment plan..."
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={saveToEMR}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-medium shadow-sm"
          >
            <Save size={20} />
            Save to EMR
          </button>

          <button
            onClick={printDocument}
            className="bg-white border border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-2xl flex items-center gap-2 font-medium"
          >
            🖨️ Print
          </button>

          <button
            onClick={exportPDF}
            className="bg-white border border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-2xl flex items-center gap-2 font-medium"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncounterDocumentation;