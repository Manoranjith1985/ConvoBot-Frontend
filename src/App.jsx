import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthPage from './pages/AuthPage/AuthPage.jsx';
import DashboardSelection from './pages/SelectionDashboard/SelectionDashboard.jsx';

import OPLayout from './layouts/OPLayout.jsx';
import OPDashboard from './pages/OPDashboard/OPDashboard.jsx';
import NewAppointment from './pages/OPDashboard/NewAppointment.jsx';
import OPPatients from './pages/OPDashboard/OPPatients.jsx';
import OPDoctors from './pages/OPDashboard/OPDoctors.jsx';

import DoctorLayout from './layouts/DoctorLayout.jsx';
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard.jsx';
import DoctorSchedule from './pages/DoctorDashboard/DoctorSchedule.jsx';
import Patients from './pages/DoctorDashboard/DoctorPatients.jsx';
import EncounterDocumentation from './pages/DoctorDashboard/EncounterDocumentation.jsx';
import DoctorProfile from './pages/DoctorDashboard/DoctorProfile.jsx';


import AdminLayout from './layouts/AdminLayout.jsx';
import ClinicAdminDashboard from './pages/ClinicAdmin/ClinicAdminDashboard.jsx';
import AdminDoctors from './pages/ClinicAdmin/AdminDoctorsPage.jsx';
import AdminPatients from './pages/ClinicAdmin/AdminPatientsPage.jsx';
import AdminSchedules from './pages/ClinicAdmin/AdminSchedulesPage.jsx';
import AdminAuditTrailPage from './pages/ClinicAdmin/AdminAuditTrailPage.jsx';
import AdminMastersPage from './pages/ClinicAdmin/AdminMastersPage.jsx';
import AdminReportsPage from './pages/ClinicAdmin/AdminReportsPage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/select-role" element={<DashboardSelection />} />
        <Route path="/encounter-documentation" element={<EncounterDocumentation />} />


        {/* === OP RECEPTION ROUTES (New Layout) === */}
        <Route element={<OPLayout />}>
          <Route path="/op-dashboard" element={<OPDashboard />} />
          <Route path="/new-appointment" element={<NewAppointment />} />
          <Route path="/op-patients" element={<OPPatients />} />
          <Route path="/op-doctors" element={<OPDoctors />} />
        </Route>

        {/* Doctor Routes */}
        <Route element={<DoctorLayout />}>
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor-schedule" element={<DoctorSchedule />} />
          <Route path="/doctor-patients" element={<Patients />} />
          <Route path="/doctor-profile" element={<DoctorProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/clinic-admin" element={<ClinicAdminDashboard />} />
          <Route path="/admin-doctors" element={<AdminDoctors />} />
          <Route path="/admin-patients" element={<AdminPatients />} />
          <Route path="/admin-schedules" element={<AdminSchedules />} />
          <Route path="/admin-masters" element={<AdminMastersPage />} />
          <Route path="/admin-reports" element={<AdminReportsPage />} />
          <Route path="/admin-trails" element={<AdminAuditTrailPage />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;