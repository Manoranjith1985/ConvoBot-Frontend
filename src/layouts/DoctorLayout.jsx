// src/layouts/DoctorLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import DoctorHeader from '../components/DoctorComponents/DoctorHeader';
import DoctorSideMenu from '../components/DoctorComponents/DoctorSideMenu';

const doctor = {
  name: "Test OP Doctor",
  specialty: "Dentist",
  avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
};

const DoctorLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased overflow-hidden">
      {/* Fixed Sidebar – takes no space in flow */}
      <DoctorSideMenu doctor={doctor} />

      {/* Main content – pushed right by sidebar width */}
      <div className="flex-1 flex flex-col ml-64">  {/* ← THIS LINE FIXES IT: ml-64 matches w-64 */}
        <DoctorHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet /> {/* Child pages (Dashboard, Schedule, Patients, etc.) render here */}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;