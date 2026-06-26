import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';

function AdminRoutes() {
  return (
    <AdminRoute>
      <Outlet />
    </AdminRoute>
  );
}

export default AdminRoutes;
