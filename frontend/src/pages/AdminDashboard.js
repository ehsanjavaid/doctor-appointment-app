import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      // Mock data for users and appointments
      setUsers([{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Smith' }]);
      setAppointments([{ id: 1, doctor: 'Dr. Smith', date: '2024-02-20' }]);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <p className="text-gray-600 mb-4">Manage users, appointments, and platform settings.</p>

        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <Link to="/add-user" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mb-4 inline-block">
            Add New User
          </Link>
          <ul>
            {users.map(user => (
              <li key={user.id} className="flex justify-between items-center border-b py-2">
                <span>{user.name}</span>
                <div>
                  <Link to={`/edit-user/${user.id}`} className="text-blue-600 hover:underline">Edit</Link>
                  <button className="text-red-600 hover:underline ml-4">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Appointment Management Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Appointment Management</h2>
          <Link to="/appointments" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mb-4 inline-block">
            View All Appointments
          </Link>
          <ul>
            {appointments.map(appointment => (
              <li key={appointment.id} className="flex justify-between items-center border-b py-2">
                <span>{appointment.doctor} - {appointment.date}</span>
                <Link to={`/appointment/${appointment.id}`} className="text-blue-600 hover:underline">View Details</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Platform Settings</h2>
          <Link to="/settings" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
            Manage Settings
          </Link>
        </div>

        {/* Statistics Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Statistics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold">Total Users</h3>
              <p className="text-2xl">2</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold">Total Appointments</h3>
              <p className="text-2xl">1</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold">System Health</h3>
              <p className="text-2xl">Good</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <p>No recent activity available.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
