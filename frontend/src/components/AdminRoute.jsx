import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

function AdminRoute() {
  const { token, user } = useSelector((state) => state.auth);
  const location = useLocation();
  if (!token || user?.role !== 'admin') return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export default AdminRoute;
