const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize, checkOwnership, canBookAppointment } = require('../middleware/auth');

// @desc    Book appointment
// @route   POST /api/appointments
// @access  Private (patient only)
router.post('/', [
  protect,
  authorize('patient'),
  canBookAppointment,
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid appointment time is required'),
  body('appointmentType').isIn(['online', 'offline']).withMessage('Appointment type must be online or offline'),
  body('consultationType').optional().isIn(['general', 'follow-up', 'emergency', 'routine']),
  body('symptoms').optional().trim().isLength({ max: 500 }),
  body('notes').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      consultationType = 'general',
      symptoms,
      notes
    } = req.body;

    // Get doctor details
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if doctor offers the requested appointment type
    if (appointmentType === 'online' && !doctor.onlineConsultation) {
      return res.status(400).json({ message: 'Doctor does not offer online consultations' });
    }

    if (appointmentType === 'offline' && !doctor.offlineConsultation) {
      return res.status(400).json({ message: 'Doctor does not offer offline consultations' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      consultationType,
      symptoms,
      notes,
      consultationFee: doctor.consultationFee
    });

    // Populate doctor and patient details
    await appointment.populate([
      { path: 'doctor', select: 'name specialization hospital city profilePicture' },
      { path: 'patient', select: 'name email phone profilePicture' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error while booking appointment' });
  }
});

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient
// @access  Private (patient only)
router.get('/patient', [
  protect,
  authorize('patient'),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']),
  query('date').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, date, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { patient: req.user._id };
    if (status) filter.status = status;
    if (date) filter.appointmentDate = new Date(date);

    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization hospital city profilePicture')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private (patient, doctor, or admin)
router.get('/:id', [
  protect
], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone profilePicture')
      .populate('doctor', 'name specialization hospital city profilePicture');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.role !== 'admin' && 
        appointment.patient.toString() !== req.user._id.toString() && 
        appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this appointment' });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
});

// @desc    Update appointment status (doctor only)
// @route   PUT /api/appointments/:id/status
// @access  Private (doctor only)
router.put('/:id/status', [
  protect,
  authorize('doctor'),
  body('status').isIn(['confirmed', 'cancelled', 'completed', 'rejected']).withMessage('Valid status is required'),
  body('doctorNotes').optional().trim().isLength({ max: 1000 }),
  body('prescription').optional().trim().isLength({ max: 1000 }),
  body('followUpDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { status, doctorNotes, prescription, followUpDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if doctor owns this appointment
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Update appointment
    const updateData = { status };
    if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes;
    if (prescription !== undefined) updateData.prescription = prescription;
    if (followUpDate !== undefined) updateData.followUpDate = followUpDate;

    // Set cancelledBy if cancelling
    if (status === 'cancelled') {
      updateData.cancelledBy = 'doctor';
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email phone profilePicture' },
      { path: 'doctor', select: 'name specialization hospital city profilePicture' }
    ]);

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error while updating appointment status' });
  }
});

// @desc    Cancel appointment (patient only)
// @route   PUT /api/appointments/:id/cancel
// @access  Private (patient only)
router.put('/:id/cancel', [
  protect,
  authorize('patient'),
  body('cancellationReason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if patient owns this appointment
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Check if appointment can be cancelled
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Appointment cannot be cancelled' });
    }

    // Check if appointment is in the future
    const appointmentDateTime = new Date(appointment.appointmentDate);
    appointmentDateTime.setHours(parseInt(appointment.appointmentTime.split(':')[0]));
    appointmentDateTime.setMinutes(parseInt(appointment.appointmentTime.split(':')[1]));

    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({ message: 'Cannot cancel past appointments' });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancellationReason,
        cancelledBy: 'patient'
      },
      { new: true, runValidators: true }
    ).populate([
      { path: 'patient', select: 'name email phone profilePicture' },
      { path: 'doctor', select: 'name specialization hospital city profilePicture' }
    ]);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: updatedAppointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error while cancelling appointment' });
  }
});

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private (patient or doctor)
router.put('/:id/reschedule', [
  protect,
  body('newDate').isISO8601().withMessage('Valid new date is required'),
  body('newTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid new time is required'),
  body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { newDate, newTime, reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (req.user.role !== 'admin' && 
        appointment.patient.toString() !== req.user._id.toString() && 
        appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
    }

    // Check if new time slot is available
    const isAvailable = await Appointment.isTimeSlotAvailable(
      appointment.doctor,
      newDate,
      newTime
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    // Check if new date/time is in the future
    const newDateTime = new Date(newDate);
    newDateTime.setHours(parseInt(newTime.split(':')[0]));
    newDateTime.setMinutes(parseInt(newTime.split(':')[1]));

    if (newDateTime <= new Date()) {
      return res.status(400).json({ message: 'Cannot reschedule to past date/time' });
    }

    // Create new appointment and mark old one as rescheduled
    const newAppointment = await Appointment.create({
      patient: appointment.patient,
      doctor: appointment.doctor,
      appointmentDate: newDate,
      appointmentTime: newTime,
      appointmentType: appointment.appointmentType,
      consultationType: appointment.consultationType,
      symptoms: appointment.symptoms,
      notes: appointment.notes,
      consultationFee: appointment.consultationFee,
      isRescheduled: true,
      rescheduledFrom: appointment._id
    });

    // Update old appointment
    await Appointment.findByIdAndUpdate(appointment._id, {
      status: 'cancelled',
      cancellationReason: reason || 'Appointment rescheduled',
      cancelledBy: req.user.role
    });

    // Populate new appointment
    await newAppointment.populate([
      { path: 'patient', select: 'name email phone profilePicture' },
      { path: 'doctor', select: 'name specialization hospital city profilePicture' }
    ]);

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: newAppointment
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Server error while rescheduling appointment' });
  }
});

// @desc    Get appointment calendar (doctor only)
// @route   GET /api/appointments/calendar/:doctorId
// @access  Private (doctor only)
router.get('/calendar/:doctorId', [
  protect,
  authorize('doctor'),
  checkOwnership('User'),
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { startDate, endDate } = req.query;

    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
      appointmentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .populate('patient', 'name profilePicture')
    .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error while fetching calendar' });
  }
});

module.exports = router;
