// src/layouts/DoctorLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import DoctorHeader from '../components/DoctorHeader';
import DoctorSideMenu from '../components/DoctorSideMenu';

const doctor = {
    name: "Test OP Doctor",
    specialty: "Dentist",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
  };

const DoctorLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased">
      <DoctorSideMenu doctor={doctor} />
      <div className="flex-1 flex flex-col">
        <DoctorHeader />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet /> {/* This will render the child route content, e.g., DoctorDashboard main content */}
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;