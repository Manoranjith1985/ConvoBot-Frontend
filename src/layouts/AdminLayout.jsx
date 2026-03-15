// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSideMenu from '../components/AdminComponents/AdminSideMenu';
import AdminHeader from '../components/AdminComponents/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Fixed Sidebar */}
      <AdminSideMenu />

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        <AdminHeader />
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;