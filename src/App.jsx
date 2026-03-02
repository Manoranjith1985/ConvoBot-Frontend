import React from 'react';
// 💡 Ensure all necessary components are imported for routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; 
import AuthPage from './pages/AuthPage/AuthPage.jsx';
import DashboardSelection from './pages/SelectionDashboard/SelectionDashboard.jsx';
import OPDashboard from './pages/OPDashboard/OPDashboard.jsx';
import NewAppointment from './pages/OPDashboard/NewAppointment.jsx';
import DoctorLayout from './layouts/DoctorLayout.jsx';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard.jsx';
import DoctorSchedule from './pages/DoctorDashboard/DoctorSchedule.jsx';
import Patients from './pages/DoctorDashboard/DoctorPatients.jsx';
import EncounterDocumentation from './pages/DoctorDashboard/EncounterDocumentation.jsx';
import DoctorProfile from './pages/DoctorDashboard/DoctorProfile.jsx';

function App() {
  return (
    // 💡 BrowserRouter is essential for the router to work
    <Router> 
      <Routes>
        {/* Redirect: Navigates to the Dashboard by default */}
        <Route path="/" element={< AuthPage />} />
        <Route path="/select-role" element={< DashboardSelection />} />
        <Route path="/op-dashboard" element={< OPDashboard />} />
        <Route path="/new-appointment" element={<NewAppointment />} />
        <Route path="/encounter-documentation" element={< EncounterDocumentation />} />
        <Route element={<DoctorLayout />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule/>} />
          <Route path="/doctor-patients" element={<Patients />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} /> 

        </Route>
      </Routes>
    </Router>
  );
}

export default App;