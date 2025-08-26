const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  appointmentType: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  consultationType: {
    type: String,
    enum: ['general', 'follow-up', 'emergency', 'routine'],
    default: 'general'
  },
  symptoms: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  doctorNotes: {
    type: String,
    trim: true
  },
  prescription: {
    type: String,
    trim: true
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  meetingLink: {
    type: String
  },
  meetingPassword: {
    type: String
  },
  isRescheduled: {
    type: Boolean,
    default: false
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  appointmentDateTime.setHours(parseInt(this.appointmentTime.split(':')[0]));
  appointmentDateTime.setMinutes(parseInt(this.appointmentTime.split(':')[1]));
  return appointmentDateTime < now;
});

// Virtual for appointment duration (assuming 30 minutes by default)
appointmentSchema.virtual('duration').get(function() {
  return 30; // minutes
});

// Method to check if time slot is available
appointmentSchema.statics.isTimeSlotAvailable = async function(doctorId, appointmentDate, appointmentTime) {
  const existingAppointment = await this.findOne({
    doctor: doctorId,
    appointmentDate: appointmentDate,
    appointmentTime: appointmentTime,
    status: { $in: ['pending', 'confirmed'] }
  });
  return !existingAppointment;
};

// Method to get doctor's availability for a specific date
appointmentSchema.statics.getDoctorAvailability = async function(doctorId, date) {
  const appointments = await this.find({
    doctor: doctorId,
    appointmentDate: date,
    status: { $in: ['pending', 'confirmed'] }
  });
  
  // This would typically integrate with the doctor's availability schedule
  // For now, return booked times
  return appointments.map(apt => apt.appointmentTime);
};

module.exports = mongoose.model('Appointment', appointmentSchema);
