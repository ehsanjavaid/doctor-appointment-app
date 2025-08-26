import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Appointments = () => {
  const { user } = useAuth(); // eslint-disable-line no-unused-vars
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [showDoctorsList, setShowDoctorsList] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'offline',
    consultationType: 'general'
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/api/appointments/patient');
        setAppointments(response.data.data);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await api.get('/api/doctors');
        setDoctors(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/appointments', newAppointment);
      setAppointments((prev) => [...prev, response.data.data]);
      setNewAppointment({ 
        doctorId: '', 
        doctorName: '', 
        appointmentDate: '', 
        appointmentTime: '', 
        appointmentType: 'offline', 
        consultationType: 'general' 
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add appointment. Please try again.');
    }
  };

  const handleDoctorSelect = (doctor) => {
    setNewAppointment({
      ...newAppointment,
      doctorId: doctor._id,
      doctorName: doctor.name
    });
    setShowDoctorsList(false);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading appointments...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">Appointment Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your medical appointments and schedule new ones</p>
          </div>

          <div className="p-6">
            {/* Add Appointment Form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h2>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Doctor Selection */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor *
                    </label>
                    <input
                      type="text"
                      placeholder="Search for a doctor..."
                      value={newAppointment.doctorName}
                      onClick={() => setShowDoctorsList(true)}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {showDoctorsList && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor._id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                            onClick={() => handleDoctorSelect(doctor)}
                          >
                            <div className="font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-600">
                              {doctor.specialization} • {doctor.hospital}
                            </div>
                            <div className="text-sm text-blue-600">
                              ${doctor.consultationFee} • {doctor.city}
                            </div>
                          </div>
                        ))}
                        {doctors.length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No doctors available
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      value={newAppointment.appointmentDate}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Time *
                    </label>
                    <input
                      type="time"
                      value={newAppointment.appointmentTime}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type *
                    </label>
                    <select
                      value={newAppointment.appointmentType}
                      onChange={(e) => setNewAppointment({ ...newAppointment, appointmentType: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="offline">In-Person</option>
                      <option value="online">Online Consultation</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Schedule Appointment
                </button>
              </form>
            </div>

            {/* Appointments List */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Appointments</h2>
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📅</div>
                  <p className="text-gray-500">No appointments scheduled yet</p>
                  <p className="text-sm text-gray-400 mt-1">Schedule your first appointment above</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {appointments.map((appointment) => (
                    <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {appointment.doctor?.name || 'Unknown Doctor'}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="w-5">📅</span>
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-5">⏰</span>
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-5">🏥</span>
                          <span>{appointment.doctor?.hospital || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-5">💼</span>
                          <span>{appointment.doctor?.specialization || 'General'}</span>
                        </div>
                        {appointment.consultationFee && (
                          <div className="flex items-center">
                            <span className="w-5">💰</span>
                            <span>${appointment.consultationFee}</span>
                          </div>
                        )}
                      </div>

                      {appointment.status === 'pending' && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <button className="text-red-600 text-sm hover:text-red-800">
                            Cancel Appointment
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
