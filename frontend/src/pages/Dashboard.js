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
  Stethoscope
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for dashboard
  const dashboardData = {
    overview: {
      appointments: {
        total: 12,
        upcoming: 3,
        completed: 9
      },
      health: {
        lastCheckup: '2024-01-15',
        nextAppointment: '2024-02-20',
        healthScore: 85
      },
      notifications: 5
    },
    recentActivity: [
      {
        id: 1,
        type: 'appointment',
        title: 'Appointment with Dr. Smith',
        description: 'Annual checkup completed',
        date: '2024-01-15',
        time: '10:30 AM',
        status: 'completed'
      },
      {
        id: 2,
        type: 'prescription',
        title: 'New prescription',
        description: 'Medication refill approved',
        date: '2024-01-14',
        status: 'processed'
      },
      {
        id: 3,
        type: 'message',
        title: 'Message from Dr. Johnson',
        description: 'Follow-up instructions',
        date: '2024-01-13',
        status: 'unread'
      }
    ],
    upcomingAppointments: [
      {
        id: 1,
        doctor: 'Dr. Sarah Chen',
        specialty: 'Cardiology',
        date: '2024-02-20',
        time: '2:00 PM',
        location: 'Main Hospital - Room 302'
      },
      {
        id: 2,
        doctor: 'Dr. Michael Rodriguez',
        specialty: 'Dermatology',
        date: '2024-02-25',
        time: '11:30 AM',
        location: 'Skin Care Center'
      }
    ]
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.name || 'User'}! Here's your health overview.
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
              <span>+2 from last month</span>
            </div>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.appointments.upcoming}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/appointments" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                View schedule <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.overview.health.healthScore}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${dashboardData.overview.health.healthScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Doctors Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Doctors</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/doctors" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                Find doctors <ArrowUpRight className="w-4 h-4 ml-1" />
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
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
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
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{appointment.doctor}</h3>
                        <p className="text-sm text-gray-600">{appointment.specialty}</p>
                        <p className="text-sm text-gray-500">{appointment.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{appointment.date}</p>
                      <p className="text-sm text-gray-600">{appointment.time}</p>
                      <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm">
                        View details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {dashboardData.upcomingAppointments.length === 0 && (
                <div className="text-center py-12">
                  <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming appointments</p>
                  <Link 
                    to="/doctors" 
                    className="inline-block mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Book Appointment
                  </Link>
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
                  <span className="font-medium text-gray-900">Book Appointment</span>
                </Link>
                <Link
                  to="/doctors"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Find Doctors</span>
                </Link>
                <Link
                  to="/prescriptions"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <FileText className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Prescriptions</span>
                </Link>
                <Link
                  to="/reviews"
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
                >
                  <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <span className="font-medium text-gray-900">Write Review</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'appointment' ? 'bg-blue-100' :
                      activity.type === 'prescription' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                      {activity.type === 'prescription' && <FileText className="w-4 h-4 text-green-600" />}
                      {activity.type === 'message' && <Bell className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}{activity.time && ` • ${activity.time}`}</p>
                    </div>
                    {activity.status === 'unread' && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                ))}
              </div>

              {dashboardData.recentActivity.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No recent activity</p>
                </div>
              )}
            </div>

            {/* Health Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6"
            >
              <h3 className="font-semibold text-blue-900 mb-3">Health Tip of the Day</h3>
              <p className="text-blue-800 text-sm mb-4">
                Stay hydrated! Drinking enough water helps maintain the balance of body fluids, 
                which helps transportation of nutrients, regulation of temperature, and more.
              </p>
              <div className="flex items-center text-xs text-blue-700">
                <Heart className="w-4 h-4 mr-1" />
                From your healthcare team
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
