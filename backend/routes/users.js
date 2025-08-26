const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (user can update own profile)
router.put('/:id', [
  protect,
  checkOwnership('User'),
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/),
  body('dateOfBirth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('address').optional().isObject(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('address.country').optional().trim(),
  body('emergencyContact').optional().isObject(),
  body('emergencyContact.name').optional().trim(),
  body('emergencyContact.phone').optional().trim(),
  body('emergencyContact.relationship').optional().trim()
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
      'name', 'phone', 'dateOfBirth', 'gender', 'address', 'emergencyContact'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @desc    Upload profile picture
// @route   PUT /api/users/:id/profile-picture
// @access  Private (user can update own profile)
router.put('/:id/profile-picture', [
  protect,
  checkOwnership('User'),
  upload.single('profilePicture')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a profile picture' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
          transformation: [
            { width: 400, height: 400, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error while uploading profile picture' });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private (user can delete own account)
router.delete('/:id', [
  protect,
  checkOwnership('User'),
  body('password').notEmpty().withMessage('Password is required to confirm deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { password } = req.body;
    const user = await User.findById(req.params.id).select('+password');

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Soft delete - mark as inactive
    await User.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private (user can view own stats)
router.get('/:id/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can access these stats
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these statistics' });
    }

    let stats = {};

    if (user.role === 'patient') {
      // Get patient statistics
      const Appointment = require('../models/Appointment');
      const Payment = require('../models/Payment');

      const appointmentStats = await Appointment.aggregate([
        { $match: { patient: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const paymentStats = await Payment.aggregate([
        { $match: { patient: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      stats = {
        appointments: appointmentStats,
        payments: paymentStats
      };
    } else if (user.role === 'doctor') {
      // Get doctor statistics
      const Appointment = require('../models/Appointment');
      const Review = require('../models/Review');

      const appointmentStats = await Appointment.aggregate([
        { $match: { doctor: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const reviewStats = await Review.aggregate([
        { $match: { doctor: user._id } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ]);

      stats = {
        appointments: appointmentStats,
        reviews: reviewStats[0] || { totalReviews: 0, averageRating: 0 }
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
});

// @desc    Search users (admin only)
// @route   GET /api/users/search
// @access  Private (admin only)
router.get('/search', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const { query, role, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status !== undefined) filter.isActive = status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

module.exports = router;
