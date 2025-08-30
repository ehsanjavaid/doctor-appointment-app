import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect based on user role
  if (user?.role === 'doctor') {
    return <Navigate to="/doctor-dashboard" replace />;
  } else if (user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  } else if (user?.role === 'patient') {
    return <Navigate to="/patient-dashboard" replace />;
  }

  // Fallback - should not happen if user has a valid role
  return <Navigate to="/" replace />;
};

export default Dashboard;
