const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Review = require('../models/Review');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

// @desc    Get all doctors with search and filters
// @route   GET /api/doctors
// @access  Public
router.get('/', [
  query('search').optional().trim(),
  query('specialization').optional().trim(),
  query('city').optional().trim(),
  query('hospital').optional().trim(),
  query('minFee').optional().isFloat({ min: 0 }),
  query('maxFee').optional().isFloat({ min: 0 }),
  query('online').optional().isBoolean(),
  query('offline').optional().isBoolean(),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('sort').optional().isIn(['name', 'rating', 'experience', 'consultationFee', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
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

    const {
      search,
      specialization,
      city,
      hospital,
      minFee,
      maxFee,
      online,
      offline,
      rating,
      sort = 'rating',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build filter query
    const filter = {
      role: 'doctor',
      isActive: true,
      isVerified: true
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }

    if (hospital) {
      filter.hospital = { $regex: hospital, $options: 'i' };
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = parseFloat(minFee);
      if (maxFee) filter.consultationFee.$lte = parseFloat(maxFee);
    }

    if (online !== undefined) {
      filter.onlineConsultation = online === 'true';
    }

    if (offline !== undefined) {
      filter.offlineConsultation = offline === 'true';
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    // Build sort query
    const sortQuery = {};
    sortQuery[sort] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const doctors = await User.find(filter)
      .select('name specialization experience hospital city consultationFee rating totalReviews profilePicture onlineConsultation offlineConsultation')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
});

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (!doctor.isActive) {
      return res.status(404).json({ message: 'Doctor profile is not available' });
    }

    // Get doctor's reviews
    const reviews = await Review.find({ doctor: doctor._id, isHidden: false })
      .populate('patient', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get doctor's availability for next 7 days
    const availability = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dayAvailability = doctor.availability.find(av => av.day === dayName);
      
      if (dayAvailability) {
        availability.push({
          date: date.toISOString().split('T')[0],
          day: dayName,
          slots: dayAvailability.slots
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...doctor.toObject(),
        reviews,
        availability
      }
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ message: 'Server error while fetching doctor' });
  }
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (doctor only)
router.put('/:id', [
  protect,
  authorize('doctor'),
  checkOwnership('User'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('specialization').optional().trim(),
  body('experience').optional().isInt({ min: 0 }),
  body('education').optional().trim(),
  body('hospital').optional().trim(),
  body('city').optional().trim(),
  body('consultationFee').optional().isFloat({ min: 0 }),
  body('onlineConsultation').optional().isBoolean(),
  body('offlineConsultation').optional().isBoolean(),
  body('availability').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const allowedFields = [
      'name', 'phone', 'specialization', 'experience', 'education',
      'hospital', 'city', 'consultationFee', 'onlineConsultation',
      'offlineConsultation', 'availability', 'address'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @desc    Get doctor's appointments
// @route   GET /api/doctors/:id/appointments
// @access  Private (doctor only)
router.get('/:id/appointments', [
  protect,
  authorize('doctor'),
  checkOwnership('User'),
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
    const filter = { doctor: req.params.id };
    if (status) filter.status = status;
    if (date) filter.appointmentDate = new Date(date);

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone profilePicture')
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
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
});

// @desc    Get doctor's availability
// @route   GET /api/doctors/:id/availability
// @access  Public
router.get('/:id/availability', [
  query('date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const doctor = await User.findById(req.params.id)
      .select('availability onlineConsultation offlineConsultation');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const { date } = req.query;
    let availability = doctor.availability;

    if (date) {
      const targetDate = new Date(date);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      availability = doctor.availability.filter(av => av.day === dayName);
    }

    res.json({
      success: true,
      data: {
        availability,
        onlineConsultation: doctor.onlineConsultation,
        offlineConsultation: doctor.offlineConsultation
      }
    });

  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({ message: 'Server error while fetching availability' });
  }
});

// @desc    Update doctor's availability
// @route   PUT /api/doctors/:id/availability
// @access  Private (doctor only)
router.put('/:id/availability', [
  protect,
  authorize('doctor'),
  checkOwnership('User'),
  body('availability').isArray().withMessage('Availability must be an array'),
  body('availability.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('availability.*.slots').isArray().withMessage('Slots must be an array'),
  body('availability.*.slots.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availability.*.slots.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('availability.*.slots.*.isAvailable').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { availability } = req.body;

    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { availability },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor.availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error while updating availability' });
  }
});

// @desc    Get doctor statistics
// @route   GET /api/doctors/:id/stats
// @access  Private (doctor only)
router.get('/:id/stats', [
  protect,
  authorize('doctor'),
  checkOwnership('User')
], async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const Payment = require('../models/Payment');

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { $match: { doctor: req.params.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get payment statistics
    const paymentStats = await Payment.getPaymentStats(req.params.id);

    // Get monthly appointments for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Appointment.aggregate([
      {
        $match: {
          doctor: req.params.id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        appointmentStats,
        paymentStats,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
});

module.exports = router;
