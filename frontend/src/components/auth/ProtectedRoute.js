import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles = [], requireVerification = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl shadow-large p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. This area is restricted to{' '}
            {allowedRoles.length === 1 
              ? allowedRoles[0] 
              : allowedRoles.slice(0, -1).join(', ') + ' and ' + allowedRoles.slice(-1)
            }.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if user verification is required
  if (requireVerification && !user?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl shadow-large p-8 text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please verify your email address before accessing this feature. 
            Check your inbox for a verification link.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/profile'}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Go to Profile
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if user account is active
  if (!user?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-xl shadow-large p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Account Suspended
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been suspended. Please contact support for assistance.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/contact'}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
