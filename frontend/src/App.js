import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorSearch from './pages/DoctorSearch';
import DoctorProfile from './pages/DoctorProfile';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import Contact from './pages/Contact';
import OAuthSuccess from './pages/OAuthSuccess';

// Protected Pages
import Dashboard from './pages/Dashboard';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Payment from './pages/Payment';
import Reviews from './pages/Reviews';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/login" element={<Layout><Login /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/doctors" element={<Layout><DoctorSearch /></Layout>} />
                <Route path="/doctors/:id" element={<Layout><DoctorProfile /></Layout>} />
                <Route path="/blog" element={<Layout><Blog /></Layout>} />
                <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><Dashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/patient-dashboard" element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Layout><PatientDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/doctor-dashboard" element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <Layout><DoctorDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Layout><AdminDashboard /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <Layout><Appointments /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/book-appointment/:doctorId" element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Layout><BookAppointment /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/payment/:appointmentId" element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <Layout><Payment /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/reviews" element={
                  <ProtectedRoute>
                    <Layout><Reviews /></Layout>
                  </ProtectedRoute>
                } />

                <Route path="/oauth-success" element={<Layout><OAuthSuccess /></Layout>} />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <Layout>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                        <p className="text-xl text-gray-600 mb-8">Page not found</p>
                        <a 
                          href="/" 
                          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Go Home
                        </a>
                      </div>
                    </div>
                  </Layout>
                } />
              </Routes>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
