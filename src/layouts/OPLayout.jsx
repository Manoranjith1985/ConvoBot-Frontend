// src/layouts/OPLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import OPSideMenu from '../components/OPComponents/OPSideMenu';
import OPHeader from '../components/OPComponents/OPHeader';

const OPLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Fixed Sidebar */}
      <OPSideMenu />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <OPHeader />
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OPLayout;