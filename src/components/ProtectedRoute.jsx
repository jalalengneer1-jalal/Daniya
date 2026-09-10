import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/AsyncState';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <div className="grid min-h-screen place-items-center"><LoadingState /></div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
