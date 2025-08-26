import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  AlertCircle,
  ChevronLeft,
  CreditCard,
  Shield
} from 'lucide-react';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  // Mock doctor data
  const mockDoctor = {
    id: 1,
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology',
    image: '/images/doctor-1.jpg',
    rating: 4.9,
    reviews: 127,
    experience: '15 years',
    location: 'Main Hospital, Downtown - Room 302',
    fee: 150,
    education: 'Harvard Medical School',
    languages: ['English', 'Mandarin'],
    about: 'Board-certified cardiologist with extensive experience in preventive cardiology and heart disease management. Specializes in echocardiography and cardiac rehabilitation.'
  };

  // Mock available time slots
  const mockTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  useEffect(() => {
    // Simulate loading doctor data
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDoctor(mockDoctor);
      setAvailableSlots(mockTimeSlots);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [doctorId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data) => {
    console.log('Appointment booked:', {
      ...data,
      doctor: doctor.name,
      date: selectedDate,
      time: selectedTime,
      fee: doctor.fee
    });
    // Here you would typically send the data to your backend
    nextStep();
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
              <p className="text-primary-600">{doctor.specialty}</p>
              <p className="text-gray-600 text-sm">{doctor.location}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepNumber 
                      ? 'bg-primary-600 text-white' 
                      : step > stepNumber 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-green-600' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className={step >= 1 ? 'text-primary-600 font-medium' : ''}>Date & Time</span>
              <span className={step >= 2 ? 'text-primary-600 font-medium' : ''}>Details</span>
              <span className={step >= 3 ? 'text-primary-600 font-medium' : ''}>Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Date & Time Selection */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="font-medium text-gray-900 mb-4">Choose a Date</h3>
              <div className="grid grid-cols-7 gap-2">
                {['2024-02-19', '2024-02-20', '2024-02-21', '2024-02-22', '2024-02-23'].map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg text-center ${
                      selectedDate === date
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(date).getDate()}
                    </div>
                    <div className="text-xs">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-4 gap-3">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`p-3 rounded-lg text-center ${
                        selectedTime === time
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                disabled={!selectedDate || !selectedTime}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Patient Details */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  {...register('reason', { required: 'Please specify the reason for your visit' })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                    errors.reason ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your symptoms or reason for the appointment..."
                />
                {errors.reason && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.reason.message}
                  </p>
                )}
              </div>

              {/* Appointment Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Appointment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-medium">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">${doctor.fee}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm p-6 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your appointment with {doctor.name} has been successfully scheduled.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Specialty:</span>
                  <span className="font-medium">{doctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{doctor.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-medium">${doctor.fee}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to your email address with all the details. 
              Please arrive 15 minutes before your scheduled appointment time.
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate('/doctors')}
                className="border border-primary-600 text-primary-600 px-6 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Book Another
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
