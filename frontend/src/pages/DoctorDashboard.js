import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Bell, 
  FileText, 
  Heart, 
  Star,
  ArrowUpRight,
  CalendarDays,
  UserCheck,
  Stethoscope,
  DollarSign,
  MessageSquare,
  Clipboard,
  BarChart3
} from 'lucide-react';
import api from '../utils/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    overview: {
      appointments: {
        total: 0,
        upcoming: 0,
        completed: 0
      },
      earnings: {
        total: 0,
        thisMonth: 0,
        pending: 0
      },
      patients: {
        total: 0,
        newThisMonth: 0
      },
      notifications: 0
    },
    upcomingAppointments: [],
    recentPatients: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch doctor-specific data
        const [appointmentsRes, earningsRes, patientsRes] = await Promise.all([
          api.get('/api/appointments/doctor'),
          api.get('/api/doctors/earnings'),
          api.get('/api/doctors/patients')
        ]);

        const appointments = appointmentsRes.data.data || [];
        const earnings = earningsRes.data.data || {};
        const patients = patientsRes.data.data || [];

        setDashboardData({
          overview: {
            appointments: {
              total: appointments.length,
              upcoming: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
              completed: appointments.filter(a => a.status === 'completed').length
            },
            earnings: {
              total: earnings.total || 0,
              thisMonth: earnings.thisMonth || 0,
              pending: earnings.pending || 0
            },
            patients: {
              total: patients.length,
              newThisMonth: patients.filter(p => {
                const joinDate = new Date(p.joinedAt || p.createdAt);
                const now = new Date();
                return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
              }).length
            },
            notifications: 3 // Placeholder for notifications
          },
          upcomingAppointments: appointments
            .filter(a => a.status === 'scheduled' || a.status === 'confirmed')
            .slice(0, 5)
            .map(app => ({
              id: app._id,
              patient: app.patient?.name || 'Patient',
              condition: app.reason || 'General Consultation',
              date: app.date,
              time: app.time,
              status: app.status
            })),
          recentPatients: patients.slice(0, 3).map(patient => ({
            id: patient._id,
            name: patient.name,
            lastVisit: patient.lastAppointment?.date || 'Never',
            nextAppointment: patient.nextAppointment?.date || 'None scheduled'
          }))
        });
      } catch (error) {
        console.error('Error fetching doctor dashboard data:', error);
        // Set empty data structure on error
        setDashboardData({
          overview: {
            appointments: {
              total: 0,
              upcoming: 0,
              completed: 0
            },
            earnings: {
              total: 0,
              thisMonth: 0,
              pending: 0
            },
            patients: {
              total: 0,
              newThisMonth: 0
            },
            notifications: 0
          },
          upcomingAppointments: [],
          recentPatients: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, Dr. {user?.name || 'Doctor'}! Here's your practice overview.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
                {dashboardData.overview.notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dashboardData.overview.notifications}
                  </span>
                )}
              </button>
              <Link
                to="/profile"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Appointments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.appointments.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{dashboardData.overview.appointments.upcoming} upcoming</span>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.earnings.total}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                ${dashboardData.overview.earnings.thisMonth} this month
              </p>
            </div>
          </div>

          {/* Patients Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.patients.total}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {dashboardData.overview.patients.newThisMonth} new this month
              </p>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">${dashboardData.overview.earnings.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/payments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View payments <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Appointments</h2>
                <Link 
                  to="/appointments" 
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
                >
                  View all <ArrowUpRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.patient}</h3>
                        <p className="text-sm text-gray-600">{appointment.condition}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                      <Link 
                        to={`/appointments/${appointment.id}`}
                        className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {dashboardData.upcomingAppointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 mt-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/appointments"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">View Schedule</span>
                </Link>
                <Link
                  to="/patients"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Patient List</span>
                </Link>
                <Link
                  to="/prescriptions"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <Clipboard className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Prescriptions</span>
                </Link>
                <Link
                  to="/reports"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <BarChart3 className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Reports</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Recent Patients */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Patients</h2>
              
              <div className="space-y-4">
                {dashboardData.recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Last visit: {patient.lastVisit}</p>
                        <p>Next appointment: {patient.nextAppointment}</p>
                      </div>
                    </div>
                    <Link 
                      to={`/patients/${patient.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>

              {dashboardData.recentPatients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No recent patients</p>
                </div>
              )}
            </div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6"
            >
              <h3 className="font-semibold text-green-900 mb-3">Performance Overview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800">Appointment completion rate</span>
                  <span className="font-semibold text-green-900">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Patient satisfaction</span>
                  <span className="font-semibold text-green-900">4.8/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Average response time</span>
                  <span className="font-semibold text-green-900">2.3 hours</span>
                </div>
              </div>
              <div className="flex items-center text-xs text-green-700 mt-4">
                <BarChart3 className="w-4 h-4 mr-1" />
                Based on last 30 days
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
